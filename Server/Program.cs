using Microsoft.Extensions.Caching.Memory;
using PicnicPlanner.Api.Domain.Interfaces;
using PicnicPlanner.Api.Domain.Services.WeatherScoring;
using PicnicPlanner.Api.Infrastructure.ExternalServices;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new()
    {
        Title = "Picnic Planner Weather API",
        Version = "v1",
        Description = "Weather API for picnic planning using Open-Meteo data"
    });

    // Include XML docs for API documentation
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
});

builder.Services.AddMemoryCache();
builder.Services.AddHttpClient<OpenMeteoWeatherService>(client =>
{
    client.BaseAddress = new Uri("https://api.open-meteo.com/");
    client.Timeout = TimeSpan.FromSeconds(30);
    client.DefaultRequestHeaders.Add("User-Agent", "PicnicPlanner/1.0");
});

// Use decorator pattern: cached service wraps OpenMeteo service
builder.Services.AddScoped<IWeatherService, CachedWeatherService>(serviceProvider =>
{
    var httpClientFactory = serviceProvider.GetRequiredService<IHttpClientFactory>();
    var httpClient = httpClientFactory.CreateClient(nameof(OpenMeteoWeatherService));
    var scoringService = serviceProvider.GetRequiredService<IWeatherScoringService>();
    var openMeteoService = new OpenMeteoWeatherService(httpClient, scoringService);

    var memoryCache = serviceProvider.GetRequiredService<IMemoryCache>();
    var logger = serviceProvider.GetRequiredService<ILogger<CachedWeatherService>>();

    return new CachedWeatherService(openMeteoService, memoryCache, logger);
});

builder.Services.AddHttpClient<IGeocodeService, OpenMeteoGeocodeService>(client =>
{
    client.BaseAddress = new Uri("https://geocoding-api.open-meteo.com/");
    client.Timeout = TimeSpan.FromSeconds(30);
    client.DefaultRequestHeaders.Add("User-Agent", "PicnicPlanner/1.0");
});

// Configure weather scoring services
builder.Services.AddSingleton<IWeatherScoringService>(serviceProvider =>
{
    // Read scoring strategy from configuration, default to "Default"
    var configuration = serviceProvider.GetRequiredService<IConfiguration>();
    var strategyName = configuration.GetValue<string>("WeatherScoring:Strategy") ?? "Default";

    if (!Enum.TryParse<WeatherScoringStrategy>(strategyName, true, out var strategy))
    {
        strategy = WeatherScoringStrategy.Default;
    }

    return strategy switch
    {
        WeatherScoringStrategy.Conservative => ScoringStrategyFactory.CreateConservativeStrategy(),
        WeatherScoringStrategy.Relaxed => ScoringStrategyFactory.CreateRelaxedStrategy(),
        WeatherScoringStrategy.TemperatureFocused => ScoringStrategyFactory.CreateTemperatureFocusedStrategy(),
        _ => ScoringStrategyFactory.CreateDefaultStrategy()
    };
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin() // Development only - restrict in production
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Picnic Planner Weather API v1");
    c.RoutePrefix = string.Empty; // Serve at root
    c.DocumentTitle = "Picnic Planner Weather API";
});

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

app.MapGet("/health", () => Results.Ok(new
{
    Status = "Healthy",
    Timestamp = DateTime.UtcNow,
    Service = "Picnic Planner Weather API"
}));

// Add a demo endpoint to showcase the modular scoring system
app.MapGet("/demo/scoring", () =>
{
    var defaultStrategy = ScoringStrategyFactory.CreateDefaultStrategy();
    var conservativeStrategy = ScoringStrategyFactory.CreateConservativeStrategy();
    var relaxedStrategy = ScoringStrategyFactory.CreateRelaxedStrategy();

    var sampleParams = new WeatherScoringParameters
    {
        MaxTemperature = 24m,
        MinTemperature = 18m,
        PrecipitationChance = 15m,
        PrecipitationAmount = 2m,
        WindSpeed = 12m,
        Humidity = 55m
    };

    var defaultResult = defaultStrategy.CalculateOverallScore(sampleParams);
    var conservativeResult = conservativeStrategy.CalculateOverallScore(sampleParams);
    var relaxedResult = relaxedStrategy.CalculateOverallScore(sampleParams);

    return Results.Ok(new
    {
        WeatherData = new
        {
            Temperature = $"{sampleParams.MinTemperature}°C - {sampleParams.MaxTemperature}°C",
            PrecipitationChance = $"{sampleParams.PrecipitationChance}%",
            PrecipitationAmount = $"{sampleParams.PrecipitationAmount}mm",
            WindSpeed = $"{sampleParams.WindSpeed} km/h",
            Humidity = $"{sampleParams.Humidity}%"
        },
        ScoringResults = new
        {
            Default = new { Score = defaultResult.Score, Assessment = defaultResult.Explanation, Reasons = defaultResult.Reasons },
            Conservative = new { Score = conservativeResult.Score, Assessment = conservativeResult.Explanation, Reasons = conservativeResult.Reasons },
            Relaxed = new { Score = relaxedResult.Score, Assessment = relaxedResult.Explanation, Reasons = relaxedResult.Reasons }
        }
    });
});

app.Run();