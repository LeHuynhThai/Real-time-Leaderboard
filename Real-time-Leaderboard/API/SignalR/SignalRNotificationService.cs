using Microsoft.AspNetCore.SignalR;
using Service.Interfaces;

namespace API.SignalR
{
    public class SignalRNotificationService : INotificationService
    {
        private readonly IHubContext<LeaderboardHub> _hubContext;

        public SignalRNotificationService(IHubContext<LeaderboardHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task NotifyLeaderboardUpdated(object payload)
        {
            await _hubContext.Clients.Group("Leaderboard").SendAsync("LeaderboardUpdate", payload);
        }
    }
}
