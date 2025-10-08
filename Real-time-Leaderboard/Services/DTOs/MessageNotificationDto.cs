namespace Services.DTOs
{
    public class MessageNotificationDto
    {
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }
        public string Message { get; set; }
    }
}