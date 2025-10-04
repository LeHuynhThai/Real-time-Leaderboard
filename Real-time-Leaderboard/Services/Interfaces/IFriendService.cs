using Repository.Entities;

namespace Service.Interfaces
{
    public interface IFriendService
    {
        Task<Friend> SendFriendRequest(int senderId, int receiverId);
        Task<Friend> AcceptFriendRequest(int friendId);
        Task<Friend> RejectFriendRequest(int friendId);
        Task<bool> RemoveFriend(int friendId);
        Task<List<Friend>> GetFriendsList(int userId);
    }
}