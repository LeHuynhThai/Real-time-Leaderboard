using Microsoft.AspNetCore.SignalR;
using API.SignalR;
using Service.Interfaces;

namespace Service.Implementations
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
            await _hubContext.Clients.All.SendAsync("LeaderboardUpdated", payload);
        }
    }
}
