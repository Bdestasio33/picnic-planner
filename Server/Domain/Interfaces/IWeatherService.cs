using PicnicPlanner.Api.Domain.Entities;
using PicnicPlanner.Api.Domain.ValueObjects;

namespace PicnicPlanner.Api.Domain.Interfaces;

/// <summary>
/// Domain service interface for weather data operations
/// </summary>
public interface IWeatherService
{
    /// <summary>
    /// Retrieves weather forecast for the next 14 days
    /// </summary>
    /// <param name="location">The geographical location</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Collection of daily weather forecasts</returns>
    Task<IEnumerable<WeatherForecast>> GetForecastAsync(Location location, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves historical weather data for a specific date across multiple years
    /// </summary>
    /// <param name="location">The geographical location</param>
    /// <param name="date">The date for which to retrieve historical data</param>
    /// <param name="yearsBack">Number of years of historical data to retrieve (default: 10)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Historical weather data for the specified date</returns>
    Task<HistoricalWeatherData> GetHistoricalDataAsync(
        Location location,
        DateOnly date,
        int yearsBack = 10,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves both forecast and historical data for a specific date
    /// </summary>
    /// <param name="location">The geographical location</param>
    /// <param name="date">The date for which to retrieve combined data</param>
    /// <param name="yearsBack">Number of years of historical data to retrieve (default: 10)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Tuple containing forecast and historical data</returns>
    Task<(WeatherForecast? Forecast, HistoricalWeatherData Historical)> GetCombinedWeatherDataAsync(
        Location location,
        DateOnly date,
        int yearsBack = 10,
        CancellationToken cancellationToken = default);
}