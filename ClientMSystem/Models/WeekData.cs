

using System.ComponentModel.DataAnnotations;

namespace ClientMSystem.Models
{
    public class WeekData
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Day { get; set; }
        [Required]
        public string Task { get; set; }
        [Required]
        public DateTime Date { get; set; }
        [Required]
        public int Hours { get; set; }
        [Required]

        public string? UserName { get; set; }
    }
}
