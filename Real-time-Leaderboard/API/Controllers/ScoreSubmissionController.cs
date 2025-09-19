using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Repository.Entities;
using Service.Interfaces;
using System.Security.Claims;
namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ScoreSubmissionController : ControllerBase
    {
        private readonly IScoreService _scoreSubmissionService;

        public ScoreSubmissionController(IScoreService scoreSubmissionService)
        {
            _scoreSubmissionService = scoreSubmissionService;
        }

        [HttpPost("save-score")]
        public async Task<IActionResult> UpdateScore([FromBody] SubmitScoreRequest request)
        {
            var userIdClaim = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId) || userId <= 0)
            {
                return Unauthorized(new { success = false, message = "Invalid or missing user ID in token" });
            }
            try
            {
                var result = await _scoreSubmissionService.SaveScore(userId, request.Score);
                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        id = result.Id,
                        userId = result.UserId,
                        score = result.UserScore,
                        UpdatedAt = result.UpdatedAt,
                        status = result.Status.ToString()
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMyScore()
        {
            var userIdClaim = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId) || userId <= 0)
            {
                return Unauthorized(new { success = false, message = "Invalid or missing user ID in token" });
            }

            var result = await _scoreSubmissionService.GetMyScore(userId);
            // If user has no score yet, return default score 0 instead of throwing
            if (result == null)
            {
                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        userId = userId,
                        score = 0,
                    }
                });
            }

            return Ok(new
            {
                success = true,
                data = new
                {
                    userId = result.UserId,
                    score = result.UserScore,
                }
            });
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetLeaderboard(int n = 10)
        {
            var result = await _scoreSubmissionService.GetLeaderboard(n);
            var response = result.Select((s, index) => new
            {
                Rank = index + 1,
                UserName = s.User.UserName,
                Score = s.UserScore
            });
            return Ok(new { success = true, data = response });
        }

        [HttpGet("my-rank")]
        public async Task<IActionResult> GetMyRank()
        {
            var userIdClaim = User.FindFirst("userId")?.Value 
                ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId) || userId <= 0)
            {
                return Unauthorized(new { success = false, message = "Invalid or missing user ID in token" });
            }

            var rank = await _scoreSubmissionService.GetMyRank(userId);

            return Ok(new
            {
                success = true,
                data = new { rank }
            });
        }
    }

    public class SubmitScoreRequest
    {
        public int Score { get; set; }
    }
}
