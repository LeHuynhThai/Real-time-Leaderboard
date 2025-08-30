using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repository.DTOs
{
    public class SubmitScoreRequest
    {
        public int UserId { get; set; }
        public decimal Score { get; set; }
        public string? Comment { get; set; }
    }
}
