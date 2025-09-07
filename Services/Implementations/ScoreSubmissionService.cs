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

        public async Task<ScoreSubmission> SubmitScore(int UserId, int score)
        {
            var user = await _userRepository.GetUserById(UserId);
            var scoreSubmission = new ScoreSubmission
            {
                UserId = UserId,
                Score = score
            };
            return await _scoreSubmissionRepository.CreateScoreSubmission(scoreSubmission);
        }

        public async Task<ScoreSubmission> UpdateScore(int UserId, int score)
        {
            var user = await _userRepository.GetUserById(UserId);
            
            var current = await _scoreSubmissionRepository.GetScoreById(UserId);
            if (score > current.Score)
            {
                current.Score = score;
                current.UpdatedAt = DateTime.UtcNow;
                current.Status = SubmissionStatus.Approved;
                return await _scoreSubmissionRepository.UpdateScore(current);
            }

            return current;
        }

        public async Task<ScoreSubmission> GetScoreByUserId(int userId)
        {
            return await _scoreSubmissionRepository.GetScoreById(userId);
        }
    }
}
