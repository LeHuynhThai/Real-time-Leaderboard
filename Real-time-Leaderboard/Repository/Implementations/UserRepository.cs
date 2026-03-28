using Microsoft.EntityFrameworkCore;
using Repository.Data;
using Repository.Entities;
using Repository.Interfaces;

namespace Repository.Implementations
{
    public class SqlUserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public SqlUserRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetUserById(int id)
        {
            return await _context.User
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<User> GetUserByUsername(string username)
        {
            return await _context.User
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserName.ToLower() == username.ToLower());
        }

        public async Task<User> AddUser(User user)
        {
            user.CreatedAt = DateTime.UtcNow;
            user.IsActive = true;

            _context.User.Add(user);
            await _context.SaveChangesAsync();

            return user;
        }
    }
}
