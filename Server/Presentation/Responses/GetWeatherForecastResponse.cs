using PicnicPlanner.Api.Domain.Entities;
using PicnicPlanner.Api.Domain.ValueObjects;

namespace PicnicPlanner.Api.Presentation.Responses;

/// <summary>
/// Response containing weather forecast data
/// </summary>
public record GetWeatherForecastResponse
{
    /// <summary>
    /// The location for which the forecast was retrieved
    /// </summary>
    public Location Location { get; init; }

    /// <summary>
    /// Collection of daily weather forecasts for the next 14 days
    /// </summary>
    public IEnumerable<WeatherForecast> Forecasts { get; init; }

    /// <summary>
    /// The date and time when this forecast was retrieved
    /// </summary>
    public DateTime RetrievedAt { get; init; }

    /// <summary>
    /// Initializes a new weather forecast response
    /// </summary>
    /// <param name="location">The location</param>
    /// <param name="forecasts">The weather forecasts</param>
    public GetWeatherForecastResponse(Location location, IEnumerable<WeatherForecast> forecasts)
    {
        Location = location ?? throw new ArgumentNullException(nameof(location));
        Forecasts = forecasts ?? throw new ArgumentNullException(nameof(forecasts));
        RetrievedAt = DateTime.UtcNow;
    }
}