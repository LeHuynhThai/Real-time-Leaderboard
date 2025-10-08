using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR
{
    [Authorize]
    public class LeaderboardHub : Hub
    {
        private const string GroupName = "Leaderboard";

        // connect user to leaderboard group
        public override async Task OnConnectedAsync()
        {
            // Add user by connection id to leaderboard group
            await Groups.AddToGroupAsync(Context.ConnectionId, GroupName);
            await base.OnConnectedAsync();
        }

        // disconnect user from leaderboard group
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            // Remove user by connection id from leaderboard group
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupName);
            await base.OnDisconnectedAsync(exception);
        }
    }
}
