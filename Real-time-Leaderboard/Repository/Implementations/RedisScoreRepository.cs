using Repository.Entities;
using Repository.Interfaces;
using Repository.Redis;
using System.Text.Json;
using StackExchange.Redis;

namespace Repository.Implementations
{
    public class RedisScoreRepository : IScoreRepository
    {
        private readonly IDatabase _db;
        private const string LeaderboardKey = "leaderboard";
        private const string UserHashKey = "user";
        private const string ScoreHistoryKey = "scores";
        private const string UserScoreKey = "userscore";

        public RedisScoreRepository(IRedisConnectionManager redis)
        {
            _db = redis.GetDatabase();
        }

        public async Task<Score> CreateScore(Score scoreSubmission)
        {
            var scoreData = new HashEntry[]
            {
                new HashEntry("score", scoreSubmission.UserScore),
                new HashEntry("createdAt", scoreSubmission.CreatedAt.ToString("O")),
                new HashEntry("updatedAt", scoreSubmission.UpdatedAt.ToString("O")),
                new HashEntry("status", scoreSubmission.Status.ToString())
            };

            // Store user score data
            await _db.HashSetAsync($"{UserScoreKey}:{scoreSubmission.UserId}", scoreData);

            // Add to sorted set (leaderboard)
            await _db.SortedSetAddAsync(LeaderboardKey, scoreSubmission.UserId, scoreSubmission.UserScore);

            // Add to score history
            var historyEntry = $"{scoreSubmission.CreatedAt:O}:{scoreSubmission.UserScore}";
            await _db.ListLeftPushAsync($"{ScoreHistoryKey}:{scoreSubmission.UserId}", historyEntry);

            return scoreSubmission;
        }

        public async Task<List<Score>> GetLeaderboard()
        {
            // Get top 100 scores from sorted set (descending order)
            var sortedSetEntries = await _db.SortedSetRangeByRankWithScoresAsync(
                LeaderboardKey,
                start: 0,
                stop: 99,
                order: Order.Descending
            );

            var scores = new List<Score>();

            foreach (var entry in sortedSetEntries)
            {
                var userId = (int)entry.Element;
                var userScore = await GetScoreById(userId);
                if (userScore != null)
                {
                    scores.Add(userScore);
                }
            }

            return scores;
        }

        public async Task<Score> GetUserById(int UserId)
        {
            return await GetScoreById(UserId);
        }

        public async Task<Score> UpdateScore(Score scoreSubmission)
        {
            var existing = await GetScoreById(scoreSubmission.UserId);
            if (existing == null)
            {
                return await CreateScore(scoreSubmission);
            }

            // Update score in hash
            var scoreData = new HashEntry[]
            {
                new HashEntry("score", scoreSubmission.UserScore),
                new HashEntry("updatedAt", scoreSubmission.UpdatedAt.ToString("O")),
                new HashEntry("status", scoreSubmission.Status.ToString())
            };

            await _db.HashSetAsync($"{UserScoreKey}:{scoreSubmission.UserId}", scoreData);

            // Update sorted set score
            await _db.SortedSetAddAsync(LeaderboardKey, scoreSubmission.UserId, scoreSubmission.UserScore);

            // Add to score history
            var historyEntry = $"{scoreSubmission.UpdatedAt:O}:{scoreSubmission.UserScore}";
            await _db.ListLeftPushAsync($"{ScoreHistoryKey}:{scoreSubmission.UserId}", historyEntry);

            return scoreSubmission;
        }

        public async Task<Score> GetScoreById(int UserId)
        {
            // Get user details
            var userHash = await _db.HashGetAllAsync($"{UserHashKey}:{UserId}");
            if (userHash.Length == 0)
            {
                return null;
            }

            // Get score details
            var scoreHash = await _db.HashGetAllAsync($"{UserScoreKey}:{UserId}");
            if (scoreHash.Length == 0)
            {
                return null;
            }

            var scoreDict = scoreHash.ToDictionary(h => h.Name.ToString(), h => h.Value.ToString());
            var userDict = userHash.ToDictionary(h => h.Name.ToString(), h => h.Value.ToString());

            var score = new Score
            {
                UserId = UserId,
                UserScore = int.Parse(scoreDict["score"]),
                User = new User
                {
                    Id = UserId,
                    UserName = userDict.GetValueOrDefault("username", ""),
                    Email = userDict.GetValueOrDefault("email", "")
                }
            };

            if (scoreDict.TryGetValue("createdAt", out var createdAtStr))
            {
                score.CreatedAt = DateTime.Parse(createdAtStr);
            }

            if (scoreDict.TryGetValue("updatedAt", out var updatedAtStr))
            {
                score.UpdatedAt = DateTime.Parse(updatedAtStr);
            }

            if (scoreDict.TryGetValue("status", out var statusStr) && 
                Enum.TryParse<SubmissionStatus>(statusStr, out var status))
            {
                score.Status = status;
            }

            return score;
        }

        public async Task<int> GetUserRank(int userId, DateTime updatedAt)
        {
            // Get rank of user from sorted set (0-indexed)
            var rank = await _db.SortedSetRankAsync(LeaderboardKey, userId, Order.Descending);
            return rank.HasValue ? (int)rank.Value : -1;
        }

        // Helper method to get score history for a user
        public async Task<List<string>> GetScoreHistory(int userId, int count = 10)
        {
            var history = await _db.ListRangeAsync($"{ScoreHistoryKey}:{userId}", 0, count - 1);
            return history.Select(h => h.ToString()).ToList();
        }
    }
}
