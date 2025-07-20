using PicnicPlanner.Api.Domain.Entities;
using PicnicPlanner.Api.Domain.ValueObjects;

namespace PicnicPlanner.Api.Presentation.Responses;

/// <summary>
/// Response containing historical weather data
/// </summary>
public record GetHistoricalWeatherResponse
{
    /// <summary>
    /// The location for which historical data was retrieved
    /// </summary>
    public Location Location { get; init; }

    /// <summary>
    /// The date for which historical data was requested
    /// </summary>
    public DateOnly RequestedDate { get; init; }

    /// <summary>
    /// Historical weather data for the requested date
    /// </summary>
    public HistoricalWeatherData HistoricalData { get; init; }

    /// <summary>
    /// The date and time when this data was retrieved
    /// </summary>
    public DateTime RetrievedAt { get; init; }

    /// <summary>
    /// Initializes a new historical weather response
    /// </summary>
    /// <param name="location">The location</param>
    /// <param name="requestedDate">The requested date</param>
    /// <param name="historicalData">The historical weather data</param>
    public GetHistoricalWeatherResponse(Location location, DateOnly requestedDate, HistoricalWeatherData historicalData)
    {
        Location = location ?? throw new ArgumentNullException(nameof(location));
        RequestedDate = requestedDate;
        HistoricalData = historicalData ?? throw new ArgumentNullException(nameof(historicalData));
        RetrievedAt = DateTime.UtcNow;
    }
}