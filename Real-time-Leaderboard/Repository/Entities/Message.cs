using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Repository.Entities
{
    public class Message
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int SenderId { get; set; }

        [Required]
        public int ReceiverId { get; set; }

        [Required]
        [MaxLength(1000)]
        public string Content { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("SenderId")]
        public virtual User Sender { get; set; }

        [ForeignKey("ReceiverId")]
        public virtual User Receiver { get; set; }
    }
}
