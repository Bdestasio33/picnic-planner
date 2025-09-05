using PicnicPlanner.Api.Domain.Interfaces;

namespace PicnicPlanner.Api.Domain.Services.WeatherScoring;

/// <summary>
/// Scoring criterion based on temperature suitability for outdoor activities
/// </summary>
public class TemperatureScoringCriterion : IWeatherScoringCriterion
{
    public string Name => "Temperature";
    public int Weight { get; }

    private readonly TemperatureScoringConfig _config;

    public TemperatureScoringCriterion(TemperatureScoringConfig config, int weight = 30)
    {
        _config = config ?? throw new ArgumentNullException(nameof(config));
        Weight = Math.Clamp(weight, 0, 100);
    }

    public WeatherScoringResult CalculateScore(WeatherScoringParameters parameters)
    {
        var avgTemp = parameters.AverageTemperature;
        var reasons = new List<string>();
        int score;

        if (avgTemp >= _config.IdealMinTemp && avgTemp <= _config.IdealMaxTemp)
        {
            reasons.Add($"Perfect temperature range ({avgTemp:F1}°C)");
            score = _config.IdealScore;
        }
        else if (avgTemp >= _config.AcceptableMinTemp && avgTemp <= _config.AcceptableMaxTemp)
        {
            reasons.Add($"Acceptable temperature ({avgTemp:F1}°C)");
            score = _config.AcceptableScore;
        }
        else
        {
            if (avgTemp < _config.AcceptableMinTemp)
                reasons.Add($"Too cold for comfortable outdoor activities ({avgTemp:F1}°C)");
            else
                reasons.Add($"Too hot for comfortable outdoor activities ({avgTemp:F1}°C)");
            score = _config.PoorScore;
        }

        return new WeatherScoringResult(score, $"Temperature assessment: {avgTemp:F1}°C")
        {
            Reasons = reasons
        };
    }
}

/// <summary>
/// Configuration for temperature-based scoring
/// </summary>
public record TemperatureScoringConfig
{
    public decimal IdealMinTemp { get; init; } = 20m;
    public decimal IdealMaxTemp { get; init; } = 25m;
    public decimal AcceptableMinTemp { get; init; } = 15m;
    public decimal AcceptableMaxTemp { get; init; } = 30m;
    public int IdealScore { get; init; } = 30;
    public int AcceptableScore { get; init; } = 20;
    public int PoorScore { get; init; } = 5;
}
