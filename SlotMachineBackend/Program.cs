using Microsoft.EntityFrameworkCore;
using SlotMachineBackend.Data;
using SlotMachineBackend.Models;
using Microsoft.Extensions.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.Preserve;
        options.JsonSerializerOptions.WriteIndented = true;
    });

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=slotmachine.db"));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // Frontend port
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Enable Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// ADD THIS LINE to enable CORS
app.UseCors("AllowFrontend");

app.UseAuthorization();

// THIS IS CRITICAL
app.MapControllers();

// Seed data if needed
SeedData(app);

app.Run();

// Method to seed data
// Seed data if needed
void SeedData(WebApplication app)
{
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        context.Database.Migrate(); // Make sure the database schema is up to date.

        // Check if the Players table is empty
        if (!context.Players.Any())
        {
            context.Players.AddRange(new List<Player>
            {
                new Player { StudentNumber = "C123456", FirstName = "John", LastName = "Doe" },
                new Player { StudentNumber = "C234567", FirstName = "Jane", LastName = "Smith" },
                new Player { StudentNumber = "C345678", FirstName = "Michael", LastName = "Johnson" },
                new Player { StudentNumber = "C456789", FirstName = "Emily", LastName = "Davis" },
                new Player { StudentNumber = "C567890", FirstName = "David", LastName = "Martinez" },
                new Player { StudentNumber = "C678901", FirstName = "Rowan", LastName = "Romero"}
                // Add more players as needed
            });

            context.SaveChanges(); // Save changes to the database
        }
    }
}

