using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Repository.Entities;

namespace Service.Interfaces
{
    public interface IJwtTokenService
    {
        string GenerateToken(User user);
        bool ValidateToken(string token);
    }
}
