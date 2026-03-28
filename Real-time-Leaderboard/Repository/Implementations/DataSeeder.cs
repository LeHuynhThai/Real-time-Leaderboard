using Bogus;
using Microsoft.EntityFrameworkCore;
using Repository.Data;
using Repository.Entities;
using Repository.Interfaces;

namespace Repository.Implementations
{
    public class DataSeeder : IDataSeeder
    {
        private readonly AppDbContext _context;
        private readonly IUserRepository _userRepository;
        private readonly IScoreRepository _scoreRepository;
        private readonly IRedisScoreRepository _redisScoreRepository;

        public DataSeeder(
            AppDbContext context,
            IUserRepository userRepository,
            IScoreRepository scoreRepository,
            IRedisScoreRepository redisScoreRepository)
        {
            _context = context;
            _userRepository = userRepository;
            _scoreRepository = scoreRepository;
            _redisScoreRepository = redisScoreRepository;
        }

        public async Task<bool> HasDataAsync()
        {
            return await _context.Users.AnyAsync() || await _context.Scores.AnyAsync();
        }

        public async Task SeedAsync(int count)
        {
            const string defaultPassword = "password123";
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(defaultPassword);

            var userFaker = new Faker<User>()
                .RuleFor(u => u.UserName, (f, u) => $"user_{f.IndexGlobal + 1}")
                .RuleFor(u => u.Email, (f, u) => $"user{f.IndexGlobal + 1}@test.com")
                .RuleFor(u => u.PasswordHash, _ => passwordHash)
                .RuleFor(u => u.CreatedAt, f => f.Date.Past(1));

            var seededScores = new List<(int UserId, string Username, int Score)>();

            for (int i = 0; i < count; i++)
            {
                var user = userFaker.Generate();
                var createdUser = await _userRepository.AddUser(user);

                var scoreFaker = new Faker<Score>()
                    .RuleFor(s => s.UserId, _ => createdUser.Id)
                    .RuleFor(s => s.UserScore, f => f.Random.Int(0, 100000))
                    .RuleFor(s => s.CreatedAt, _ => createdUser.CreatedAt)
                    .RuleFor(s => s.UpdatedAt, f => f.Date.Recent(30))
                    .RuleFor(s => s.Status, _ => SubmissionStatus.Approved);

                var score = scoreFaker.Generate();
                await _scoreRepository.CreateScore(score);

                // Collect for Redis sync
                seededScores.Add((createdUser.Id, createdUser.UserName, score.UserScore));
            }

            // Sync all seeded scores to Redis
            await _redisScoreRepository.SyncFromSqlAsync(seededScores);
        }
    }
}
