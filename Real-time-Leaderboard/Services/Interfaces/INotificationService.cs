namespace Service.Interfaces
{
    public interface INotificationService
    {
        Task NotifyLeaderboardUpdated(object payload);
    }
}