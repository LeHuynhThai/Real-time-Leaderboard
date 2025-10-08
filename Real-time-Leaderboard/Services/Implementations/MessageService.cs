using Repository.Entities;
using Repository.Interfaces;
using Service.Interfaces;
using Services.DTOs;

namespace Service.Implementations
{
    public class MessageService : IMessageService
    {
        private readonly IMessageRepository _messageRepository;
        private readonly IUserRepository _userRepository;
        private readonly INotificationService _notification;
        public MessageService(IMessageRepository messageRepository, IUserRepository userRepository, INotificationService notification)
        {
            _messageRepository = messageRepository;
            _userRepository = userRepository;
            _notification = notification;
        }

        public async Task<Message> SendMessage(int senderId, int receiverId, string content)
        {
            if (string.IsNullOrWhiteSpace(content))
            {
                throw new ArgumentException("Message content is required", nameof(content));
            }
            var message = new Message
            {
                SenderId = senderId,
                ReceiverId = receiverId,
                Content = content.Trim(),
                CreatedAt = DateTime.UtcNow
            };
            var savedMessage = await _messageRepository.AddMessage(message);
            await _notification.NotifyNewMessage(new MessageNotificationDto
            {
                SenderId = senderId,
                ReceiverId = receiverId,
                Message = message.Content
            });
            
            return savedMessage;
        }

        public Task<List<Message>> GetConversation(int userId1, int userId2)
        {
            return _messageRepository.GetConversation(userId1, userId2);
        }

        public Task<Message?> GetLastMessageBetween(int userId1, int userId2)
        {
            return _messageRepository.GetLastMessageBetween(userId1, userId2);
        }
    }
}


