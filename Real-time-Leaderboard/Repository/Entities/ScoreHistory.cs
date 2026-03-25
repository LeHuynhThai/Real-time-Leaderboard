using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Repository.Entities
{
    public class ScoreHistory
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public int ScoreValue { get; set; }

        public DateTime RecordedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(50)]
        public string GameMode { get; set; } = "default";

        [ForeignKey("UserId")]
        public virtual User? User { get; set; }
    }
}
