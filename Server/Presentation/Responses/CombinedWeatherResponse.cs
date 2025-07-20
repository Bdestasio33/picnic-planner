using PicnicPlanner.Api.Domain.Entities;
using PicnicPlanner.Api.Domain.ValueObjects;

namespace PicnicPlanner.Api.Presentation.Responses;

/// <summary>
/// Response combining forecast and historical weather data
/// </summary>
public record CombinedWeatherResponse(
    Location Location,
    DateOnly RequestedDate,
    WeatherForecast? Forecast,
    HistoricalWeatherData HistoricalData,
    DateTime RetrievedAt
);