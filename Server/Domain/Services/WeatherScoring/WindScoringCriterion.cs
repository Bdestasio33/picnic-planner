using PicnicPlanner.Api.Domain.Interfaces;

namespace PicnicPlanner.Api.Domain.Services.WeatherScoring;

/// <summary>
/// Scoring criterion based on wind speed suitability for outdoor activities
/// </summary>
public class WindScoringCriterion : IWeatherScoringCriterion
{
    public string Name => "Wind";
    public int Weight { get; }

    private readonly WindScoringConfig _config;

    public WindScoringCriterion(WindScoringConfig config, int weight = 20)
    {
        _config = config ?? throw new ArgumentNullException(nameof(config));
        Weight = Math.Clamp(weight, 0, 100);
    }

    public WeatherScoringResult CalculateScore(WeatherScoringParameters parameters)
    {
        var reasons = new List<string>();
        int score;

        if (!parameters.WindSpeed.HasValue)
        {
            reasons.Add("Wind data unavailable");
            return new WeatherScoringResult(_config.NeutralScore, "Wind assessment: data unavailable")
            {
                Reasons = reasons
            };
        }

        var windSpeed = parameters.WindSpeed.Value;

        if (windSpeed <= _config.LightWindMaxSpeed)
        {
            reasons.Add($"Light winds ({windSpeed} km/h)");
            score = _config.LightWindScore;
        }
        else if (windSpeed <= _config.ModerateWindMaxSpeed)
        {
            reasons.Add($"Moderate winds ({windSpeed} km/h)");
            score = _config.ModerateWindScore;
        }
        else if (windSpeed <= _config.StrongWindMaxSpeed)
        {
            reasons.Add($"Strong winds ({windSpeed} km/h)");
            score = _config.StrongWindScore;
        }
        else
        {
            reasons.Add($"Very strong winds ({windSpeed} km/h)");
            score = _config.VeryStrongWindScore;
        }

        return new WeatherScoringResult(score, $"Wind assessment: {windSpeed} km/h")
        {
            Reasons = reasons
        };
    }
}

/// <summary>
/// Configuration for wind-based scoring
/// </summary>
public record WindScoringConfig
{
    public decimal LightWindMaxSpeed { get; init; } = 15m; // km/h
    public decimal ModerateWindMaxSpeed { get; init; } = 25m;
    public decimal StrongWindMaxSpeed { get; init; } = 35m;
    public int LightWindScore { get; init; } = 20;
    public int ModerateWindScore { get; init; } = 15;
    public int StrongWindScore { get; init; } = 5;
    public int VeryStrongWindScore { get; init; } = 0;
    public int NeutralScore { get; init; } = 10;
}
