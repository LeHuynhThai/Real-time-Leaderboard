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
        Task<List<ScoreSubmission>> GetLeaderboard(int ranking);
        Task<ScoreSubmission> SaveScore(int UserId, int score);
        Task<ScoreSubmission> GetMyScore(int UserId);
        Task<int> GetMyRank(int UserId);
    }
}
