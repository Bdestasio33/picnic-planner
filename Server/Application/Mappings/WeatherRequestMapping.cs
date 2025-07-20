using MediatR;
using PicnicPlanner.Api.Application.Queries;
using PicnicPlanner.Api.Domain.Common;
using PicnicPlanner.Api.Domain.ValueObjects;

namespace PicnicPlanner.Api.Application.Mappings;

/// <summary>
/// Mapping class for transforming weather request models to domain queries
/// </summary>
public static class WeatherRequestMapping
{
    /// <summary>
    /// Maps city/state/country to location using geocoding
    /// </summary>
    public static async Task<Result<Location>> ResolveLocationAsync(
        string city,
        string? state,
        string? country,
        IMediator mediator,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(city))
        {
            return Result.Failure<Location>(
                Error.Validation("Location.InvalidRequest", "City name is required"));
        }

        var geocodeQuery = new GeocodeLocationQuery(city, state, country);
        return await mediator.Send(geocodeQuery, cancellationToken);
    }

    /// <summary>
    /// Maps request to GetWeatherForecastQuery
    /// </summary>
    public static GetWeatherForecastQuery ToForecastQuery(Location location)
    {
        return new GetWeatherForecastQuery(location.Latitude, location.Longitude, location.Name);
    }

    /// <summary>
    /// Maps request to GetHistoricalWeatherQuery
    /// </summary>
    public static GetHistoricalWeatherQuery ToHistoricalQuery(Location location, DateOnly date, int yearsBack)
    {
        return new GetHistoricalWeatherQuery(location.Latitude, location.Longitude, date, yearsBack, location.Name);
    }
}