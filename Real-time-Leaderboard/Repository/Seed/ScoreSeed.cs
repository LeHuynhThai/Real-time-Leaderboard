using Microsoft.EntityFrameworkCore;
using Repository.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repository.Seed
{
    public class ScoreSeed
    {
        public static async Task SeedAsync(AppDbContext db)
        {
            if (await db.Scores.AnyAsync())
            {
                return;
            }

            try
            {
                var users = await db.Users
                    .Where(u => u.UserName != "admin")
                    .AsNoTracking()
                    .Select(u => new { u.Id })
                    .ToListAsync();

                var random = new Random();

                var scores = new List<Score>(users.Count);
                foreach (var u in users)
                {
                    scores.Add(new Score
                    {
                        UserId = u.Id,
                        UserScore = random.Next(10, 1000),
                        Status = SubmissionStatus.Approved,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });
                }

                await db.Scores.AddRangeAsync(scores);
                await db.SaveChangesAsync();
                Console.WriteLine($"Successfully seeded {scores.Count} scores");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error seeding scores: {ex.Message}");
            }
        }
    }
}
