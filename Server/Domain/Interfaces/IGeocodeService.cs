using PicnicPlanner.Api.Domain.ValueObjects;

namespace PicnicPlanner.Api.Domain.Interfaces;

/// <summary>
/// Service for converting addresses to geographic coordinates
/// </summary>
public interface IGeocodeService
{
    /// <summary>
    /// Geocodes a location by city and optional state/country
    /// </summary>
    /// <param name="city">The city name</param>
    /// <param name="state">Optional state or province</param>
    /// <param name="country">Optional country name</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Location with coordinates and resolved address information</returns>
    Task<Location> GeocodeAsync(string city, string? state = null, string? country = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Geocodes a location by free-form address string
    /// </summary>
    /// <param name="address">Free-form address string (e.g., "San Francisco, CA")</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Location with coordinates and resolved address information</returns>
    Task<Location> GeocodeAsync(string address, CancellationToken cancellationToken = default);
}