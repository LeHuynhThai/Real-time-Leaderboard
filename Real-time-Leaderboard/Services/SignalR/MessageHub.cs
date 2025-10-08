using Microsoft.AspNetCore.SignalR;

namespace API.SignalR
{
    public class MessageHub : Hub
    {
        public async Task SendMessage(int senderId, int receiverId, string message)
        {
            await Clients.User(receiverId.ToString()).SendAsync("ReceiveMessage", senderId, message);
        }
    }
}


