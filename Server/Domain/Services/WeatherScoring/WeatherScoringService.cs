using PicnicPlanner.Api.Domain.Interfaces;

namespace PicnicPlanner.Api.Domain.Services.WeatherScoring;

/// <summary>
/// Default implementation of weather scoring service using configurable criteria
/// </summary>
public class WeatherScoringService : IWeatherScoringService
{
    private readonly IEnumerable<IWeatherScoringCriterion> _criteria;
    private readonly WeatherScoringServiceConfig _config;

    public WeatherScoringService(
        IEnumerable<IWeatherScoringCriterion> criteria,
        WeatherScoringServiceConfig config)
    {
        _criteria = criteria ?? throw new ArgumentNullException(nameof(criteria));
        _config = config ?? throw new ArgumentNullException(nameof(config));
    }

    public WeatherScoringResult CalculateOverallScore(WeatherScoringParameters parameters)
    {
        var allReasons = new List<string>();
        var criteriaScores = new Dictionary<string, int>();
        var totalScore = 0;
        var totalWeight = 0;

        foreach (var criterion in _criteria)
        {
            var result = criterion.CalculateScore(parameters);
            criteriaScores[criterion.Name] = result.Score;
            allReasons.AddRange(result.Reasons);

            // Weight the score by the criterion's importance
            totalScore += (result.Score * criterion.Weight) / 100;
            totalWeight += criterion.Weight;
        }

        // Normalize score to 0-100 range based on total weights
        var normalizedScore = totalWeight > 0 ? (totalScore * 100) / totalWeight : 0;
        var finalScore = Math.Clamp(normalizedScore, 0, 100);

        var (type, description) = DetermineConditionType(finalScore);

        return new WeatherScoringResult(finalScore, description)
        {
            Reasons = allReasons,
            CriteriaScores = criteriaScores
        };
    }

    public IEnumerable<IWeatherScoringCriterion> GetCriteria()
    {
        return _criteria;
    }

    private (string type, string description) DetermineConditionType(int totalScore)
    {
        if (totalScore >= _config.IdealThreshold)
            return ("Ideal", _config.IdealDescription);
        if (totalScore >= _config.FairThreshold)
            return ("Fair", _config.FairDescription);
        return ("Poor", _config.PoorDescription);
    }
}

/// <summary>
/// Configuration for weather scoring service thresholds and descriptions
/// </summary>
public record WeatherScoringServiceConfig
{
    public int IdealThreshold { get; init; } = 80;
    public int FairThreshold { get; init; } = 60;
    public string IdealDescription { get; init; } = "Excellent picnic conditions!";
    public string FairDescription { get; init; } = "Good picnic conditions with minor concerns";
    public string PoorDescription { get; init; } = "Poor picnic conditions";
}
