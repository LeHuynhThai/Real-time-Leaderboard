using Repository.Entities;

namespace Service.Interfaces
{
    public interface IAuthTokenService
    {
        string GenerateToken(User user);
    }
}
