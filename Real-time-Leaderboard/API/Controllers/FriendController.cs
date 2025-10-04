using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service.Interfaces;
using System.Security.Claims;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FriendController : ControllerBase
    {
        private readonly IFriendService _friendService;

        public FriendController(IFriendService friendService)
        {
            _friendService = friendService;
        }

        [HttpPost("send-request")]
        public async Task<IActionResult> SendFriendRequest([FromBody] SendFriendRequestRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var friendRequest = await _friendService.SendFriendRequest(userId, request.ReceiverId);

                return Ok(new { success = true, data = friendRequest });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("accept/{friendId}")]
        public async Task<IActionResult> AcceptFriendRequest(int friendId)
        {
            try
            {
                var friendRequest = await _friendService.AcceptFriendRequest(friendId);
                return Ok(new { success = true, data = friendRequest });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("reject/{friendId}")]
        public async Task<IActionResult> RejectFriendRequest(int friendId)
        {
            try
            {
                var friendRequest = await _friendService.RejectFriendRequest(friendId);
                return Ok(new { success = true, data = friendRequest });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("{friendId}")]
        public async Task<IActionResult> RemoveFriend(int friendId)
        {
            try
            {
                var result = await _friendService.RemoveFriend(friendId);
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetFriendsList()
        {
            try
            {
                var userId = GetCurrentUserId();
                var friends = await _friendService.GetFriendsList(userId);
                return Ok(new { success = true, data = friends });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
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

    public class SendFriendRequestRequest
    {
        public int ReceiverId { get; set; }
    }
}