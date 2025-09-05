namespace PicnicPlanner.Api.Domain.Interfaces;

/// <summary>
/// Represents a criterion for weather scoring with its weight and scoring logic
/// </summary>
public interface IWeatherScoringCriterion
{
    /// <summary>
    /// The name of this scoring criterion
    /// </summary>
    string Name { get; }

    /// <summary>
    /// The weight of this criterion in the overall score (0-100)
    /// </summary>
    int Weight { get; }

    /// <summary>
    /// Calculate the score for this criterion based on weather parameters
    /// </summary>
    /// <param name="parameters">Weather parameters</param>
    /// <returns>Score result with value and explanation</returns>
    WeatherScoringResult CalculateScore(WeatherScoringParameters parameters);
}

/// <summary>
/// Service for calculating weather suitability scores using configurable criteria
/// </summary>
public interface IWeatherScoringService
{
    /// <summary>
    /// Calculate the overall weather suitability score
    /// </summary>
    /// <param name="parameters">Weather parameters</param>
    /// <returns>Complete scoring result with breakdown</returns>
    WeatherScoringResult CalculateOverallScore(WeatherScoringParameters parameters);

    /// <summary>
    /// Get all configured scoring criteria
    /// </summary>
    IEnumerable<IWeatherScoringCriterion> GetCriteria();
}

/// <summary>
/// Parameters for weather scoring calculations
/// </summary>
public record WeatherScoringParameters
{
    public decimal MaxTemperature { get; init; }
    public decimal MinTemperature { get; init; }
    public decimal PrecipitationChance { get; init; }
    public decimal PrecipitationAmount { get; init; }
    public decimal? WindSpeed { get; init; }
    public decimal? Humidity { get; init; }

    public decimal AverageTemperature => (MaxTemperature + MinTemperature) / 2;
}

/// <summary>
/// Result of a weather scoring calculation
/// </summary>
public record WeatherScoringResult
{
    public int Score { get; init; }
    public string Explanation { get; init; }
    public List<string> Reasons { get; init; } = new();
    public Dictionary<string, int> CriteriaScores { get; init; } = new();

    public WeatherScoringResult(int score, string explanation)
    {
        Score = Math.Clamp(score, 0, 100);
        Explanation = explanation ?? throw new ArgumentNullException(nameof(explanation));
    }
}
