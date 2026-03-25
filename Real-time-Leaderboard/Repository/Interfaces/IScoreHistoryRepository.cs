using Repository.Entities;

namespace Repository.Interfaces
{
    public interface IScoreHistoryRepository
    {
        Task<ScoreHistory> AddScoreHistory(ScoreHistory history);
        Task<List<ScoreHistory>> GetScoreHistoryByUserId(int userId, int count = 10);
        Task<List<ScoreHistory>> GetTopPlayersByPeriod(DateTime from, DateTime to, int limit = 10);
        Task<List<ScoreHistory>> GetScoreHistoryByGameMode(string gameMode, int limit = 10);
    }
}
