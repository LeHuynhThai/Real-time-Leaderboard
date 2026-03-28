using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Repository.Data;
using Repository.Entities;
using Bogus;

Console.WriteLine("=== Database Seeder ===");
Console.WriteLine();

// Read connection string from environment variable
var connectionString = Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING");

if (string.IsNullOrEmpty(connectionString))
{
    Console.WriteLine("Error: DATABASE_CONNECTION_STRING environment variable is not set.");
    Console.WriteLine("Please set the environment variable and try again.");
    Console.WriteLine();
    Console.WriteLine("Example:");
    Console.WriteLine("  $env:DATABASE_CONNECTION_STRING=\"Server=...;Database=...;User Id=...;Password=...;\"");
    Environment.Exit(1);
    return;
}

// Setup DI container
var services = new ServiceCollection();

services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

var serviceProvider = services.BuildServiceProvider();

try
{
    using var scope = serviceProvider.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    // Check if database is unseeded
    Console.WriteLine("Checking database status...");
    var hasUsers = await context.User.AnyAsync();
    var hasScores = await context.Score.AnyAsync();

    if (hasUsers || hasScores)
    {
        Console.WriteLine("Database already contains data. Skipping seeding.");
        Console.WriteLine($"  - Users: {(hasUsers ? "present" : "none")}");
        Console.WriteLine($"  - Scores: {(hasScores ? "present" : "none")}");
        Console.WriteLine();
        Console.WriteLine("Seeder completed successfully (no changes made).");
        Environment.Exit(0);
        return;
    }

    Console.WriteLine("Database is empty. Starting seeding process...");
    Console.WriteLine();

    // Seed users
    Console.WriteLine("Seeding users...");
    var userFaker = new Faker<User>()
        .RuleFor(u => u.UserName, f => f.Internet.UserName())
        .RuleFor(u => u.Email, f => f.Internet.Email())
        .RuleFor(u => u.PasswordHash, f => f.Internet.Password())
        .RuleFor(u => u.CreatedAt, f => f.Date.Past(1))
        .RuleFor(u => u.IsActive, f => true);

    var users = userFaker.Generate(10);

    foreach (var user in users)
    {
        // Ensure unique username and email
        var existingUser = await context.User
            .FirstOrDefaultAsync(u => u.UserName == user.UserName || u.Email == user.Email);

        if (existingUser == null)
        {
            context.User.Add(user);
            Console.WriteLine($"  + Adding user: {user.UserName} ({user.Email})");
        }
    }

    await context.SaveChangesAsync();
    Console.WriteLine($"Users seeded successfully!");
    Console.WriteLine();

    // Seed scores
    Console.WriteLine("Seeding scores...");
    var seededUsers = await context.User.ToListAsync();
    var scoreFaker = new Faker<Score>()
        .RuleFor(s => s.UserScore, f => f.Random.Int(100, 10000))
        .RuleFor(s => s.CreatedAt, f => f.Date.Past(1))
        .RuleFor(s => s.UpdatedAt, f => f.Date.Recent(30))
        .RuleFor(s => s.Status, f => SubmissionStatus.Approved);

    foreach (var user in seededUsers)
    {
        // Create 1-3 scores per user
        var scoreCount = new Random().Next(1, 4);
        for (int i = 0; i < scoreCount; i++)
        {
            var score = scoreFaker.Generate();
            score.UserId = user.Id;
            context.Score.Add(score);
        }
        Console.WriteLine($"  + Added {scoreCount} scores for user: {user.UserName}");
    }

    await context.SaveChangesAsync();
    Console.WriteLine($"Scores seeded successfully!");
    Console.WriteLine();

    // Summary
    var finalUserCount = await context.User.CountAsync();
    var finalScoreCount = await context.Score.CountAsync();

    Console.WriteLine("=== Seeding Summary ===");
    Console.WriteLine($"Total users created: {finalUserCount}");
    Console.WriteLine($"Total scores created: {finalScoreCount}");
    Console.WriteLine();
    Console.WriteLine("Database seeded successfully!");
}
catch (Exception ex)
{
    Console.WriteLine();
    Console.WriteLine("Error occurred during seeding:");
    Console.WriteLine($"  {ex.Message}");

    if (ex.InnerException != null)
    {
        Console.WriteLine($"  Inner: {ex.InnerException.Message}");
    }

    Console.WriteLine();
    Console.WriteLine("Seeding failed.");
    Environment.Exit(1);
}
