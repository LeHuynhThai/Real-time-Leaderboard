using Repository.Entities;

namespace Repository.Interfaces
{
    public interface IUserRepository
    {
        Task<User> AddUser(User user);
        Task<User> GetUserByUsername(string username);
        Task<User?> GetUserById(int id);
    }
}
