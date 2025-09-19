using Repository.Entities;
using Repository.Interfaces;
using Service.Interfaces;

namespace Service.Implementations
{
    public class ScoreService : IScoreService
    {
        private readonly IScoreRepository _scoreRepository;
        private readonly IUserRepository _userRepository;

        public ScoreService(IScoreRepository scoreSubmissionRepository, IUserRepository userRepository)
        {
            _scoreRepository = scoreSubmissionRepository;
            _userRepository = userRepository;
        }

        public async Task<List<Score>> GetLeaderboard(int ranking)
        {
            return await _scoreRepository.GetLeaderboard(ranking);
        }

        public async Task<Score> SaveScore(int UserId, int score)
        {
            var existing = await _scoreRepository.GetScoreById(UserId);

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
                return await _scoreRepository.CreateScore(scoreSubmission);
            }
            // If score is higher than existing score, update the score
            if (score > existing.UserScore)
            {
                existing.UserScore = score;
                existing.UpdatedAt = DateTime.UtcNow;
                existing.Status = SubmissionStatus.Approved;
                return await _scoreRepository.UpdateScore(existing);
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
            var my = await _scoreRepository.GetScoreById(UserId);
            var myScore = my?.UserScore ?? 0;
            var higherDistinct = await _scoreRepository.GetUserRank(myScore);
            return higherDistinct + 1;
        }
    }
}
