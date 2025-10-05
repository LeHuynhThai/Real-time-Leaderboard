using Repository.Entities;

namespace Service.Interfaces
{
    public interface IMessageService
    {
        Task<Message> SendMessage(int senderId, int receiverId, string content);
        Task<List<Message>> GetConversation(int userId1, int userId2);
        Task<Message?> GetLastMessageBetween(int userId1, int userId2);
    }
}


