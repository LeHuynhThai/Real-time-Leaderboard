using Repository.Entities;
using Repository.Interfaces;
using Service.Interfaces;

namespace Service.Implementations
{
    public class FriendService : IFriendService
    {
        private readonly IFriendRepository _friendRepository;
        private readonly IUserRepository _userRepository;

        public FriendService(IFriendRepository friendRepository, IUserRepository userRepository)
        {
            _friendRepository = friendRepository;
            _userRepository = userRepository;
        }

        public async Task<Friend> SendFriendRequest(int senderId, int receiverId)
        {
            if (senderId == receiverId)
            {
                throw new Exception("Cannot send friend request to yourself");
            }

            // Validate that both users exist
            var sender = await _userRepository.GetUserById(senderId);
            if (sender == null)
            {
                throw new Exception($"Sender user with ID {senderId} not found");
            }

            var receiver = await _userRepository.GetUserById(receiverId);
            if (receiver == null)
            {
                throw new Exception($"Receiver user with ID {receiverId} not found");
            }

            // Check if friend request already exists
            var existingRequest = await _friendRepository.GetFriendById(senderId, receiverId);
            if (existingRequest != null)
            {
                throw new Exception("Friend request already exists");
            }

            var friendRequest = new Friend
            {
                SenderId = senderId,
                ReceiverId = receiverId,
                Status = FriendStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            return await _friendRepository.AddFriend(friendRequest);
        }

        public async Task<Friend> AcceptFriendRequest(int friendId)
        {
            var friendRequest = await _friendRepository.GetFriendById(friendId);
            if (friendRequest == null)
            {
                throw new Exception("Friend request not found");
            }

            friendRequest.Status = FriendStatus.Accepted;
            friendRequest.UpdatedAt = DateTime.UtcNow;

            return await _friendRepository.UpdateFriend(friendRequest);
        }

        public async Task<Friend> RejectFriendRequest(int friendId)
        {
            var friendRequest = await _friendRepository.GetFriendById(friendId);
            if (friendRequest == null)
            {
                throw new Exception("Friend request not found");
            }

            friendRequest.Status = FriendStatus.Rejected;
            friendRequest.UpdatedAt = DateTime.UtcNow;

            return await _friendRepository.UpdateFriend(friendRequest);
        }

        public async Task<bool> RemoveFriend(int friendId)
        {
            return await _friendRepository.DeleteFriend(friendId);
        }

        public async Task<List<Friend>> GetFriendsList(int userId)
        {
            return await _friendRepository.GetFriendsList(userId);
        }
    }
}