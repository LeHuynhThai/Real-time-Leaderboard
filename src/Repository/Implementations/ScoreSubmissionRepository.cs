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

        public async Task<ScoreSubmission> CreateScoreSubmission(ScoreSubmission scoreSubmission)
        {
            _context.ScoreSubmissions.Add(scoreSubmission);
            await _context.SaveChangesAsync();
            return scoreSubmission;
        }

        public async Task<List<ScoreSubmission>> GetAllScoreSubmissions()
        {
            return await _context.ScoreSubmissions.ToListAsync();
        }
    }
}
