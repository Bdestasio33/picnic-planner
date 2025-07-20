namespace PicnicPlanner.Api.Presentation.Dto;

/// <summary>
/// DTO for weather forecast response
/// </summary>
public record WeatherForecastResponseDto
{
    /// <summary>
    /// The location for which the forecast was retrieved
    /// </summary>
    public LocationDto Location { get; init; } = new();

    /// <summary>
    /// Collection of daily weather forecasts
    /// </summary>
    public IEnumerable<WeatherForecastDto> Forecasts { get; init; } = Enumerable.Empty<WeatherForecastDto>();

    /// <summary>
    /// UTC timestamp when this forecast was retrieved
    /// </summary>
    public DateTime RetrievedAt { get; init; }
}