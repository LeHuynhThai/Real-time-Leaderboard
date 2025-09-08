using Repository.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repository.Interfaces
{
    public interface IScoreSubmissionRepository
    {
        Task<ScoreSubmission> CreateScore(ScoreSubmission scoreSubmission);
        Task<List<ScoreSubmission>> GetLeaderboard(int ranking);
        Task<ScoreSubmission> GetUserById(int UserId);
        Task<ScoreSubmission> UpdateScore(ScoreSubmission scoreSubmission);
        Task<ScoreSubmission> GetScoreById(int UserId);
    }
}
