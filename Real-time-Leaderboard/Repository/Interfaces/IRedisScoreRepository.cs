namespace Repository.Interfaces
{
    public interface IRedisScoreRepository
    {
        Task UpdateScoreAsync(int userId, string username, int score);
        Task<List<(int UserId, string Username, int Score, int Rank)>> GetTopNAsync(int n);
        Task<int> GetUserRankAsync(int userId);
        Task<int?> GetUserScoreAsync(int userId);
        Task RemoveUserAsync(int userId);
        Task SyncFromSqlAsync(List<(int UserId, string Username, int Score)> scores);
        Task<bool> IsEmptyAsync();
    }
}
