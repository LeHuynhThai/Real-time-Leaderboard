using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service.Interfaces;
using System.Security.Claims;
namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ScoreController : ControllerBase
    {
        private readonly IScoreService _scoreService;

        public ScoreController(IScoreService scoreService)
        {
            _scoreService = scoreService;
        }

        [HttpPost("save-score")]
        public async Task<IActionResult> UpdateScore([FromBody] API.Models.ScoreRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _scoreService.SaveScore(userId, request.Score);
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
            var userId = GetCurrentUserId();
            var result = await _scoreService.GetMyScore(userId);
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

        [AllowAnonymous]
        [HttpGet("all")]
        public async Task<IActionResult> GetLeaderboard(int skip = 0, int take = 100)
        {
            var result = await _scoreService.GetLeaderboard(skip, take);
            var totalCount = await _scoreService.GetLeaderboardCount();
            var response = result.Select((s, index) => new
            {
                Rank = skip + index + 1,
                UserName = s.User.UserName,
                Score = s.UserScore
            });
            return Ok(new { success = true, data = response, totalCount });
        }

        [AllowAnonymous]
        [HttpGet("search")]
        public async Task<IActionResult> SearchPlayers(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return BadRequest(new { success = false, message = "Query is required" });
            }

            var result = await _scoreService.SearchPlayers(query);
            var response = result.Select(item => new
            {
                Rank = item.Rank,  // Now returns actual global rank
                UserName = item.Score.User.UserName,
                Score = item.Score.UserScore
            });
            return Ok(new { success = true, data = response });
        }

        [HttpGet("my-rank")]
        public async Task<IActionResult> GetMyRank()
        {
            var userId = GetCurrentUserId();
            var rank = await _scoreService.GetMyRank(userId);
            return Ok(new
            {
                success = true,
                data = new { rank }
            });
        }
        
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId) || userId <= 0)
            {
                throw new UnauthorizedAccessException("Invalid or missing user ID in token");
            }
            return userId;
        }
    }
}
