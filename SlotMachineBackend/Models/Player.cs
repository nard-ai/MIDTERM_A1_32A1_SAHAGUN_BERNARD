namespace SlotMachineBackend.Models;

public class Player
{
    public int Id { get; set; }
    public string StudentNumber { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }

    public List<GameResult> GameResults { get; set; }
    
}
