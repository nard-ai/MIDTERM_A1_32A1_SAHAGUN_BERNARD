using System;
using System.Text.Json.Serialization;

namespace SlotMachineBackend.Models
{
    public class GameResult
    {
        public int Id { get; set; }

        public int PlayerId { get; set; }  // Foreign key
        public Player Player { get; set; } // Navigation property

        public string Outcome { get; set; } // "Win" or "Retries: 2"
        public DateTime DatePlayed { get; set; }



    }
    
}
