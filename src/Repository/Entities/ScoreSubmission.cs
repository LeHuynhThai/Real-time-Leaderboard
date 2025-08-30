using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repository.Entities
{
    public class ScoreSubmission
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int Score { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public virtual User User { get; set; } = null!;
    }

    public enum SubmissionStatus
    {
        Pending,
        Approved,
        Rejected
    }
}
