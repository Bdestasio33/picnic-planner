using PicnicPlanner.Api.Domain.Interfaces;

namespace PicnicPlanner.Api.Domain.Services.WeatherScoring;

/// <summary>
/// Factory for creating different weather scoring strategies
/// </summary>
public static class ScoringStrategyFactory
{
    /// <summary>
    /// Creates the default/balanced scoring strategy
    /// </summary>
    public static IWeatherScoringService CreateDefaultStrategy()
    {
        var criteria = new List<IWeatherScoringCriterion>
        {
            new TemperatureScoringCriterion(new TemperatureScoringConfig(), weight: 30),
            new PrecipitationScoringCriterion(new PrecipitationScoringConfig(), weight: 30),
            new WindScoringCriterion(new WindScoringConfig(), weight: 20),
            new HumidityScoringCriterion(new HumidityScoringConfig(), weight: 20)
        };

        var config = new WeatherScoringServiceConfig();
        return new WeatherScoringService(criteria, config);
    }

    /// <summary>
    /// Creates a conservative scoring strategy (more strict requirements)
    /// </summary>
    public static IWeatherScoringService CreateConservativeStrategy()
    {
        var criteria = new List<IWeatherScoringCriterion>
        {
            new TemperatureScoringCriterion(new TemperatureScoringConfig
            {
                IdealMinTemp = 22m,
                IdealMaxTemp = 24m,
                AcceptableMinTemp = 18m,
                AcceptableMaxTemp = 28m,
                IdealScore = 25,
                AcceptableScore = 15,
                PoorScore = 0
            }, weight: 35),

            new PrecipitationScoringCriterion(new PrecipitationScoringConfig
            {
                IdealMaxChance = 5m,
                AcceptableMaxChance = 15m,
                ModerateMaxChance = 25m,
                HighAmountThreshold = 2m,
                IdealScore = 35,
                AcceptableScore = 15,
                ModerateScore = 5,
                PoorScore = 0
            }, weight: 35),

            new WindScoringCriterion(new WindScoringConfig
            {
                LightWindMaxSpeed = 10m,
                ModerateWindMaxSpeed = 20m,
                StrongWindMaxSpeed = 30m,
                LightWindScore = 15,
                ModerateWindScore = 10,
                StrongWindScore = 2,
                VeryStrongWindScore = 0
            }, weight: 15),

            new HumidityScoringCriterion(new HumidityScoringConfig
            {
                IdealMinHumidity = 45m,
                IdealMaxHumidity = 55m,
                AcceptableMinHumidity = 35m,
                AcceptableMaxHumidity = 65m,
                IdealScore = 15,
                AcceptableScore = 10,
                PoorScore = 0
            }, weight: 15)
        };

        var config = new WeatherScoringServiceConfig
        {
            IdealThreshold = 85,
            FairThreshold = 70,
            IdealDescription = "Perfect picnic conditions with all factors ideal",
            FairDescription = "Acceptable conditions with some minor compromises",
            PoorDescription = "Challenging conditions - consider postponing"
        };

        return new WeatherScoringService(criteria, config);
    }

    /// <summary>
    /// Creates a relaxed scoring strategy (more lenient requirements)
    /// </summary>
    public static IWeatherScoringService CreateRelaxedStrategy()
    {
        var criteria = new List<IWeatherScoringCriterion>
        {
            new TemperatureScoringCriterion(new TemperatureScoringConfig
            {
                IdealMinTemp = 18m,
                IdealMaxTemp = 28m,
                AcceptableMinTemp = 12m,
                AcceptableMaxTemp = 35m,
                IdealScore = 35,
                AcceptableScore = 25,
                PoorScore = 10
            }, weight: 25),

            new PrecipitationScoringCriterion(new PrecipitationScoringConfig
            {
                IdealMaxChance = 20m,
                AcceptableMaxChance = 40m,
                ModerateMaxChance = 60m,
                HighAmountThreshold = 10m,
                IdealScore = 35,
                AcceptableScore = 25,
                ModerateScore = 15,
                PoorScore = 5
            }, weight: 25),

            new WindScoringCriterion(new WindScoringConfig
            {
                LightWindMaxSpeed = 20m,
                ModerateWindMaxSpeed = 35m,
                StrongWindMaxSpeed = 45m,
                LightWindScore = 25,
                ModerateWindScore = 20,
                StrongWindScore = 10,
                VeryStrongWindScore = 5
            }, weight: 25),

            new HumidityScoringCriterion(new HumidityScoringConfig
            {
                IdealMinHumidity = 30m,
                IdealMaxHumidity = 70m,
                AcceptableMinHumidity = 20m,
                AcceptableMaxHumidity = 80m,
                IdealScore = 25,
                AcceptableScore = 20,
                PoorScore = 10
            }, weight: 25)
        };

        var config = new WeatherScoringServiceConfig
        {
            IdealThreshold = 75,
            FairThreshold = 50,
            IdealDescription = "Great weather for outdoor activities!",
            FairDescription = "Good enough conditions for a fun picnic",
            PoorDescription = "Manageable conditions with proper preparation"
        };

        return new WeatherScoringService(criteria, config);
    }

    /// <summary>
    /// Creates a temperature-focused strategy (emphasizes temperature comfort)
    /// </summary>
    public static IWeatherScoringService CreateTemperatureFocusedStrategy()
    {
        var criteria = new List<IWeatherScoringCriterion>
        {
            new TemperatureScoringCriterion(new TemperatureScoringConfig(), weight: 50),
            new PrecipitationScoringCriterion(new PrecipitationScoringConfig(), weight: 25),
            new WindScoringCriterion(new WindScoringConfig(), weight: 15),
            new HumidityScoringCriterion(new HumidityScoringConfig(), weight: 10)
        };

        var config = new WeatherScoringServiceConfig
        {
            IdealDescription = "Perfect temperature with good overall conditions",
            FairDescription = "Comfortable temperature with minor weather concerns",
            PoorDescription = "Temperature may affect comfort significantly"
        };

        return new WeatherScoringService(criteria, config);
    }
}

/// <summary>
/// Enumeration of available scoring strategies
/// </summary>
public enum WeatherScoringStrategy
{
    Default,
    Conservative,
    Relaxed,
    TemperatureFocused
}
