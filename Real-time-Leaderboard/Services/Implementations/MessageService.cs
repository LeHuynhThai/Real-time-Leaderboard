using Repository.Entities;
using Repository.Interfaces;
using Service.Interfaces;

namespace Service.Implementations
{
    public class MessageService : IMessageService
    {
        private readonly IMessageRepository _messageRepository;
        private readonly IUserRepository _userRepository;

        public MessageService(IMessageRepository messageRepository, IUserRepository userRepository)
        {
            _messageRepository = messageRepository;
            _userRepository = userRepository;
        }

        public async Task<Message> SendMessage(int senderId, int receiverId, string content)
        {
            if (senderId == receiverId)
            {
                throw new ArgumentException("Cannot send message to yourself", nameof(receiverId));
            }
            if (string.IsNullOrWhiteSpace(content))
            {
                throw new ArgumentException("Message content is required", nameof(content));
            }

            // Validate users exist
            var sender = await _userRepository.GetUserById(senderId);
            if (sender == null)
            {
                throw new InvalidOperationException($"Sender with ID {senderId} not found");
            }
            var receiver = await _userRepository.GetUserById(receiverId);
            if (receiver == null)
            {
                throw new InvalidOperationException($"Receiver with ID {receiverId} not found");
            }

            var message = new Message
            {
                SenderId = senderId,
                ReceiverId = receiverId,
                Content = content.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            return await _messageRepository.AddMessage(message);
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


