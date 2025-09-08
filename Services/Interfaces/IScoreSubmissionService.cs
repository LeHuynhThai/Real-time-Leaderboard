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
        Task<ScoreSubmission> SaveScore(int UserId, int score);
        Task<ScoreSubmission> GetMyScore(int UserId);
    }
}
