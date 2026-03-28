using API.SignalR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Repository.Data;
using Repository.Implementations;
using Repository.Interfaces;
using Repository.Redis;
using Repository.Seeder;
using Service.Implementations;
using Service.Interfaces;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add EF Core DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add Redis Connection
builder.Services.AddSingleton<IRedisConnectionManager>(sp =>
{
    var connectionString = builder.Configuration.GetConnectionString("Redis");
    return new RedisConnectionManager(connectionString);
});

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001", "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Add services to the container.

builder.Services.AddControllers().AddJsonOptions(options =>
{
    // Prevent cycles when serializing EF Core navigation properties
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

builder.Services.AddScoped<IUserRepository, SqlUserRepository>();
builder.Services.AddScoped<IScoreRepository, SqlScoreRepository>();
builder.Services.AddScoped<IRedisScoreRepository, RedisScoreRepository>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IScoreService, ScoreService>();
builder.Services.AddScoped<INotificationService, SignalRNotificationService>();


// Add SignalR
builder.Services.AddSignalR();
// Add JWT Token Service
builder.Services.AddTransient<IJwtTokenService, JwtTokenService>();
// Configure JWT
var jwtSettings = builder.Configuration.GetSection("Jwt");
// Configure Authentication and Authorization
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]))
    };
    // Allow SignalR to receive token via query string when using WebSockets
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

// Configure Authorization
builder.Services.AddAuthorization();

var app = builder.Build();

// Startup: Sync data from SQL to Redis if Redis is empty
using (var scope = app.Services.CreateScope())
{
    try
    {
        var redisRepo = scope.ServiceProvider.GetRequiredService<IRedisScoreRepository>();
        var sqlRepo = scope.ServiceProvider.GetRequiredService<IScoreRepository>();

        if (await redisRepo.IsEmptyAsync())
        {
            var sqlScores = await sqlRepo.GetLeaderboard(0, 10000);
            var scores = sqlScores.Select(s => (s.UserId, s.User.UserName, s.UserScore)).ToList();
            await redisRepo.SyncFromSqlAsync(scores);
            Console.WriteLine($"Synced {scores.Count} scores from SQL to Redis");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Warning: Redis sync failed - {ex.Message}");
    }
}

// Startup: Seed database if empty
using (var scope = app.Services.CreateScope())
{
    try
    {
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await Seed.SeedDataAsync(context);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Warning: Data seeding failed - {ex.Message}");
    }
}

app.UseCors("AllowReactApp");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<LeaderboardHub>("/hubs/leaderboard");

app.Run();
