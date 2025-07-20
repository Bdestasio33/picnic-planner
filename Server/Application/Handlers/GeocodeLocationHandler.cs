using MediatR;
using PicnicPlanner.Api.Application.Queries;
using PicnicPlanner.Api.Domain.Common;
using PicnicPlanner.Api.Domain.Interfaces;
using PicnicPlanner.Api.Domain.ValueObjects;

namespace PicnicPlanner.Api.Application.Handlers;

/// <summary>
/// Handler for geocoding location queries
/// </summary>
public class GeocodeLocationHandler :
    IRequestHandler<GeocodeLocationQuery, Result<Location>>,
    IRequestHandler<GeocodeAddressQuery, Result<Location>>
{
    private readonly IGeocodeService _geocodeService;

    /// <summary>
    /// Initializes a new geocoding handler
    /// </summary>
    /// <param name="geocodeService">Geocoding service</param>
    public GeocodeLocationHandler(IGeocodeService geocodeService)
    {
        _geocodeService = geocodeService ?? throw new ArgumentNullException(nameof(geocodeService));
    }

    /// <summary>
    /// Handles geocoding by city and optional state/country
    /// </summary>
    /// <param name="query">The geocoding query</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Location with coordinates and resolved address wrapped in Result</returns>
    public async Task<Result<Location>> Handle(GeocodeLocationQuery query, CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(query.City))
            {
                return Result.Failure<Location>(
                    Error.Validation("Geocoding.InvalidCity", "City name cannot be empty"));
            }

            var location = await _geocodeService.GeocodeAsync(query.City, query.State, query.Country, cancellationToken);
            return Result.Success(location);
        }
        catch (ArgumentException ex)
        {
            return Result.Failure<Location>(
                Error.Validation("Geocoding.InvalidParameters", ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return Result.Failure<Location>(
                Error.NotFound("Geocoding.LocationNotFound", ex.Message));
        }
        catch (Exception ex)
        {
            return Result.Failure<Location>(
                Error.Unexpected("Geocoding.UnexpectedError", $"An unexpected error occurred: {ex.Message}"));
        }
    }

    /// <summary>
    /// Handles geocoding by free-form address string
    /// </summary>
    /// <param name="query">The address query</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Location with coordinates and resolved address wrapped in Result</returns>
    public async Task<Result<Location>> Handle(GeocodeAddressQuery query, CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(query.Address))
            {
                return Result.Failure<Location>(
                    Error.Validation("Geocoding.InvalidAddress", "Address cannot be empty"));
            }

            var location = await _geocodeService.GeocodeAsync(query.Address, cancellationToken);
            return Result.Success(location);
        }
        catch (ArgumentException ex)
        {
            return Result.Failure<Location>(
                Error.Validation("Geocoding.InvalidParameters", ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return Result.Failure<Location>(
                Error.NotFound("Geocoding.LocationNotFound", ex.Message));
        }
        catch (Exception ex)
        {
            return Result.Failure<Location>(
                Error.Unexpected("Geocoding.UnexpectedError", $"An unexpected error occurred: {ex.Message}"));
        }
    }
}