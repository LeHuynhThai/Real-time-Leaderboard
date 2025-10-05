using Repository.Entities;

namespace Repository.Interfaces
{
    public interface IMessageRepository
    {
        Task<Message> AddMessage(Message message);
        Task<List<Message>> GetConversation(int userId1, int userId2);
        Task<Message?> GetLastMessageBetween(int userId1, int userId2);
    }
}


