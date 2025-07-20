using PicnicPlanner.Api.Domain.ValueObjects;

namespace PicnicPlanner.Api.Presentation.Dto;

/// <summary>
/// DTO for location information
/// </summary>
public record LocationDto
{
    /// <summary>
    /// Latitude coordinate in decimal degrees
    /// </summary>
    public decimal Latitude { get; init; }

    /// <summary>
    /// Longitude coordinate in decimal degrees
    /// </summary>
    public decimal Longitude { get; init; }

    /// <summary>
    /// Optional location name
    /// </summary>
    public string? Name { get; init; }

    /// <summary>
    /// Creates a LocationDto from a domain Location object
    /// </summary>
    public static LocationDto FromDomain(Location location) => new()
    {
        Latitude = location.Latitude,
        Longitude = location.Longitude,
        Name = location.Name
    };
}