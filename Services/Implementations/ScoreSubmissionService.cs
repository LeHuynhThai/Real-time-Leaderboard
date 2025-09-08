using Repository.Entities;
using Repository.Interfaces;
using Service.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service.Implementations
{
    public class ScoreSubmissionService : IScoreSubmissionService
    {
        private readonly IScoreSubmissionRepository _scoreSubmissionRepository;
        private readonly IUserRepository _userRepository;

        public ScoreSubmissionService(IScoreSubmissionRepository scoreSubmissionRepository, IUserRepository userRepository)
        {
            _scoreSubmissionRepository = scoreSubmissionRepository;
            _userRepository = userRepository;
        }

        public async Task<List<ScoreSubmission>> GetAllScoreSubmissions()
        {
            return await _scoreSubmissionRepository.GetAllScoreSubmissions();
        }

        public async Task<ScoreSubmission> SaveScore(int UserId, int score)
        {
            var existing = await _scoreSubmissionRepository.GetUserById(UserId);
            
            // If no existing score, create a new one
            if (existing == null)
            {
                var scoreSubmission = new ScoreSubmission
                {
                    UserId = UserId,
                    Score = score,
                    Status = SubmissionStatus.Approved,
                    CreatedAt = DateTime.UtcNow
                };
                return await _scoreSubmissionRepository.CreateScoreSubmission(scoreSubmission);
            }
            // If score is higher than existing score, update the score
            if (score > existing.Score)
            {
                existing.Score = score;
                existing.UpdatedAt = DateTime.UtcNow;
                existing.Status = SubmissionStatus.Approved;
                return await _scoreSubmissionRepository.UpdateScore(existing);
            }
            // If score is lower than existing score, do nothing
            return existing;
        }
    }
}
