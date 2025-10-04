using Repository.Entities;

namespace Repository.Interfaces
{
    public interface IFriendRepository
    {
        Task<Friend> AddFriend(Friend friend);
        Task<Friend> UpdateFriend(Friend friend);
        Task<Friend> GetFriendById(int id);
        Task<Friend> GetFriendById(int senderId, int receiverId);
        Task<bool> DeleteFriend(int id);
        Task<List<Friend>> GetFriendsList(int userId);
    }
}