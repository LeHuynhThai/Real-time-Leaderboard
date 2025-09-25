using Repository.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IScoreService
    {
        Task<List<Score>> GetLeaderboard();
        Task<Score> SaveScore(int UserId, int score);
        Task<Score> GetMyScore(int UserId);
        Task<int> GetMyRank(int UserId);
    }
}
