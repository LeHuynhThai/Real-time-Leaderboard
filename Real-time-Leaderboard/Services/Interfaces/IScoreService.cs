using Repository.Entities;

namespace Service.Interfaces
{
    public interface IScoreService
    {
        Task<List<Score>> GetLeaderboard(int skip = 0, int take = 100);
        Task<int> GetLeaderboardCount();
        Task<List<(Score Score, int Rank)>> SearchPlayers(string query);
        Task<Score> SaveScore(int UserId, int score);
        Task<Score> GetMyScore(int UserId);
        Task<int> GetMyRank(int UserId);
        Task<List<Score>> GetTopPlayersByPeriod(DateTime from, DateTime to, int skip, int take);
        Task<int> GetTopPlayersByPeriodCount(DateTime from, DateTime to);
    }
}
