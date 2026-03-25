using Repository.Entities;
using Repository.Interfaces;
using Repository.Redis;
using StackExchange.Redis;

namespace Repository.Implementations
{
    public class RedisUserRepository : IUserRepository
    {
        private readonly IDatabase _db;
        private const string UserHashKey = "user";
        private const string UsernameIndexKey = "username:index";
        private int _idCounter = 0;

        public RedisUserRepository(IRedisConnectionManager redis)
        {
            _db = redis.GetDatabase();
        }

        public async Task<User> GetUserById(int id)
        {
            var userHash = await _db.HashGetAllAsync($"{UserHashKey}:{id}");
            if (userHash.Length == 0)
            {
                return null;
            }

            var dict = userHash.ToDictionary(h => h.Name.ToString(), h => h.Value.ToString());

            var user = new User
            {
                Id = id,
                UserName = dict.GetValueOrDefault("username", ""),
                Email = dict.GetValueOrDefault("email", ""),
                PasswordHash = dict.GetValueOrDefault("passwordHash", "")
            };

            if (dict.TryGetValue("createdAt", out var createdAtStr))
            {
                user.CreatedAt = DateTime.Parse(createdAtStr);
            }

            return user;
        }

        public async Task<User> AddUser(User user)
        {
            // If ID is not set (0), generate new ID
            if (user.Id == 0)
            {
                var nextId = await _db.StringIncrementAsync("user:id:counter");
                user.Id = (int)nextId;
            }
            else
            {
                // Update the counter if we're adding a user with specific ID (for migration)
                var currentCounter = await _db.StringGetAsync("user:id:counter");
                if (!currentCounter.HasValue || (int)currentCounter < user.Id)
                {
                    await _db.StringSetAsync("user:id:counter", user.Id);
                }
            }

            if (user.CreatedAt == default)
            {
                user.CreatedAt = DateTime.UtcNow;
            }

            // Store user data in hash
            var userData = new HashEntry[]
            {
                new HashEntry("username", user.UserName),
                new HashEntry("email", user.Email),
                new HashEntry("passwordHash", user.PasswordHash),
                new HashEntry("createdAt", user.CreatedAt.ToString("O"))
            };

            await _db.HashSetAsync($"{UserHashKey}:{user.Id}", userData);

            // Create username index for quick lookup
            await _db.HashSetAsync(UsernameIndexKey, user.UserName.ToLower(), user.Id);

            return user;
        }

        public async Task<User> GetUserByUsername(string username)
        {
            // Lookup user ID by username
            var userId = await _db.HashGetAsync(UsernameIndexKey, username.ToLower());
            if (userId.IsNullOrEmpty)
            {
                return null;
            }

            return await GetUserById((int)userId);
        }

        public async Task<User> UpdateUser(User user)
        {
            var existing = await GetUserById(user.Id);
            if (existing == null)
            {
                return null;
            }

            // If username changed, update the index
            if (existing.UserName != user.UserName)
            {
                await _db.HashDeleteAsync(UsernameIndexKey, existing.UserName.ToLower());
                await _db.HashSetAsync(UsernameIndexKey, user.UserName.ToLower(), user.Id);
            }

            // Update user data
            var userData = new HashEntry[]
            {
                new HashEntry("username", user.UserName),
                new HashEntry("email", user.Email),
                new HashEntry("passwordHash", user.PasswordHash),
                new HashEntry("createdAt", user.CreatedAt.ToString("O"))
            };

            await _db.HashSetAsync($"{UserHashKey}:{user.Id}", userData);

            return user;
        }

        public async Task<List<User>> SearchUsers(string query, int limit = 10)
        {
            var users = new List<User>();

            // Get all usernames from index
            var allUsernames = await _db.HashGetAllAsync(UsernameIndexKey);

            var matchingUsernames = allUsernames
                .Where(h => h.Name.ToString().Contains(query.ToLower()))
                .Take(limit);

            foreach (var entry in matchingUsernames)
            {
                var userId = (int)entry.Value;
                var user = await GetUserById(userId);
                if (user != null)
                {
                    users.Add(user);
                }
            }

            return users;
        }
    }
}
