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
    /// <summary>
    /// The condition type (Ideal, Fair, Poor)
    /// </summary>
    public WeatherConditionType Type { get; init; }

    /// <summary>
    /// Description of why this condition was assigned
    /// </summary>
    public string Description { get; init; }

    /// <summary>
    /// Numerical score from 0-100 representing picnic suitability
    /// </summary>
    public int Score { get; init; }

    /// <summary>
    /// Detailed reasons for the score and condition
    /// </summary>
    public List<string> Reasons { get; init; }

    /// <summary>
    /// Initializes a new weather condition
    /// </summary>
    /// <param name="type">The weather condition type</param>
    /// <param name="description">Description of the condition assessment</param>
    /// <param name="score">Numerical score 0-100</param>
    /// <param name="reasons">Detailed reasons for the assessment</param>
    public WeatherCondition(WeatherConditionType type, string description, int score, List<string> reasons)
    {
        Type = type;
        Description = description ?? throw new ArgumentNullException(nameof(description));
        Score = Math.Clamp(score, 0, 100);
        Reasons = reasons ?? new List<string>();
    }

    /// <summary>
    /// Determines weather condition with detailed scoring based on multiple weather parameters
    /// </summary>
    /// <param name="maxTemp">Maximum temperature in Celsius</param>
    /// <param name="minTemp">Minimum temperature in Celsius</param>
    /// <param name="precipitationChance">Precipitation probability (0-100)</param>
    /// <param name="precipitationAmount">Precipitation amount in mm</param>
    /// <param name="windSpeed">Wind speed in km/h (optional)</param>
    /// <param name="humidity">Humidity percentage (optional)</param>
    /// <returns>Weather condition assessment with detailed scoring</returns>
    public static WeatherCondition Assess(
        decimal maxTemp,
        decimal minTemp,
        decimal precipitationChance,
        decimal precipitationAmount,
        decimal? windSpeed = null,
        decimal? humidity = null)
    {
        var reasons = new List<string>();
        var totalScore = 0;

        // Temperature scoring (0-30 points)
        totalScore += CalculateTemperatureScore(maxTemp, minTemp, reasons);

        // Precipitation scoring (0-30 points)
        totalScore += CalculatePrecipitationScore(precipitationChance, precipitationAmount, reasons);

        // Wind scoring (0-20 points)
        totalScore += CalculateWindScore(windSpeed, reasons);

        // Humidity scoring (0-20 points)
        totalScore += CalculateHumidityScore(humidity, reasons);

        // Determine condition type based on total score
        var (type, description) = DetermineConditionType(totalScore);

        return new WeatherCondition(type, description, totalScore, reasons);
    }

    private static int CalculateTemperatureScore(decimal maxTemp, decimal minTemp, List<string> reasons)
    {
        var avgTemp = (maxTemp + minTemp) / 2;

        // Ideal range: 20-25°C
        if (avgTemp >= 20 && avgTemp <= 25)
        {
            reasons.Add("Perfect temperature range");
            return 30;
        }
        // Acceptable range: 15-30°C
        else if (avgTemp >= 15 && avgTemp <= 30)
        {
            reasons.Add("Acceptable temperature");
            return 20;
        }
        else
        {
            if (avgTemp < 15)
                reasons.Add("Too cold for comfortable outdoor activities");
            else
                reasons.Add("Too hot for comfortable outdoor activities");
            return 5;
        }
    }

    private static int CalculatePrecipitationScore(decimal precipChance, decimal precipAmount, List<string> reasons)
    {
        if (precipChance <= 10)
        {
            reasons.Add($"Very low chance of rain ({precipChance}%)");
            return 30;
        }
        else if (precipChance <= 30)
        {
            reasons.Add($"Low chance of rain ({precipChance}%)");
            return 20;
        }
        else if (precipChance <= 50)
        {
            reasons.Add($"Moderate chance of rain ({precipChance}%)");
            return 10;
        }
        else
        {
            reasons.Add($"High chance of rain ({precipChance}%)");
            return 0;
        }
    }

    private static int CalculateWindScore(decimal? windSpeed, List<string> reasons)
    {
        if (!windSpeed.HasValue)
        {
            reasons.Add("Wind data unavailable");
            return 10; // Neutral score
        }

        var wind = windSpeed.Value;
        if (wind <= 15)
        {
            reasons.Add($"Light winds ({wind} km/h)");
            return 20;
        }
        else if (wind <= 25)
        {
            reasons.Add($"Moderate winds ({wind} km/h)");
            return 15;
        }
        else if (wind <= 35)
        {
            reasons.Add($"Strong winds ({wind} km/h)");
            return 5;
        }
        else
        {
            reasons.Add($"Very strong winds ({wind} km/h)");
            return 0;
        }
    }

    private static int CalculateHumidityScore(decimal? humidity, List<string> reasons)
    {
        if (!humidity.HasValue)
        {
            reasons.Add("Humidity data unavailable");
            return 10; // Neutral score
        }

        var humid = humidity.Value;
        // Ideal humidity: 40-60%
        if (humid >= 40 && humid <= 60)
        {
            reasons.Add($"Comfortable humidity ({humid}%)");
            return 20;
        }
        // Acceptable humidity: 30-70%
        else if (humid >= 30 && humid <= 70)
        {
            reasons.Add($"Acceptable humidity ({humid}%)");
            return 15;
        }
        else
        {
            if (humid < 30)
                reasons.Add($"Low humidity may cause discomfort ({humid}%)");
            else
                reasons.Add($"High humidity may cause discomfort ({humid}%)");
            return 5;
        }
    }

    private static (WeatherConditionType type, string description) DetermineConditionType(int totalScore)
    {
        return totalScore switch
        {
            >= 80 => (WeatherConditionType.Ideal, "Excellent picnic conditions!"),
            >= 60 => (WeatherConditionType.Fair, "Good picnic conditions with minor concerns"),
            _ => (WeatherConditionType.Poor, "Poor picnic conditions")
        };
    }
}