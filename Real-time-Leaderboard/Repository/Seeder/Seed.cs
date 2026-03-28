using Repository.Data;
using Repository.Entities;

namespace Repository.Seeder
{
    public static class Seed
    {
        public static async Task SeedDataAsync(AppDbContext context)
        {
            // Check if database already has data
            if (context.User.Any() || context.Score.Any())
            {
                Console.WriteLine("Database already seeded. Skipping seed data insertion.");
                return;
            }

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
}
