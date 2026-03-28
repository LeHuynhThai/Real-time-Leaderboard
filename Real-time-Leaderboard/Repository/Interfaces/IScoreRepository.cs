using Repository.Entities;

namespace Repository.Interfaces
{
    public interface IScoreRepository
    {
        Task<Score> CreateScore(Score scoreSubmission);
        Task<List<Score>> GetLeaderboard(int skip = 0, int take = 100);
        Task<int> GetLeaderboardCount();
        Task<List<(Score Score, int Rank)>> SearchPlayers(string query);
        Task<Score> UpdateScore(Score scoreSubmission);
        Task<Score> GetScoreById(int UserId);
        Task<int> GetUserRank(int userId, DateTime updatedAt);
    }
}
