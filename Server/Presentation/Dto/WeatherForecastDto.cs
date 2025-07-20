using PicnicPlanner.Api.Domain.Entities;

namespace PicnicPlanner.Api.Presentation.Dto;

/// <summary>
/// DTO for daily weather forecast
/// </summary>
public record WeatherForecastDto
{
    /// <summary>
    /// The forecast date in ISO format (yyyy-MM-dd)
    /// </summary>
    public string Date { get; init; } = string.Empty;

    /// <summary>
    /// Maximum temperature in Celsius
    /// </summary>
    public decimal MaxTemperature { get; init; }

    /// <summary>
    /// Minimum temperature in Celsius
    /// </summary>
    public decimal MinTemperature { get; init; }

    /// <summary>
    /// Probability of precipitation (0-100)
    /// </summary>
    public decimal PrecipitationChance { get; init; }

    /// <summary>
    /// Total precipitation amount in millimeters
    /// </summary>
    public decimal PrecipitationAmount { get; init; }

    /// <summary>
    /// Relative humidity percentage (0-100)
    /// </summary>
    public decimal Humidity { get; init; }

    /// <summary>
    /// Wind speed in km/h
    /// </summary>
    public decimal WindSpeed { get; init; }

    /// <summary>
    /// Wind direction in degrees (0-360)
    /// </summary>
    public decimal WindDirection { get; init; }

    /// <summary>
    /// Weather condition assessment for picnic planning
    /// </summary>
    public WeatherConditionDto Condition { get; init; } = new();

    /// <summary>
    /// Creates a WeatherForecastDto from a domain WeatherForecast entity
    /// </summary>
    public static WeatherForecastDto FromDomain(WeatherForecast forecast) => new()
    {
        Date = forecast.Date.ToString("yyyy-MM-dd"),
        MaxTemperature = forecast.MaxTemperature,
        MinTemperature = forecast.MinTemperature,
        PrecipitationChance = forecast.PrecipitationChance,
        PrecipitationAmount = forecast.PrecipitationAmount,
        Humidity = forecast.Humidity,
        WindSpeed = forecast.WindSpeed,
        WindDirection = forecast.WindDirection,
        Condition = WeatherConditionDto.FromDomain(forecast.Condition)
    };
}