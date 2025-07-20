using MediatR;
using PicnicPlanner.Api.Domain.Common;
using PicnicPlanner.Api.Domain.Entities;
using PicnicPlanner.Api.Domain.ValueObjects;
using PicnicPlanner.Api.Presentation.Responses;

namespace PicnicPlanner.Api.Application.Queries;

/// <summary>
/// Query to retrieve historical weather data for a specific date
/// </summary>
public record GetHistoricalWeatherQuery : IRequest<Result<GetHistoricalWeatherResponse>>
{
    /// <summary>
    /// The geographical location for the historical data
    /// </summary>
    public Location Location { get; init; }

    /// <summary>
    /// The date for which to retrieve historical data
    /// </summary>
    public DateOnly Date { get; init; }

    /// <summary>
    /// Number of years of historical data to retrieve
    /// </summary>
    public int YearsBack { get; init; }

    /// <summary>
    /// Initializes a new historical weather query
    /// </summary>
    /// <param name="latitude">Latitude in decimal degrees</param>
    /// <param name="longitude">Longitude in decimal degrees</param>
    /// <param name="date">The date for historical data</param>
    /// <param name="yearsBack">Number of years to go back (default: 10)</param>
    /// <param name="locationName">Optional location name</param>
    public GetHistoricalWeatherQuery(
        decimal latitude,
        decimal longitude,
        DateOnly date,
        int yearsBack = 10,
        string? locationName = null)
    {
        Location = new Location(latitude, longitude, locationName);
        Date = date;
        YearsBack = Math.Max(1, Math.Min(yearsBack, 50)); // Limit between 1 and 50 years
    }

    /// <summary>
    /// Initializes a new historical weather query with a location object
    /// </summary>
    /// <param name="location">The location object</param>
    /// <param name="date">The date for historical data</param>
    /// <param name="yearsBack">Number of years to go back (default: 10)</param>
    public GetHistoricalWeatherQuery(Location location, DateOnly date, int yearsBack = 10)
    {
        Location = location ?? throw new ArgumentNullException(nameof(location));
        Date = date;
        YearsBack = Math.Max(1, Math.Min(yearsBack, 50));
    }
}