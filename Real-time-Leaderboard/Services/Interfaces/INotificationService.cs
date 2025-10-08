using Services.DTOs;
namespace Service.Interfaces
{
    public interface INotificationService
    {
        Task NotifyLeaderboardUpdated(object payload);
        Task NotifyNewMessage(MessageNotificationDto payload);
    }
}