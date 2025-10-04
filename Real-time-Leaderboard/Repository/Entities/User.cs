using System.ComponentModel.DataAnnotations;

namespace Repository.Entities
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(10, ErrorMessage = "UserName không được vượt quá 10 ký tự")]
        public string UserName { get; set; }

        public string Email { get; set; }

        public string PasswordHash { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public UserRole Role { get; set; } = UserRole.User;

        public string? Avatar { get; set; }

        public virtual Score Score { get; set; }
    }

    public enum UserRole
    {
        Admin,
        User
    }
}
