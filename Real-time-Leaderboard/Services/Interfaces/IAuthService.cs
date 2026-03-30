using Repository.Entities;

namespace Service.Interfaces
{
    public interface IAuthService
    {
        Task<(User user, string token)> Login(string username, string password);
        Task<(User user, string token)> Register(User user);
        string GenerateToken(User user);
    }
}
