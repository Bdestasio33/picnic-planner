using PicnicPlanner.Api.Domain.Interfaces;

namespace PicnicPlanner.Api.Domain.Services.WeatherScoring;

/// <summary>
/// Scoring criterion based on precipitation probability and amount
/// </summary>
public class PrecipitationScoringCriterion : IWeatherScoringCriterion
{
    public string Name => "Precipitation";
    public int Weight { get; }

    private readonly PrecipitationScoringConfig _config;

    public PrecipitationScoringCriterion(PrecipitationScoringConfig config, int weight = 30)
    {
        _config = config ?? throw new ArgumentNullException(nameof(config));
        Weight = Math.Clamp(weight, 0, 100);
    }

    public WeatherScoringResult CalculateScore(WeatherScoringParameters parameters)
    {
        var precipChance = parameters.PrecipitationChance;
        var reasons = new List<string>();
        int score;

        if (precipChance <= _config.IdealMaxChance)
        {
            reasons.Add($"Minimal chance of rain ({precipChance}%)");
            score = _config.IdealScore;
        }
        else if (precipChance <= _config.AcceptableMaxChance)
        {
            reasons.Add($"Low chance of rain ({precipChance}%)");
            score = _config.AcceptableScore;
        }
        else if (precipChance <= _config.ModerateMaxChance)
        {
            reasons.Add($"Moderate chance of rain ({precipChance}%)");
            score = _config.ModerateScore;
        }
        else
        {
            reasons.Add($"High chance of rain ({precipChance}%)");
            score = _config.PoorScore;
        }

        // Factor in precipitation amount if significant
        if (parameters.PrecipitationAmount > _config.HighAmountThreshold)
        {
            reasons.Add($"Heavy precipitation expected ({parameters.PrecipitationAmount}mm)");
            score = Math.Min(score, _config.PoorScore);
        }

        return new WeatherScoringResult(score, $"Precipitation assessment: {precipChance}% chance")
        {
            Reasons = reasons
        };
    }
}

/// <summary>
/// Configuration for precipitation-based scoring
/// </summary>
public record PrecipitationScoringConfig
{
    public decimal IdealMaxChance { get; init; } = 10m;
    public decimal AcceptableMaxChance { get; init; } = 30m;
    public decimal ModerateMaxChance { get; init; } = 50m;
    public decimal HighAmountThreshold { get; init; } = 5m; // mm
    public int IdealScore { get; init; } = 30;
    public int AcceptableScore { get; init; } = 20;
    public int ModerateScore { get; init; } = 10;
    public int PoorScore { get; init; } = 0;
}
