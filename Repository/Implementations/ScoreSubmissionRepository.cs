using Microsoft.EntityFrameworkCore;
using Repository.Entities;
using Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repository.Implementations
{
    public class ScoreSubmissionRepository : IScoreSubmissionRepository
    {
        private readonly AppDbContext _context;

        public ScoreSubmissionRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ScoreSubmission> CreateScore(ScoreSubmission scoreSubmission)
        {
            _context.ScoreSubmissions.Add(scoreSubmission);
            await _context.SaveChangesAsync();
            return scoreSubmission;
        }

        public async Task<ScoreSubmission> GetUserById(int UserId)
        {
            return await _context.ScoreSubmissions.FindAsync(UserId);
        }

        public async Task<ScoreSubmission> UpdateScore(ScoreSubmission scoreSubmission)
        {
            _context.ScoreSubmissions.Update(scoreSubmission);
            await _context.SaveChangesAsync();
            return scoreSubmission;
        }

        public async Task<ScoreSubmission> GetScoreById(int userId)
        {
            return await _context.ScoreSubmissions
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.UserId == userId);
        }

        public async Task<List<ScoreSubmission>> GetLeaderboard (int ranking)
        {
            return await _context.ScoreSubmissions
                .AsNoTracking()
                .Include(s => s.User)
                .OrderByDescending(s => s.Score)
                .ThenBy(s => s.UpdatedAt) // nếu bằng điểm thì ai đạt điểm trước sẽ xếp trước
                .Take(ranking)
                .ToListAsync();
        }
        
        public async Task<int> GetUserRank(int score)
        {
            return await _context.ScoreSubmissions
                .Select(s => s.Score)
                .Where(s => s > score)
                .Distinct()
                .CountAsync();
        }
    }
}
