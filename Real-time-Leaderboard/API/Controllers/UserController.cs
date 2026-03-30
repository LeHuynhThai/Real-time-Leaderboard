using Microsoft.AspNetCore.Mvc;
using Repository.Entities;
using Service.Interfaces;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IAuthService _authService;

        public UserController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] API.Models.RegisterRequest request)
        {
            try
            {
                var newUser = new User
                {
                    UserName = request.Username,
                    Email = request.Email,
                    PasswordHash = request.Password // UserService.Register will hash this
                };

                var (registeredUser, token) = await _authService.Register(newUser);
                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        user = new
                        {
                            userId = registeredUser.Id,
                            userName = registeredUser.UserName,
                            email = registeredUser.Email
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

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] API.Models.LoginRequest request)
        {
            try
            {
                var (loggedInUser, token) = await _authService.Login(request.Username, request.Password);

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        user = new
                        {
                            userId = loggedInUser.Id,
                            userName = loggedInUser.UserName,
                            email = loggedInUser.Email
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
    }
}
