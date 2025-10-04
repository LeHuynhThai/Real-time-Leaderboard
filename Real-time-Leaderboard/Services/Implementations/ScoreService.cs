using Repository.Entities;
using Repository.Interfaces;
using Service.Interfaces;
namespace Service.Implementations
{
    public class ScoreService : IScoreService
    {
        private readonly IScoreRepository _scoreRepository;
        private readonly IUserRepository _userRepository;
        private readonly INotificationService _notification;

        public ScoreService(IScoreRepository scoreSubmissionRepository, IUserRepository userRepository, INotificationService notification)
        {
            _scoreRepository = scoreSubmissionRepository;
            _userRepository = userRepository;
            _notification = notification;
        }

        public async Task<List<Score>> GetLeaderboard()
        {
            return await _scoreRepository.GetLeaderboard();
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

                var updated = await _scoreRepository.UpdateScore(existing);

                // send leaderboard update to all connected users
                await _notification.NotifyLeaderboardUpdated(new
                {
                    reason = "updated",
                    userId = updated.UserId,
                    username = updated.User.UserName,
                    score = updated.UserScore,
                    updatedAt = updated.UpdatedAt
                });

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
            var my = await _scoreRepository.GetScoreById(UserId);
            var myScore = my?.UserScore ?? 0;
            var myupdateAt = my?.UpdatedAt ?? DateTime.MinValue;
            var rank = await _scoreRepository.GetUserRank(myScore, myupdateAt);
            return rank + 1;
        }
    }
}
