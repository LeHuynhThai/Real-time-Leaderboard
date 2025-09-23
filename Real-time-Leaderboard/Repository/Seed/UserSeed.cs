using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using Repository.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repository.Seed
{
    public class UserSeed
    {
        public static async Task SeedAsync(AppDbContext db)
        {
            // if users data already exists, no need to seed
            if (await db.Users.AnyAsync())
            {
                return;
            }

            try
            {
                // seed admin
                var admin = new User
                {
                    UserName = "admin",
                    Email = "admin@gmail.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("123"),
                    CreatedAt = DateTime.UtcNow,
                    Role = UserRole.Admin
                };
                await db.Users.AddAsync(admin);

                // seed 1000 users
                for (int i = 1; i <= 1000; i++)
                {
                    var user = new User
                    {
                        UserName = $"user{i}",
                        Email = $"user{i}@gmail.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("123"),
                        CreatedAt = DateTime.UtcNow,
                        Role = UserRole.User
                    };
                    await db.Users.AddAsync(user);
                }
                
                await db.SaveChangesAsync();
                Console.WriteLine($"Successfully seeded 1000 users and 1 admin");
            }

            catch (Exception ex)
            {
                Console.WriteLine($"Error seeding users: {ex.Message}");
            }
        }
    }
}
