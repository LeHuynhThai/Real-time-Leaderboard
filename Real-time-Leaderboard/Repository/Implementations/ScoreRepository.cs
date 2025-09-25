using Microsoft.EntityFrameworkCore;
using Repository.Entities;
using Repository.Interfaces;

namespace Repository.Implementations
{
    public class ScoreRepository : IScoreRepository
    {
        private readonly AppDbContext _context;

        public ScoreRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Score> CreateScore(Score scoreSubmission)
        {
            _context.Scores.Add(scoreSubmission);
            await _context.SaveChangesAsync();
            return scoreSubmission;
        }

        public async Task<Score> GetUserById(int UserId)
        {
            return await _context.Scores.FindAsync(UserId);
        }

        public async Task<Score> UpdateScore(Score scoreSubmission)
        {
            _context.Scores.Update(scoreSubmission);
            await _context.SaveChangesAsync();
            return scoreSubmission;
        }

        public async Task<Score> GetScoreById(int userId)
        {
            return await _context.Scores
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.UserId == userId);
        }

        public async Task<List<Score>> GetLeaderboard()
        {
            return await _context.Scores
                .AsNoTracking()
                .Include(s => s.User)
                .OrderByDescending(s => s.UserScore)
                .ThenBy(s => s.UpdatedAt)
                .ToListAsync();
        }

        public async Task<int> GetUserRank(int score, DateTime updatedAt)
        {

            return await _context.Scores
                .Where(s => s.UserScore > score || (s.UserScore == score && s.UpdatedAt < updatedAt))
                .CountAsync();
        }
    }
}
