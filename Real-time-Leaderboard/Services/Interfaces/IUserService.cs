using Repository.Entities;

namespace Service.Interfaces
{
    public interface IUserService
    {
        Task<User> Register(User user);
        Task<User> Login(string username, string password);
    }
}
