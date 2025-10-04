using Repository.Entities;

namespace Repository.Interfaces
{
    public interface IUserRepository
    {
        Task<User> GetUserById(int id);
        Task<User> AddUser(User user);
        Task<User> GetUserByUsername(string username);
        Task<User> UpdateUser(User user);
        Task<List<User>> SearchUsers(string query, int limit = 10);
    }
}
