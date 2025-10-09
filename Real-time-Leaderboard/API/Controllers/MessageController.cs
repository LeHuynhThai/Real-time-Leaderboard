using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service.Interfaces;
using System.Security.Claims;
using Repository.DTOs;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MessageController : ControllerBase
    {
        private readonly IMessageService _messageService;

        public MessageController(IMessageService messageService)
        {
            _messageService = messageService;
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
        {
            try
            {
                var senderId = GetCurrentUserId();
                var message = await _messageService.SendMessage(senderId, request.ReceiverId, request.Content);

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        id = message.Id,
                        senderId = message.SenderId,
                        receiverId = message.ReceiverId,
                        content = message.Content,
                        createdAt = message.CreatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("with/{userId}")]
        public async Task<IActionResult> GetConversation(int userId)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var messages = await _messageService.GetConversation(currentUserId, userId);

                var data = messages.Select(m => new
                {
                    id = m.Id,
                    senderId = m.SenderId,
                    receiverId = m.ReceiverId,
                    content = m.Content,
                    createdAt = m.CreatedAt
                });

                return Ok(new { success = true, data });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("with/{userId}/last")]
        public async Task<IActionResult> GetLastMessage(int userId)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var message = await _messageService.GetLastMessageBetween(currentUserId, userId);
                if (message == null)
                {
                    return Ok(new { success = true, data = (object?)null });
                }

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        id = message.Id,
                        senderId = message.SenderId,
                        receiverId = message.ReceiverId,
                        content = message.Content,
                        createdAt = message.CreatedAt
                    }
                });
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
}


