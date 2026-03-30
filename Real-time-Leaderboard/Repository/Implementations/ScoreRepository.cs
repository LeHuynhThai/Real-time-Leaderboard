using Microsoft.EntityFrameworkCore;
using Repository.Data;
using Repository.Entities;
using Repository.Interfaces;

namespace Repository.Implementations
{
    public class SqlScoreRepository : IScoreRepository
    {
        private readonly AppDbContext _context;

        public SqlScoreRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Score> CreateScore(Score scoreSubmission)
        {
            scoreSubmission.CreatedAt = DateTime.UtcNow;
            scoreSubmission.UpdatedAt = DateTime.UtcNow;

            _context.Score.Add(scoreSubmission);
            await _context.SaveChangesAsync();

            return scoreSubmission;
        }

        public async Task<List<Score>> GetLeaderboard(int skip = 0, int take = 100)
        {
            // Return one entry per user: the highest approved score for each user
            var query = _context.Score
                .AsNoTracking()
                .Where(s => s.Status == SubmissionStatus.Approved)
                .GroupBy(s => s.UserId)
                .Select(g => new
                {
                    UserId = g.Key,
                    BestScore = g.Max(x => x.UserScore),
                    User = g.OrderByDescending(x => x.UserScore).Select(x => x.User).FirstOrDefault()
                })
                .OrderByDescending(x => x.BestScore)
                .Skip(skip)
                .Take(take);

            var list = await query.ToListAsync();

            // Map anonymous projection back to Score entities for compatibility
            return list.Select(x => new Score
            {
                UserId = x.UserId,
                UserScore = x.BestScore,
                User = x.User
            }).ToList();
        }

        public async Task<int> GetLeaderboardCount()
        {
            // Count distinct users that have an approved score
            return await _context.Score
                .AsNoTracking()
                .Where(s => s.Status == SubmissionStatus.Approved)
                .Select(s => s.UserId)
                .Distinct()
                .CountAsync();
        }

        public async Task<List<(Score Score, int Rank)>> SearchPlayers(string query)
        {
            var lowerQuery = query.ToLower();
            // Build leaderboard of best scores per user, ordered descending
            var all = await _context.Score
                .AsNoTracking()
                .Where(s => s.Status == SubmissionStatus.Approved)
                .GroupBy(s => s.UserId)
                .Select(g => new
                {
                    UserId = g.Key,
                    BestScore = g.Max(x => x.UserScore),
                    User = g.OrderByDescending(x => x.UserScore).Select(x => x.User).FirstOrDefault()
                })
                .OrderByDescending(x => x.BestScore)
                .ToListAsync();

            var results = new List<(Score Score, int Rank)>();
            for (int i = 0; i < all.Count; i++)
            {
                var item = all[i];
                if (item.User != null && item.User.UserName.ToLower().Contains(lowerQuery))
                {
                    var score = new Score
                    {
                        UserId = item.UserId,
                        UserScore = item.BestScore,
                        User = item.User
                    };
                    results.Add((score, i + 1));
                }
            }

            return results;
        }

        public async Task<Score> GetScoreById(int userId)
        {
            // Return the best approved score for the user (if any)
            return await _context.Score
                .AsNoTracking()
                .Where(s => s.UserId == userId && s.Status == SubmissionStatus.Approved)
                .OrderByDescending(s => s.UserScore)
                .Include(s => s.User)
                .FirstOrDefaultAsync();
        }

        public async Task<Score> UpdateScore(Score scoreSubmission)
        {
            var existingScore = await _context.Score
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.UserId == scoreSubmission.UserId);

            if (existingScore == null)
            {
                return await CreateScore(scoreSubmission);
            }

            existingScore.UserScore = scoreSubmission.UserScore;
            existingScore.UpdatedAt = DateTime.UtcNow;
            existingScore.Status = scoreSubmission.Status;

            await _context.SaveChangesAsync();
            return existingScore;
        }

        public async Task<int> GetUserRank(int userId, DateTime updatedAt)
        {
            // Determine the user's best approved score
            var userScore = await _context.Score
                .AsNoTracking()
                .Where(s => s.UserId == userId && s.Status == SubmissionStatus.Approved)
                .Select(s => (int?)s.UserScore)
                .MaxAsync();

            if (!userScore.HasValue)
            {
                return -1;
            }

            // Count number of distinct users whose best score is greater than the user's best score
            var rank = await _context.Score
                .AsNoTracking()
                .Where(s => s.Status == SubmissionStatus.Approved)
                .GroupBy(s => s.UserId)
                .Select(g => g.Max(x => x.UserScore))
                .CountAsync(max => max > userScore.Value);

            return rank;
        }
    }
}
