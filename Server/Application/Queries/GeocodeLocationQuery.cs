using MediatR;
using PicnicPlanner.Api.Domain.Common;
using PicnicPlanner.Api.Domain.ValueObjects;

namespace PicnicPlanner.Api.Application.Queries;

/// <summary>
/// Query to geocode a location by city and optional state/country
/// </summary>
public record GeocodeLocationQuery(
    string City,
    string? State = null,
    string? Country = null
) : IRequest<Result<Location>>;

/// <summary>
/// Query to geocode a location by free-form address string
/// </summary>
public record GeocodeAddressQuery(
    string Address
) : IRequest<Result<Location>>;