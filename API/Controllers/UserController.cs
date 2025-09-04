using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Repository.Entities;
using Service.Interfaces;

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
            catch (System.Exception ex)
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
                            role = user.Role.ToString()
                        },
                        token = token
                    }
                });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            return Ok(new { message = "Logged out successfully" });
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
