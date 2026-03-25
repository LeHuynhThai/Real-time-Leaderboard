using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Repository.Interfaces;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SeederController : ControllerBase
    {
        private readonly IDataSeeder _dataSeeder;
        private readonly ILogger<SeederController> _logger;

        public SeederController(IDataSeeder dataSeeder, ILogger<SeederController> logger)
        {
            _dataSeeder = dataSeeder;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> Seed()
        {
            try
            {
                _logger.LogInformation("Starting seeding 1000 users and scores...");
                await _dataSeeder.SeedAsync(1000);
                _logger.LogInformation("Seeding completed successfully");
                return Ok(new { message = "Seeded 1000 users and scores successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while seeding data");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpDelete]
        public async Task<IActionResult> ClearData()
        {
            try
            {
                _logger.LogInformation("Clearing all data...");
                await _dataSeeder.ClearAllDataAsync();
                _logger.LogInformation("Data cleared successfully");
                return Ok(new { message = "All data cleared successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while clearing data");
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}

// Commands:
// Note: Run project first, then use postman to send requests to the endpoints
// Seed 1000 users + scores
// https://localhost:yourport/api/seeder


// Clear all data
// https://localhost:yourport/api/seeder
