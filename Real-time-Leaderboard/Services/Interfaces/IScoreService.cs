using Repository.Entities;

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
