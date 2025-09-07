using Repository.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IScoreSubmissionService
    {
        Task<List<ScoreSubmission>> GetAllScoreSubmissions();
        Task<ScoreSubmission> SubmitScore(int UserId, int score);
        Task<ScoreSubmission> UpdateScore(int UserId, int score);
        Task<ScoreSubmission> GetScoreByUserId(int userId);
    }
}
