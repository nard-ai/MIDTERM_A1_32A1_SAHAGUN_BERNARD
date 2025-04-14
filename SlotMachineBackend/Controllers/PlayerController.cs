using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SlotMachineBackend.Data;
using SlotMachineBackend.Models;
using System;
using System.Linq;

namespace SlotMachineBackend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class PlayerController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PlayerController(AppDbContext context)
        {
            _context = context;
        }

        // ✅ GET /validate-player?studentNumber=C123456
        [HttpGet("/validate-player")]
        public IActionResult ValidatePlayer([FromQuery] string studentNumber)
        {
            if (string.IsNullOrWhiteSpace(studentNumber) || !studentNumber.StartsWith("C"))
            {
                return BadRequest("Invalid student number format. Must start with 'C'.");
            }

            var player = _context.Players.FirstOrDefault(p => p.StudentNumber == studentNumber);

            if (player == null)
            {
                return NotFound("Student number not found.");
            }

            return Ok(new
            {
                studentNumber = player.StudentNumber,
                firstName = player.FirstName,
                lastName = player.LastName
            });
        }

        // ✅ POST /save-game
        public class SaveGameRequest
        {
            public string StudentNumber { get; set; }
            public string Outcome { get; set; } // e.g., "Win" or "Retries: 2"
        }

       [HttpPost("/save-game")]
public IActionResult SaveGame([FromBody] SaveGameRequest request)
{
    if (string.IsNullOrWhiteSpace(request.StudentNumber) || !request.StudentNumber.StartsWith("C"))
    {
        return BadRequest("Invalid student number.");
    }

    var player = _context.Players.FirstOrDefault(p => p.StudentNumber == request.StudentNumber);
    if (player == null)
    {
        return NotFound("Student not found.");
    }

    Console.WriteLine($"Player ID: {player.Id}"); // Debug line

    var gameResult = new GameResult
    {
        PlayerId = player.Id,
        Outcome = request.Outcome,
        DatePlayed = DateTime.UtcNow
    };

    Console.WriteLine($"GameResult: {gameResult.PlayerId}, {gameResult.Outcome}, {gameResult.DatePlayed}"); // Debug line

    _context.GameResults.Add(gameResult);
    _context.SaveChanges();

    return Ok("Game result saved successfully.");
}

        // ✅ GET /games?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
        [HttpGet("/games")]
        public IActionResult GetGames([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var games = _context.GameResults
                .Where(g => g.DatePlayed >= startDate && g.DatePlayed <= endDate)
                .Include(g => g.Player)
                .ToList();

            return Ok(games);
        }

        // ✅ GET /winners?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
        [HttpGet("/winners")]
        public IActionResult GetWinners([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var winners = _context.GameResults
                .Where(g => g.Outcome == "Win" && g.DatePlayed >= startDate && g.DatePlayed <= endDate)
                .Include(g => g.Player)
                .ToList();

            return Ok(winners);
        }

[HttpGet("/recent-players")]
public IActionResult GetRecentPlayers()
{
    var threeHoursAgo = DateTime.UtcNow.AddHours(-3);
    
    var recentPlayerNumbers = _context.GameResults
        .Where(g => g.DatePlayed >= threeHoursAgo)
        .Select(g => g.Player.StudentNumber)
        .Distinct()
        .ToList();

    return Ok(recentPlayerNumbers);
}

    }
}
