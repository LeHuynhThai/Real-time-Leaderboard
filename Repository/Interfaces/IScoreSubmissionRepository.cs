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
        Task<ScoreSubmission> CreateScoreSubmission(ScoreSubmission scoreSubmission);
        Task<List<ScoreSubmission>> GetAllScoreSubmissions();
        Task<ScoreSubmission> GetUserById(int UserId);
        Task<ScoreSubmission> UpdateScore(ScoreSubmission scoreSubmission);
        Task<ScoreSubmission> GetScoreById(int UserId);
    }
}
