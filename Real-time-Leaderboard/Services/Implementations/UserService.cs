using BCrypt.Net;
using Repository.Entities;
using Repository.Interfaces;
using Service.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service.Implementations
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<User> Login(string username, string password)
        {
            var user = await _userRepository.GetUserByUsername(username);
            if (user == null)
            {
                throw new Exception("User not found");
            }

            if (!VerifyPassword(password, user.PasswordHash))
            {
                throw new Exception("Invalid password");
            }

            return user;
        }

        public async Task<User> Register(User user)
        {
            // hash password before saving
            if (!string.IsNullOrEmpty(user.PasswordHash))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);
            }
            
            return await _userRepository.AddUser(user);
        }

        // verify password for login service
        public bool VerifyPassword(string password, string hashedPassword)
        {
            return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
        }

        public async Task<User> UpdateAvatar(int userId, string avatar)
        {
            var user = await _userRepository.GetUserById(userId);
            if (user == null)
            {
                throw new Exception("User not found");
            }
            user.Avatar = avatar;
            return await _userRepository.UpdateUser(user);
        }
    }
}
