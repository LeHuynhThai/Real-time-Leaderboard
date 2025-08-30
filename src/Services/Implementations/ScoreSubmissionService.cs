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

        public async Task<ScoreSubmission> CreateScoreSubmission(ScoreSubmission scoreSubmission)
        {
            return await _scoreSubmissionRepository.CreateScoreSubmission(scoreSubmission);
        }
    }
}
