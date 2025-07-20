using PicnicPlanner.Api.Domain.ValueObjects;

namespace PicnicPlanner.Api.Presentation.Dto;

/// <summary>
/// DTO for weather condition information
/// </summary>
public record WeatherConditionDto
{
    /// <summary>
    /// The condition type (Ideal, Fair, Poor)
    /// </summary>
    public string Type { get; init; } = string.Empty;

    /// <summary>
    /// Description of the weather condition
    /// </summary>
    public string Description { get; init; } = string.Empty;

    /// <summary>
    /// Numerical score from 0-100 representing picnic suitability
    /// </summary>
    public int Score { get; init; }

    /// <summary>
    /// Detailed reasons for the score and condition
    /// </summary>
    public List<string> Reasons { get; init; } = new();

    /// <summary>
    /// Creates a WeatherConditionDto from a domain WeatherCondition object
    /// </summary>
    public static WeatherConditionDto FromDomain(WeatherCondition condition) => new()
    {
        Type = condition.Type.ToString(),
        Description = condition.Description,
        Score = condition.Score,
        Reasons = condition.Reasons
    };
}