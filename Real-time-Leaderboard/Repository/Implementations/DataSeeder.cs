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
            return await _context.User.AnyAsync() || await _context.Score.AnyAsync();
        }

        public async Task SeedAsync(int count)
        {
            if (await HasDataAsync())
            {
                return;
            }

            // Seed users
            var userFaker = new Faker<User>()
                .RuleFor(u => u.UserName, f => f.Internet.UserName())
                .RuleFor(u => u.Email, f => f.Internet.Email())
                .RuleFor(u => u.PasswordHash, f => f.Internet.Password())
                .RuleFor(u => u.CreatedAt, f => f.Date.Past(1))
                .RuleFor(u => u.IsActive, f => true);

            var users = userFaker.Generate(count);

            foreach (var user in users)
            {
                var existingUser = await _context.User
                    .FirstOrDefaultAsync(u => u.UserName == user.UserName || u.Email == user.Email);

                if (existingUser == null)
                {
                    _context.User.Add(user);
                }
            }
            await _context.SaveChangesAsync();

            // Seed scores
            var seededUsers = await _context.User.ToListAsync();
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
                    _context.Score.Add(score);
                }
            }
            await _context.SaveChangesAsync();

            // Sync to Redis
            var allScores = await _scoreRepository.GetLeaderboard(0, 10000);
            var scores = allScores.Select(s => (s.UserId, s.User.UserName, s.UserScore)).ToList();
            await _redisScoreRepository.SyncFromSqlAsync(scores);
        }
    }
}
