using PicnicPlanner.Api.Domain.Interfaces;
using PicnicPlanner.Api.Infrastructure.ExternalServices;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Register MediatR
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));

// Configure API documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new()
    {
        Title = "Picnic Planner Weather API",
        Version = "v1",
        Description = "Weather API for picnic planning using Open-Meteo data"
    });

    // Enable XML documentation
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
});

// Configure HTTP client for weather service
builder.Services.AddHttpClient<IWeatherService, OpenMeteoWeatherService>(client =>
{
    client.BaseAddress = new Uri("https://api.open-meteo.com/");
    client.Timeout = TimeSpan.FromSeconds(30);
    client.DefaultRequestHeaders.Add("User-Agent", "PicnicPlanner/1.0");
});

// Configure HTTP client for geocoding service
builder.Services.AddHttpClient<IGeocodeService, OpenMeteoGeocodeService>(client =>
{
    client.BaseAddress = new Uri("https://geocoding-api.open-meteo.com/");
    client.Timeout = TimeSpan.FromSeconds(30);
    client.DefaultRequestHeaders.Add("User-Agent", "PicnicPlanner/1.0");
});

// Application handlers are automatically registered by MediatR

// Configure CORS for frontend integration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin() // Allow all origins for development
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
// Enable Swagger in all environments for API documentation
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Picnic Planner Weather API v1");
    c.RoutePrefix = string.Empty; // Serve Swagger UI at root
    c.DocumentTitle = "Picnic Planner Weather API";
});

app.UseHttpsRedirection();

// Enable CORS
app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

// Add health check endpoint
app.MapGet("/health", () => Results.Ok(new
{
    Status = "Healthy",
    Timestamp = DateTime.UtcNow,
    Service = "Picnic Planner Weather API"
}));

app.Run();