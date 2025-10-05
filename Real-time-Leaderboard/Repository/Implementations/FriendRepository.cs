using Microsoft.EntityFrameworkCore;
using Repository.Entities;
using Repository.Interfaces;

namespace Repository.Implementations
{
    public class FriendRepository : IFriendRepository
    {
        private readonly AppDbContext _context;

        public FriendRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Friend> AddFriend(Friend friend)
        {
            // Validate that both users exist before adding
            var senderExists = await _context.Users.AnyAsync(u => u.Id == friend.SenderId);
            if (!senderExists)
            {
                throw new InvalidOperationException($"Sender with ID {friend.SenderId} does not exist");
            }

            var receiverExists = await _context.Users.AnyAsync(u => u.Id == friend.ReceiverId);
            if (!receiverExists)
            {
                throw new InvalidOperationException($"Receiver with ID {friend.ReceiverId} does not exist");
            }

            _context.Friends.Add(friend);
            await _context.SaveChangesAsync();
            return friend;
        }

        public async Task<Friend> UpdateFriend(Friend friend)
        {
            friend.UpdatedAt = DateTime.UtcNow;
            _context.Friends.Update(friend);
            await _context.SaveChangesAsync();
            return friend;
        }

        public async Task<Friend> GetFriendById(int id)
        {
            return await _context.Friends
                .Include(f => f.Sender)
                .Include(f => f.Receiver)
                .FirstOrDefaultAsync(f => f.Id == id);
        }

        public async Task<Friend> GetFriendById(int senderId, int receiverId)
        {
            return await _context.Friends
                .Include(f => f.Sender)
                .Include(f => f.Receiver)
                .FirstOrDefaultAsync(f => f.SenderId == senderId && f.ReceiverId == receiverId);
        }

        public async Task<bool> DeleteFriend(int id)
        {
            var friend = await _context.Friends.FindAsync(id);
            if (friend == null) return false;

            _context.Friends.Remove(friend);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Friend>> GetFriendsList(int userId)
        {
            return await _context.Friends
                .Include(f => f.Sender)
                .Include(f => f.Receiver)
                .Where(f => (f.SenderId == userId || f.ReceiverId == userId) &&
                           f.Status == FriendStatus.Accepted)
                .ToListAsync();
        }

        public async Task<List<Friend>> GetFriendRequests(int userId)
        {
            return await _context.Friends
                .Include(f => f.Sender)
                .Include(f => f.Receiver)
                .Where(f => f.ReceiverId == userId && f.Status == FriendStatus.Pending)
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();
        }
    }
}