using StackExchange.Redis;
using Repository.Interfaces;
using Repository.Redis;

namespace Repository.Implementations
{
    public class RedisScoreRepository : IRedisScoreRepository
    {
        private readonly IDatabase _db;
        private const string LeaderboardKey = "leaderboard:global";
        private const string UsernameKeyPrefix = "leaderboard:username:";

        public RedisScoreRepository(IRedisConnectionManager redis)
        {
            _db = redis.GetDatabase();
        }

        public async Task UpdateScoreAsync(int userId, string username, int score)
        {
            var member = $"{userId}:{username}";
            await _db.SortedSetAddAsync(LeaderboardKey, member, score);
            await _db.StringSetAsync(UsernameKeyPrefix + userId, username);
        }

        public async Task<List<(int UserId, string Username, int Score, int Rank)>> GetTopNAsync(int n)
        {
            var results = await _db.SortedSetRangeByRankWithScoresAsync(
                LeaderboardKey,
                start: 0,
                stop: n - 1,
                order: Order.Descending);

            var list = new List<(int UserId, string Username, int Score, int Rank)>();
            int rank = 1;

            foreach (var entry in results)
            {
                var parts = entry.Element.ToString().Split(':', 2);
                if (parts.Length == 2 && int.TryParse(parts[0], out int userId))
                {
                    list.Add((userId, parts[1], (int)entry.Score, rank));
                }
                rank++;
            }

            return list;
        }

        public async Task<int> GetUserRankAsync(int userId)
        {
            var username = await _db.StringGetAsync(UsernameKeyPrefix + userId);
            if (!username.HasValue) return -1;

            var member = $"{userId}:{username}";
            var rank = await _db.SortedSetRankAsync(LeaderboardKey, member, order: Order.Descending);

            return rank.HasValue ? (int)rank.Value + 1 : -1;
        }

        public async Task<int?> GetUserScoreAsync(int userId)
        {
            var username = await _db.StringGetAsync(UsernameKeyPrefix + userId);
            if (!username.HasValue) return null;

            var member = $"{userId}:{username}";
            var score = await _db.SortedSetScoreAsync(LeaderboardKey, member);

            return score.HasValue ? (int)score.Value : null;
        }

        public async Task RemoveUserAsync(int userId)
        {
            var username = await _db.StringGetAsync(UsernameKeyPrefix + userId);
            if (username.HasValue)
            {
                var member = $"{userId}:{username}";
                await _db.SortedSetRemoveAsync(LeaderboardKey, member);
                await _db.KeyDeleteAsync(UsernameKeyPrefix + userId);
            }
        }

        public async Task SyncFromSqlAsync(List<(int UserId, string Username, int Score)> scores)
        {
            var batch = _db.CreateBatch();
            var tasks = new List<Task>();

            // Clear existing leaderboard
            tasks.Add(batch.KeyDeleteAsync(LeaderboardKey));

            // Add all scores
            foreach (var (userId, username, score) in scores)
            {
                var member = $"{userId}:{username}";
                tasks.Add(batch.SortedSetAddAsync(LeaderboardKey, member, score));
                tasks.Add(batch.StringSetAsync(UsernameKeyPrefix + userId, username));
            }

            batch.Execute();
            await Task.WhenAll(tasks);
        }

        public async Task<bool> IsEmptyAsync()
        {
            var count = await _db.SortedSetLengthAsync(LeaderboardKey);
            return count == 0;
        }
    }
}
