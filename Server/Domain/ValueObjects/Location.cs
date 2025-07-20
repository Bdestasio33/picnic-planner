namespace PicnicPlanner.Api.Domain.ValueObjects;

/// <summary>
/// Represents a geographical location with latitude and longitude coordinates
/// </summary>
public record Location
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
    /// Optional location name for display purposes
    /// </summary>
    public string? Name { get; init; }

    /// <summary>
    /// Initializes a new Location with coordinates
    /// </summary>
    /// <param name="latitude">Latitude in decimal degrees (-90 to 90)</param>
    /// <param name="longitude">Longitude in decimal degrees (-180 to 180)</param>
    /// <param name="name">Optional location name</param>
    /// <exception cref="ArgumentOutOfRangeException">Thrown when coordinates are invalid</exception>
    public Location(decimal latitude, decimal longitude, string? name = null)
    {
        if (latitude < -90 || latitude > 90)
            throw new ArgumentOutOfRangeException(nameof(latitude), "Latitude must be between -90 and 90 degrees");

        if (longitude < -180 || longitude > 180)
            throw new ArgumentOutOfRangeException(nameof(longitude), "Longitude must be between -180 and 180 degrees");

        Latitude = latitude;
        Longitude = longitude;
        Name = name;
    }

    /// <summary>
    /// Returns a string representation of the location
    /// </summary>
    public override string ToString()
    {
        return string.IsNullOrEmpty(Name)
            ? $"{Latitude}, {Longitude}"
            : $"{Name} ({Latitude}, {Longitude})";
    }
}