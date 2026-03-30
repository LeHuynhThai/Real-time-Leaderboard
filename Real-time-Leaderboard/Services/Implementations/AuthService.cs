using Repository.Entities;
using Service.Interfaces;

namespace Service.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly IUserService _userService;
        private readonly IAuthTokenService _authTokenService;

        public AuthService(IUserService userService, IAuthTokenService authTokenService)
        {
            _userService = userService;
            _authTokenService = authTokenService;
        }

        public async Task<(User user, string token)> Login(string username, string password)
        {
            var user = await _userService.Login(username, password);
            var token = GenerateToken(user);
            return (user, token);
        }

        public async Task<(User user, string token)> Register(User user)
        {
            var registeredUser = await _userService.Register(user);
            var token = GenerateToken(registeredUser);
            return (registeredUser, token);
        }

        public string GenerateToken(User user)
        {
            return _authTokenService.GenerateToken(user);
        }
    }
}
