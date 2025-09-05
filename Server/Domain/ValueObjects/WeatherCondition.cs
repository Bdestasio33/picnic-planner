using PicnicPlanner.Api.Domain.Interfaces;
using PicnicPlanner.Api.Domain.Services.WeatherScoring;

namespace PicnicPlanner.Api.Domain.ValueObjects;

/// <summary>
/// Represents weather conditions suitable for picnic planning
/// </summary>
public enum WeatherConditionType
{
    /// <summary>
    /// Ideal conditions for a picnic - comfortable temperatures, low precipitation chance
    /// </summary>
    Ideal,

    /// <summary>
    /// Fair conditions - moderate temperatures, some chance of precipitation
    /// </summary>
    Fair,

    /// <summary>
    /// Poor conditions - extreme temperatures, high precipitation chance
    /// </summary>
    Poor
}

/// <summary>
/// Value object representing weather condition assessment for picnic planning
/// </summary>
public record WeatherCondition
{
    public WeatherConditionType Type { get; init; }
    public string Description { get; init; }
    public int Score { get; init; }
    public List<string> Reasons { get; init; }

    public WeatherCondition(WeatherConditionType type, string description, int score, List<string> reasons)
    {
        Type = type;
        Description = description ?? throw new ArgumentNullException(nameof(description));
        Score = Math.Clamp(score, 0, 100);
        Reasons = reasons ?? new List<string>();
    }

    /// <summary>
    /// Determines weather condition using the specified scoring service
    /// </summary>
    /// <param name="scoringService">The scoring service to use for assessment</param>
    /// <param name="maxTemp">Maximum temperature in Celsius</param>
    /// <param name="minTemp">Minimum temperature in Celsius</param>
    /// <param name="precipitationChance">Precipitation probability (0-100)</param>
    /// <param name="precipitationAmount">Precipitation amount in mm</param>
    /// <param name="windSpeed">Wind speed in km/h (optional)</param>
    /// <param name="humidity">Humidity percentage (optional)</param>
    /// <returns>Weather condition assessment with detailed scoring</returns>
    public static WeatherCondition Assess(
        IWeatherScoringService scoringService,
        decimal maxTemp,
        decimal minTemp,
        decimal precipitationChance,
        decimal precipitationAmount,
        decimal? windSpeed = null,
        decimal? humidity = null)
    {
        ArgumentNullException.ThrowIfNull(scoringService);

        var parameters = new WeatherScoringParameters
        {
            MaxTemperature = maxTemp,
            MinTemperature = minTemp,
            PrecipitationChance = precipitationChance,
            PrecipitationAmount = precipitationAmount,
            WindSpeed = windSpeed,
            Humidity = humidity
        };

        var result = scoringService.CalculateOverallScore(parameters);
        var type = ParseConditionType(result.Explanation);

        return new WeatherCondition(type, result.Explanation, result.Score, result.Reasons);
    }

    /// <summary>
    /// Determines weather condition using the default scoring strategy (for backward compatibility)
    /// </summary>
    /// <param name="maxTemp">Maximum temperature in Celsius</param>
    /// <param name="minTemp">Minimum temperature in Celsius</param>
    /// <param name="precipitationChance">Precipitation probability (0-100)</param>
    /// <param name="precipitationAmount">Precipitation amount in mm</param>
    /// <param name="windSpeed">Wind speed in km/h (optional)</param>
    /// <param name="humidity">Humidity percentage (optional)</param>
    /// <returns>Weather condition assessment with detailed scoring</returns>
    [Obsolete("Use Assess(IWeatherScoringService, ...) for better modularity. This method uses the default scoring strategy.")]
    public static WeatherCondition Assess(
        decimal maxTemp,
        decimal minTemp,
        decimal precipitationChance,
        decimal precipitationAmount,
        decimal? windSpeed = null,
        decimal? humidity = null)
    {
        var defaultScoringService = ScoringStrategyFactory.CreateDefaultStrategy();
        return Assess(defaultScoringService, maxTemp, minTemp, precipitationChance, precipitationAmount, windSpeed, humidity);
    }

    /// <summary>
    /// Parse condition type from scoring service description
    /// </summary>
    private static WeatherConditionType ParseConditionType(string description)
    {
        return description.ToLowerInvariant() switch
        {
            var d when d.Contains("excellent") || d.Contains("perfect") => WeatherConditionType.Ideal,
            var d when d.Contains("good") || d.Contains("acceptable") || d.Contains("fair") => WeatherConditionType.Fair,
            _ => WeatherConditionType.Poor
        };
    }

}