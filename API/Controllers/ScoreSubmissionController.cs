using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Repository.Entities;
using Service.Interfaces;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ScoreSubmissionController : ControllerBase
    {
        private readonly IScoreSubmissionService _scoreSubmissionService;

        public ScoreSubmissionController(IScoreSubmissionService scoreSubmissionService)
        {
            _scoreSubmissionService = scoreSubmissionService;
        }

        [HttpPost("submit")]
        public async Task<IActionResult> SubmitScore([FromBody] SubmitScoreRequest request)
        {
            var scoreSubmission = new ScoreSubmission
            {
                UserId = // You will need to retrieve the UserId from the JWT claims here,
                Score = request.Score,
                CreatedAt = DateTime.UtcNow,
                Status = SubmissionStatus.Approved
            };

            var result = await _scoreSubmissionService.CreateScoreSubmission(scoreSubmission);
            return Ok(result);
        }   

        [HttpGet("all")]
        public async Task<IActionResult> GetAllScoreSubmissions()
        {
            var result = await _scoreSubmissionService.GetAllScoreSubmissions();
            return Ok(result);
        }
    }
}

public class SubmitScoreRequest
{
    public int Score { get; set; }
}
