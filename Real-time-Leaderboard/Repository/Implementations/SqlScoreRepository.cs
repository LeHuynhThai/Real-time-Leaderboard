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

            _context.Scores.Add(scoreSubmission);
            await _context.SaveChangesAsync();

            return scoreSubmission;
        }

        public async Task<List<Score>> GetLeaderboard(int skip = 0, int take = 100)
        {
            return await _context.Scores
                .AsNoTracking()
                .Where(s => s.Status == SubmissionStatus.Approved)
                .OrderByDescending(s => s.UserScore)
                .Skip(skip)
                .Take(take)
                .Include(s => s.User)
                .ToListAsync();
        }

        public async Task<int> GetLeaderboardCount()
        {
            return await _context.Scores
                .AsNoTracking()
                .Where(s => s.Status == SubmissionStatus.Approved)
                .CountAsync();
        }

        public async Task<List<(Score Score, int Rank)>> SearchPlayers(string query)
        {
            var lowerQuery = query.ToLower();
            
            // Get all approved scores ordered by score descending
            var allScores = await _context.Scores
                .AsNoTracking()
                .Where(s => s.Status == SubmissionStatus.Approved)
                .OrderByDescending(s => s.UserScore)
                .Include(s => s.User)
                .ToListAsync();
            
            // Filter matching players and calculate their actual rank
            var results = new List<(Score Score, int Rank)>();
            for (int i = 0; i < allScores.Count; i++)
            {
                var score = allScores[i];
                if (score.User.UserName.ToLower().Contains(lowerQuery))
                {
                    results.Add((score, i + 1)); // Actual rank is position in full leaderboard
                }
            }
            
            return results;
        }

        public async Task<Score> GetScoreById(int userId)
        {
            return await _context.Scores
                .AsNoTracking()
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.UserId == userId);
        }

        public async Task<Score> UpdateScore(Score scoreSubmission)
        {
            var existingScore = await _context.Scores
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
            var userScore = await _context.Scores
                .AsNoTracking()
                .Where(s => s.UserId == userId && s.Status == SubmissionStatus.Approved)
                .Select(s => s.UserScore)
                .FirstOrDefaultAsync();

            if (userScore == 0)
            {
                return -1;
            }

            var rank = await _context.Scores
                .AsNoTracking()
                .Where(s => s.UserScore > userScore && s.Status == SubmissionStatus.Approved)
                .CountAsync();

            return rank;
        }
    }
}
