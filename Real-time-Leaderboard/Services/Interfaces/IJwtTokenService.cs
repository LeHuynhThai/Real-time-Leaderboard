using Repository.Entities;

namespace Service.Interfaces
{
    public interface IJwtTokenService
    {
        string GenerateToken(User user);
    }
}
