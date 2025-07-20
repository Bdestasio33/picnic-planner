using MediatR;
using PicnicPlanner.Api.Domain.Common;
using PicnicPlanner.Api.Domain.Entities;
using PicnicPlanner.Api.Domain.ValueObjects;
using PicnicPlanner.Api.Presentation.Responses;

namespace PicnicPlanner.Api.Application.Queries;

/// <summary>
/// Query to retrieve weather forecast for the next 14 days
/// </summary>
public record GetWeatherForecastQuery : IRequest<Result<GetWeatherForecastResponse>>
{
    /// <summary>
    /// The geographical location for the forecast
    /// </summary>
    public Location Location { get; init; }

    /// <summary>
    /// Initializes a new weather forecast query
    /// </summary>
    /// <param name="latitude">Latitude in decimal degrees</param>
    /// <param name="longitude">Longitude in decimal degrees</param>
    /// <param name="locationName">Optional location name</param>
    public GetWeatherForecastQuery(decimal latitude, decimal longitude, string? locationName = null)
    {
        Location = new Location(latitude, longitude, locationName);
    }

    /// <summary>
    /// Initializes a new weather forecast query with a location object
    /// </summary>
    /// <param name="location">The location object</param>
    public GetWeatherForecastQuery(Location location)
    {
        Location = location ?? throw new ArgumentNullException(nameof(location));
    }
}

