namespace PicnicPlanner.Api.Presentation.Dto;

/// <summary>
/// DTO for historical weather response
/// </summary>
public record HistoricalWeatherResponseDto
{
    /// <summary>
    /// The location for which historical data was retrieved
    /// </summary>
    public LocationDto Location { get; init; } = new();

    /// <summary>
    /// The requested date (yyyy-MM-dd format)
    /// </summary>
    public string RequestedDate { get; init; } = string.Empty;

    /// <summary>
    /// Historical weather data for the requested date
    /// </summary>
    public HistoricalWeatherDataDto HistoricalData { get; init; } = new();

    /// <summary>
    /// UTC timestamp when this data was retrieved
    /// </summary>
    public DateTime RetrievedAt { get; init; }
}