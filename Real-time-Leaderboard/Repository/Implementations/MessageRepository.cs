using Microsoft.EntityFrameworkCore;
using Repository.Entities;
using Repository.Interfaces;

namespace Repository.Implementations
{
    public class MessageRepository : IMessageRepository
    {
        private readonly AppDbContext _context;

        public MessageRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Message> AddMessage(Message message)
        {
            _context.Messages.Add(message);
            await _context.SaveChangesAsync();
            return message;
        }

        public async Task<List<Message>> GetConversation(int userId1, int userId2)
        {
            var minId = Math.Min(userId1, userId2);
            var maxId = Math.Max(userId1, userId2);

            return await _context.Messages
                .Where(m => (m.SenderId == minId && m.ReceiverId == maxId) ||
                            (m.SenderId == maxId && m.ReceiverId == minId))
                .OrderBy(m => m.CreatedAt)
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .ToListAsync();
        }

        public async Task<Message?> GetLastMessageBetween(int userId1, int userId2)
        {
            var minId = Math.Min(userId1, userId2);
            var maxId = Math.Max(userId1, userId2);

            return await _context.Messages
                .Where(m => (m.SenderId == minId && m.ReceiverId == maxId) ||
                            (m.SenderId == maxId && m.ReceiverId == minId))
                .OrderByDescending(m => m.CreatedAt)
                .FirstOrDefaultAsync();
        }
    }
}


