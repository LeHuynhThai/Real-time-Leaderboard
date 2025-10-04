using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Repository.Entities;
using Service.Interfaces;
using System.Security.Claims;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IJwtTokenService _jwtTokenService;

        public UserController(IUserService userService, IJwtTokenService jwtTokenService)
        {
            _userService = userService;
            _jwtTokenService = jwtTokenService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                var user = new User
                {
                    UserName = request.Username,
                    Email = request.Email,
                    PasswordHash = request.Password
                };
                var result = await _userService.Register(user);
                return Ok(new { success = true , data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var user = await _userService.Login(request.Username, request.Password);
                
                // Generate JWT token
                var token = _jwtTokenService.GenerateToken(user);
                
                return Ok(new { 
                    success = true, 
                    data = new {
                        user = new {
                            userId = user.Id,
                            userName = user.UserName,
                            email = user.Email,
                            avatar = user.Avatar,
                            role = user.Role.ToString()
                        },
                        token = token
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            return Ok(new { message = "Logged out successfully" });
        }

        [HttpPost("update-avatar")]
        public async Task<IActionResult> UpdateAvatar(IFormFile avatar)
        {
            var userIdClaim = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId) || userId <= 0)
            {
                return Unauthorized(new { success = false, message = "Invalid or missing user ID in token" });
            }
            try
            {
                if (avatar == null || avatar.Length == 0)
                {
                    return BadRequest(new { success = false, message = "No file uploaded" });
                }
                if (avatar.Length > 1024 * 1024)
                {
                    return BadRequest(new { success = false, message = "File size too large. Maximum size is 1MB" });
                }
                
                var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
                if (!allowedTypes.Contains(avatar.ContentType))
                {
                    return BadRequest(new { success = false, message = "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed" });
                }

                // convert to base64
                using var memoryStream = new MemoryStream();
                await avatar.CopyToAsync(memoryStream);
                var imageBytes = memoryStream.ToArray();
                var base64String = Convert.ToBase64String(imageBytes);
                var dataUrl = $"data:{avatar.ContentType};base64,{base64String}";

                var user = await _userService.UpdateAvatar(userId, dataUrl);
                return Ok(new { success = true, data = new 
                    {
                        avatar = user.Avatar
                    } });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchUsers([FromQuery] string query, [FromQuery] int limit = 10)
        {
            try
            {
                var users = await _userService.SearchUsers(query, limit);
                return Ok(new { success = true, data = users });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }

    public class RegisterRequest
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class LoginRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }
}
