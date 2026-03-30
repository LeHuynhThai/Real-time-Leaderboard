using Repository.Entities;
using Repository.Interfaces;
using Service.Interfaces;

namespace Service.Implementations
{
    public class ScoreService : IScoreService
    {
        private readonly IScoreRepository _scoreRepository;
        private readonly IUserRepository _userRepository;
        private readonly IRedisScoreRepository _redisScoreRepository;

        public ScoreService(IScoreRepository scoreSubmissionRepository, IUserRepository userRepository, IRedisScoreRepository redisScoreRepository)
        {
            _scoreRepository = scoreSubmissionRepository;
            _userRepository = userRepository;
            _redisScoreRepository = redisScoreRepository;
        }

        public async Task<List<Score>> GetLeaderboard(int skip = 0, int take = 100)
        {
            var redisResults = await _redisScoreRepository.GetTopNAsync(skip + take);
            
            if (redisResults == null || redisResults.Count == 0)
            {
                return await _scoreRepository.GetLeaderboard(skip, take);
            }

            // Convert Redis results to Score entities with User info
            var scores = redisResults
                .Skip(skip)
                .Take(take)
                .Select(r => new Score
                {
                    UserId = r.UserId,
                    UserScore = r.Score,
                    User = new User { Id = r.UserId, UserName = r.Username }
                })
                .ToList();

            return scores;
        }

        public async Task<int> GetLeaderboardCount()
        {
            return await _scoreRepository.GetLeaderboardCount();
        }

        public async Task<List<(Score Score, int Rank)>> SearchPlayers(string query)
        {
            return await _scoreRepository.SearchPlayers(query);
        }

        public async Task<Score> SaveScore(int UserId, int score)
        {
            var existing = await _scoreRepository.GetScoreById(UserId);
            var user = await _userRepository.GetUserById(UserId);

            // If no existing score, create a new one
            if (existing == null)
            {
                var scoreSubmission = new Score
                {
                    UserId = UserId,
                    UserScore = score,
                    Status = SubmissionStatus.Approved,
                    CreatedAt = DateTime.UtcNow
                };
                var created = await _scoreRepository.CreateScore(scoreSubmission);
                
                // Update Redis
                if (user != null)
                {
                    await _redisScoreRepository.UpdateScoreAsync(UserId, user.UserName, score);
                }
                
                return created;
            }

            // If score is higher than existing score, update the score
            if (score > existing.UserScore)
            {
                existing.UserScore = score;
                existing.UpdatedAt = DateTime.UtcNow;
                existing.Status = SubmissionStatus.Approved;

                var updated = await _scoreRepository.UpdateScore(existing);

                // Update Redis
                if (user != null)
                {
                    await _redisScoreRepository.UpdateScoreAsync(UserId, user.UserName, score);
                }

                return updated;
            }

            // If score is lower than existing score, do nothing
            return existing;
        }

        public async Task<Score> GetMyScore(int UserId)
        {
            return await _scoreRepository.GetScoreById(UserId);
        }

        public async Task<int> GetMyRank(int UserId)
        {
            var rank = await _redisScoreRepository.GetUserRankAsync(UserId);
            return rank > 0 ? rank : await _scoreRepository.GetUserRank(UserId, DateTime.MinValue) + 1;
        }

        public async Task<List<Score>> GetTopPlayersByPeriod(DateTime from, DateTime to, int skip, int take)
        {
            return await _scoreRepository.GetTopPlayersByPeriod(from, to, skip, take);
        }

        public async Task<int> GetTopPlayersByPeriodCount(DateTime from, DateTime to)
        {
            return await _scoreRepository.GetTopPlayersByPeriodCount(from, to);
        }
    }
}
