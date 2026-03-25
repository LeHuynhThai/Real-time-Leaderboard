using Microsoft.EntityFrameworkCore;
using Repository.Data;
using Repository.Entities;
using Repository.Interfaces;

namespace Repository.Implementations
{
    public class SqlScoreHistoryRepository : IScoreHistoryRepository
    {
        private readonly AppDbContext _context;

        public SqlScoreHistoryRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ScoreHistory> AddScoreHistory(ScoreHistory history)
        {
            history.RecordedAt = DateTime.UtcNow;

            _context.ScoreHistories.Add(history);
            await _context.SaveChangesAsync();

            return history;
        }

        public async Task<List<ScoreHistory>> GetScoreHistoryByUserId(int userId, int count = 10)
        {
            return await _context.ScoreHistories
                .AsNoTracking()
                .Where(sh => sh.UserId == userId)
                .OrderByDescending(sh => sh.RecordedAt)
                .Take(count)
                .Include(sh => sh.User)
                .ToListAsync();
        }

        public async Task<List<ScoreHistory>> GetTopPlayersByPeriod(DateTime from, DateTime to, int limit = 10)
        {
            var topPlayers = await _context.ScoreHistories
                .AsNoTracking()
                .Where(sh => sh.RecordedAt >= from && sh.RecordedAt <= to)
                .GroupBy(sh => sh.UserId)
                .Select(g => new
                {
                    UserId = g.Key,
                    TotalScore = g.Sum(sh => sh.ScoreValue),
                    MaxScore = g.Max(sh => sh.ScoreValue),
                    EntryCount = g.Count()
                })
                .OrderByDescending(x => x.TotalScore)
                .Take(limit)
                .ToListAsync();

            var result = new List<ScoreHistory>();
            foreach (var player in topPlayers)
            {
                var user = await _context.Users.FindAsync(player.UserId);
                if (user != null)
                {
                    result.Add(new ScoreHistory
                    {
                        UserId = player.UserId,
                        ScoreValue = player.TotalScore,
                        RecordedAt = to,
                        GameMode = $"aggregate:{player.EntryCount} entries",
                        User = user
                    });
                }
            }

            return result;
        }

        public async Task<List<ScoreHistory>> GetScoreHistoryByGameMode(string gameMode, int limit = 10)
        {
            return await _context.ScoreHistories
                .AsNoTracking()
                .Where(sh => sh.GameMode == gameMode)
                .OrderByDescending(sh => sh.ScoreValue)
                .Take(limit)
                .Include(sh => sh.User)
                .ToListAsync();
        }
    }
}
