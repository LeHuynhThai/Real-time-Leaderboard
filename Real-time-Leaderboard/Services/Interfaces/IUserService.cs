using Repository.Entities;

namespace Service.Interfaces
{
    public interface IUserService
    {
        Task<User> Register(User user);
        Task<User> Login(string username, string password);
        bool VerifyPassword(string password, string hashedPassword);
        Task<User> UpdateAvatar(int userId, string avatar);
        Task<List<User>> SearchUsers(string query, int limit = 10);
    }
}
