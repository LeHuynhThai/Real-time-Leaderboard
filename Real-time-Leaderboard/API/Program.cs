using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Repository.Data;
using Repository.Entities;
using Repository.Implementations;
using Repository.Interfaces;
using Repository.Redis;
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

        // Check if database already has data
        if (!context.User.Any() && !context.Score.Any())
        {
            Console.WriteLine("Starting database seeding with 1000 users and scores...");

            var users = new List<User>();
            var scores = new List<Score>();
            var random = new Random();

            // Create 1000 users with scores
            for (int i = 1; i <= 1000; i++)
            {
                var user = new User
                {
                    UserName = $"User{i}",
                    Email = $"user{i}@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword($"Password{i}123"),
                    CreatedAt = DateTime.UtcNow.AddDays(-random.Next(0, 365)),
                    LastLoginAt = DateTime.UtcNow.AddDays(-random.Next(0, 30)),
                    IsActive = true
                };

                users.Add(user);
            }

            // Add users to context
            await context.User.AddRangeAsync(users);
            await context.SaveChangesAsync();

            Console.WriteLine($"Inserted {users.Count} users");

            // Create scores for each user (1-5 scores per user)
            for (int i = 0; i < users.Count; i++)
            {
                int numberOfScores = random.Next(1, 6); // Each user has 1-5 scores

                for (int j = 0; j < numberOfScores; j++)
                {
                    var score = new Score
                    {
                        UserId = users[i].Id,
                        UserScore = random.Next(100, 10001), // Random score between 100-10000
                        CreatedAt = DateTime.UtcNow.AddDays(-random.Next(0, 365)).AddHours(-random.Next(0, 24)),
                        UpdatedAt = DateTime.UtcNow.AddDays(-random.Next(0, 365)).AddHours(-random.Next(0, 24)),
                        Status = SubmissionStatus.Approved
                    };

                    scores.Add(score);
                }
            }

            // Add scores to context
            await context.Score.AddRangeAsync(scores);
            await context.SaveChangesAsync();

            Console.WriteLine($"Inserted {scores.Count} scores for {users.Count} users");
            Console.WriteLine("Database seeding completed successfully!");
        }
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

app.Run();
