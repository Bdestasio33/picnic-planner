using PicnicPlanner.Api.Domain.ValueObjects;

namespace PicnicPlanner.Api.Domain.Entities;

/// <summary>
/// Represents a daily weather forecast with all relevant meteorological data
/// </summary>
public class WeatherForecast
{
    /// <summary>
    /// The date for this forecast
    /// </summary>
    public DateOnly Date { get; private set; }

    /// <summary>
    /// Maximum temperature for the day in Celsius
    /// </summary>
    public decimal MaxTemperature { get; private set; }

    /// <summary>
    /// Minimum temperature for the day in Celsius
    /// </summary>
    public decimal MinTemperature { get; private set; }

    /// <summary>
    /// Probability of precipitation as a percentage (0-100)
    /// </summary>
    public decimal PrecipitationChance { get; private set; }

    /// <summary>
    /// Total precipitation amount in millimeters
    /// </summary>
    public decimal PrecipitationAmount { get; private set; }

    /// <summary>
    /// Relative humidity percentage (0-100)
    /// </summary>
    public decimal Humidity { get; private set; }

    /// <summary>
    /// Maximum wind speed in km/h
    /// </summary>
    public decimal WindSpeed { get; private set; }

    /// <summary>
    /// Dominant wind direction in degrees (0-360)
    /// </summary>
    public decimal WindDirection { get; private set; }

    /// <summary>
    /// Weather condition assessment for picnic planning
    /// </summary>
    public WeatherCondition Condition { get; private set; }

    /// <summary>
    /// Initializes a new weather forecast
    /// </summary>
    /// <param name="date">The forecast date</param>
    /// <param name="maxTemperature">Maximum temperature in Celsius</param>
    /// <param name="minTemperature">Minimum temperature in Celsius</param>
    /// <param name="precipitationChance">Precipitation probability (0-100)</param>
    /// <param name="precipitationAmount">Precipitation amount in mm</param>
    /// <param name="humidity">Relative humidity (0-100)</param>
    /// <param name="windSpeed">Wind speed in km/h</param>
    /// <param name="windDirection">Wind direction in degrees (0-360)</param>
    public WeatherForecast(
        DateOnly date,
        decimal maxTemperature,
        decimal minTemperature,
        decimal precipitationChance,
        decimal precipitationAmount,
        decimal humidity,
        decimal windSpeed,
        decimal windDirection)
    {
        Date = date;
        MaxTemperature = maxTemperature;
        MinTemperature = minTemperature;
        PrecipitationChance = Math.Clamp(precipitationChance, 0, 100);
        PrecipitationAmount = Math.Max(precipitationAmount, 0);
        Humidity = Math.Clamp(humidity, 0, 100);
        WindSpeed = Math.Max(windSpeed, 0);
        WindDirection = Math.Clamp(windDirection, 0, 360);

        // Automatically assess the weather condition with all available parameters
        Condition = WeatherCondition.Assess(maxTemperature, minTemperature, precipitationChance, precipitationAmount, windSpeed, humidity);
    }

    /// <summary>
    /// Updates the weather condition assessment (useful if assessment logic changes)
    /// </summary>
    public void UpdateCondition()
    {
        Condition = WeatherCondition.Assess(MaxTemperature, MinTemperature, PrecipitationChance, PrecipitationAmount, WindSpeed, Humidity);
    }

    /// <summary>
    /// Returns a string representation of the weather forecast
    /// </summary>
    public override string ToString()
    {
        return $"{Date:yyyy-MM-dd}: {MinTemperature}°C - {MaxTemperature}°C, " +
               $"{PrecipitationChance}% rain ({PrecipitationAmount}mm), " +
               $"Condition: {Condition.Type}";
    }
}