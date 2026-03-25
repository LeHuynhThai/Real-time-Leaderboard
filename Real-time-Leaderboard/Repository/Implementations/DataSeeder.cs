using Bogus;
using Repository.Entities;
using Repository.Interfaces;
using Repository.Redis;
using StackExchange.Redis;

namespace Repository.Implementations
{
    public class DataSeeder : IDataSeeder
    {
        private readonly IUserRepository _userRepository;
        private readonly IScoreRepository _scoreRepository;
        private readonly IDatabase _db;

        public DataSeeder(
            IUserRepository userRepository,
            IScoreRepository scoreRepository,
            IRedisConnectionManager redis)
        {
            _userRepository = userRepository;
            _scoreRepository = scoreRepository;
            _db = redis.GetDatabase();
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
            }
        }

        public async Task ClearAllDataAsync()
        {
            var server = _db.Multiplexer.GetServer(_db.Multiplexer.GetEndPoints().First());
            
            var keys = server.Keys(pattern: "*").ToArray();
            foreach (var key in keys)
            {
                await _db.KeyDeleteAsync(key);
            }
        }
    }
}
