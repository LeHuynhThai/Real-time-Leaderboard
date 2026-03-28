using Bogus;
using Microsoft.EntityFrameworkCore;
using Repository.Data;
using Repository.Entities;

namespace Repository.Seeder;

public static class Seed
{
    public static async Task SeedDataAsync(AppDbContext context)
    {
        const int UserCount = 50; // Fixed number of users to seed
        
        // Check if already seeded
        if (await context.User.AnyAsync() || await context.Score.AnyAsync())
        {
            Console.WriteLine("Database already contains data. Skipping seeding.");
            return;
        }

        Console.WriteLine("Seeding users...");
        var userFaker = new Faker<User>()
            .RuleFor(u => u.UserName, f => f.Internet.UserName())
            .RuleFor(u => u.Email, f => f.Internet.Email())
            .RuleFor(u => u.PasswordHash, f => f.Internet.Password())
            .RuleFor(u => u.CreatedAt, f => f.Date.Past(1))
            .RuleFor(u => u.IsActive, f => true);

        var users = userFaker.Generate(UserCount);

        foreach (var user in users)
        {
            var existingUser = await context.User
                .FirstOrDefaultAsync(u => u.UserName == user.UserName || u.Email == user.Email);

            if (existingUser == null)
            {
                context.User.Add(user);
                Console.WriteLine($"  + Adding user: {user.UserName}");
            }
        }

        await context.SaveChangesAsync();
        Console.WriteLine($"Users seeded successfully!");

        Console.WriteLine("Seeding scores...");
        var seededUsers = await context.User.ToListAsync();
        var scoreFaker = new Faker<Score>()
            .RuleFor(s => s.UserScore, f => f.Random.Int(100, 10000))
            .RuleFor(s => s.CreatedAt, f => f.Date.Past(1))
            .RuleFor(s => s.UpdatedAt, f => f.Date.Recent(30))
            .RuleFor(s => s.Status, f => SubmissionStatus.Approved);

        foreach (var user in seededUsers)
        {
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

        var finalUserCount = await context.User.CountAsync();
        var finalScoreCount = await context.Score.CountAsync();

        Console.WriteLine("=== Seeding Summary ===");
        Console.WriteLine($"Total users: {finalUserCount}");
        Console.WriteLine($"Total scores: {finalScoreCount}");
    }
}
