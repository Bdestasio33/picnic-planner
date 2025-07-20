using PicnicPlanner.Api.Domain.Entities;

namespace PicnicPlanner.Api.Presentation.Dto;

/// <summary>
/// DTO for yearly weather data
/// </summary>
public record YearlyWeatherDataDto
{
    /// <summary>
    /// The year of this weather data
    /// </summary>
    public int Year { get; init; }

    /// <summary>
    /// Average temperature for this date in this year (Celsius)
    /// </summary>
    public decimal Temperature { get; init; }

    /// <summary>
    /// Total precipitation for this date in this year (millimeters)
    /// </summary>
    public decimal Precipitation { get; init; }

    /// <summary>
    /// Average humidity for this date in this year (0-100)
    /// </summary>
    public decimal Humidity { get; init; }

    /// <summary>
    /// Creates a YearlyWeatherDataDto from a domain YearlyWeatherData record
    /// </summary>
    public static YearlyWeatherDataDto FromDomain(YearlyWeatherData data) => new()
    {
        Year = data.Year,
        Temperature = data.Temperature,
        Precipitation = data.Precipitation,
        Humidity = data.Humidity
    };
}