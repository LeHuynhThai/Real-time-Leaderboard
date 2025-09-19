using Repository.Entities;

namespace Repository.Interfaces
{
    public interface IScoreRepository
    {
        Task<Score> CreateScore(Score scoreSubmission);
        Task<List<Score>> GetLeaderboard(int ranking);
        Task<Score> GetUserById(int UserId);
        Task<Score> UpdateScore(Score scoreSubmission);
        Task<Score> GetScoreById(int UserId);
        Task<int> GetUserRank(int score);
    }
}
