using Microsoft.AspNetCore.SignalR;
using Service.Interfaces;
using Repository.DTOs;

namespace API.SignalR
{
    public class SignalRNotificationService : INotificationService
    {
        private readonly IHubContext<LeaderboardHub> _leaderboardHub;
        private readonly IHubContext<MessageHub> _messageHub;

        public SignalRNotificationService(IHubContext<LeaderboardHub> leaderboardHub, IHubContext<MessageHub> messageHub)
        {
            _leaderboardHub = leaderboardHub;
            _messageHub = messageHub;
        }

        public async Task NotifyLeaderboardUpdated(object payload)
        {
            await _leaderboardHub.Clients.Group("Leaderboard").SendAsync("LeaderboardUpdate", payload);
        }

        public async Task NotifyNewMessage(MessageNotificationDto payload)
        {
            await _messageHub.Clients.User(payload.ReceiverId.ToString()).SendAsync("ReceiveMessage", payload.SenderId, payload.Message);
        }
    }
}
