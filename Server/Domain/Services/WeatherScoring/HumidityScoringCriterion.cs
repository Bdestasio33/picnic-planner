using PicnicPlanner.Api.Domain.Interfaces;

namespace PicnicPlanner.Api.Domain.Services.WeatherScoring;

/// <summary>
/// Scoring criterion based on humidity levels for comfort during outdoor activities
/// </summary>
public class HumidityScoringCriterion : IWeatherScoringCriterion
{
    public string Name => "Humidity";
    public int Weight { get; }

    private readonly HumidityScoringConfig _config;

    public HumidityScoringCriterion(HumidityScoringConfig config, int weight = 20)
    {
        _config = config ?? throw new ArgumentNullException(nameof(config));
        Weight = Math.Clamp(weight, 0, 100);
    }

    public WeatherScoringResult CalculateScore(WeatherScoringParameters parameters)
    {
        var reasons = new List<string>();
        int score;

        if (!parameters.Humidity.HasValue)
        {
            reasons.Add("Humidity data unavailable");
            return new WeatherScoringResult(_config.NeutralScore, "Humidity assessment: data unavailable")
            {
                Reasons = reasons
            };
        }

        var humidity = parameters.Humidity.Value;

        if (humidity >= _config.IdealMinHumidity && humidity <= _config.IdealMaxHumidity)
        {
            reasons.Add($"Comfortable humidity ({humidity}%)");
            score = _config.IdealScore;
        }
        else if (humidity >= _config.AcceptableMinHumidity && humidity <= _config.AcceptableMaxHumidity)
        {
            reasons.Add($"Acceptable humidity ({humidity}%)");
            score = _config.AcceptableScore;
        }
        else
        {
            if (humidity < _config.AcceptableMinHumidity)
                reasons.Add($"Low humidity may cause discomfort ({humidity}%)");
            else
                reasons.Add($"High humidity may cause discomfort ({humidity}%)");
            score = _config.PoorScore;
        }

        return new WeatherScoringResult(score, $"Humidity assessment: {humidity}%")
        {
            Reasons = reasons
        };
    }
}

/// <summary>
/// Configuration for humidity-based scoring
/// </summary>
public record HumidityScoringConfig
{
    public decimal IdealMinHumidity { get; init; } = 40m; // %
    public decimal IdealMaxHumidity { get; init; } = 60m;
    public decimal AcceptableMinHumidity { get; init; } = 30m;
    public decimal AcceptableMaxHumidity { get; init; } = 70m;
    public int IdealScore { get; init; } = 20;
    public int AcceptableScore { get; init; } = 15;
    public int PoorScore { get; init; } = 5;
    public int NeutralScore { get; init; } = 10;
}
