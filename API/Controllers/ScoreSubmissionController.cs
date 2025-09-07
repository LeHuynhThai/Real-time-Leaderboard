using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
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
        private readonly IScoreSubmissionService _scoreSubmissionService;

        public ScoreSubmissionController(IScoreSubmissionService scoreSubmissionService)
        {
            _scoreSubmissionService = scoreSubmissionService;
        }

        [HttpPost("submit-score")]
        public async Task<IActionResult> SubmitScore([FromBody] SubmitScoreRequest request)
        {
            // Get userId from JWT claims: prefer custom "userId" then fallback to NameIdentifier
            var userIdClaim = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId) || userId <= 0)
            {
                return Unauthorized(new { success = false, message = "Invalid or missing user ID in token" });
            }

            try
            {
                var result = await _scoreSubmissionService.SubmitScore(userId, request.Score);
                // Return minimal DTO to avoid serialization cycles
                return Ok(new {
                    success = true,
                    data = new {
                        id = result.Id,
                        userId = result.UserId,
                        score = result.Score,
                        createdAt = result.CreatedAt,
                        status = result.Status.ToString()
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("update-score")]
        public async Task<IActionResult> UpdateScore([FromBody] SubmitScoreRequest request)
        {
            var userIdClaim = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId) || userId <= 0)
            {
                return Unauthorized(new { success = false, message = "Invalid or missing user ID in token" });
            }

            try
            {
                var result = await _scoreSubmissionService.UpdateScore(userId, request.Score);
                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        id = result.Id,
                        userId = result.UserId,
                        score = result.Score,
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

        [HttpGet("all")]
        public async Task<IActionResult> GetAllScoreSubmissions()
        {
            var results = await _scoreSubmissionService.GetAllScoreSubmissions();
            var dto = results.Select(r => new {
                id = r.Id,
                userId = r.UserId,
                userName = r.User?.UserName,
                score = r.Score,
                createdAt = r.CreatedAt,
                status = r.Status.ToString()
            });
            return Ok(new { success = true, data = dto });
        }


    }

    public class SubmitScoreRequest
    {
        public int Score { get; set; }
    }
}
