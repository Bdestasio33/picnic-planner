using PicnicPlanner.Api.Domain.Interfaces;
using PicnicPlanner.Api.Domain.Services.WeatherScoring;
using PicnicPlanner.Api.Domain.ValueObjects;

namespace PicnicPlanner.Api.Demo;

/// <summary>
/// Demonstration of the modular weather scoring system
/// </summary>
public static class WeatherScoringDemo
{
    public static void RunDemo()
    {
        Console.WriteLine("=== Weather Scoring System Demo ===");
        Console.WriteLine();

        // Sample weather data
        var parameters = new WeatherScoringParameters
        {
            MaxTemperature = 24m,
            MinTemperature = 18m,
            PrecipitationChance = 15m,
            PrecipitationAmount = 2m,
            WindSpeed = 12m,
            Humidity = 55m
        };

        Console.WriteLine($"Weather Data:");
        Console.WriteLine($"  Temperature: {parameters.MinTemperature}°C - {parameters.MaxTemperature}°C (avg: {parameters.AverageTemperature}°C)");
        Console.WriteLine($"  Precipitation: {parameters.PrecipitationChance}% chance, {parameters.PrecipitationAmount}mm");
        Console.WriteLine($"  Wind: {parameters.WindSpeed} km/h");
        Console.WriteLine($"  Humidity: {parameters.Humidity}%");
        Console.WriteLine();

        // Test different scoring strategies
        TestStrategy("Default Strategy", ScoringStrategyFactory.CreateDefaultStrategy(), parameters);
        TestStrategy("Conservative Strategy", ScoringStrategyFactory.CreateConservativeStrategy(), parameters);
        TestStrategy("Relaxed Strategy", ScoringStrategyFactory.CreateRelaxedStrategy(), parameters);
        TestStrategy("Temperature-Focused Strategy", ScoringStrategyFactory.CreateTemperatureFocusedStrategy(), parameters);

        Console.WriteLine("=== WeatherCondition Integration Demo ===");
        Console.WriteLine();

        // Test with different weather scenarios
        TestWeatherScenario("Perfect Day", 23m, 21m, 5m, 0m, 8m, 50m);
        TestWeatherScenario("Rainy Day", 20m, 16m, 80m, 10m, 25m, 85m);
        TestWeatherScenario("Hot & Windy", 35m, 28m, 10m, 0m, 40m, 35m);
        TestWeatherScenario("Cold Day", 8m, 2m, 20m, 1m, 15m, 40m);
    }

    private static void TestStrategy(string strategyName, IWeatherScoringService strategy, WeatherScoringParameters parameters)
    {
        Console.WriteLine($"--- {strategyName} ---");

        var result = strategy.CalculateOverallScore(parameters);

        Console.WriteLine($"Overall Score: {result.Score}/100");
        Console.WriteLine($"Assessment: {result.Explanation}");

        Console.WriteLine("Criteria Breakdown:");
        foreach (var criterion in result.CriteriaScores)
        {
            var criterionWeight = strategy.GetCriteria().First(c => c.Name == criterion.Key).Weight;
            Console.WriteLine($"  {criterion.Key}: {criterion.Value}/100 (weight: {criterionWeight}%)");
        }

        if (result.Reasons.Any())
        {
            Console.WriteLine("Details:");
            foreach (var reason in result.Reasons)
            {
                Console.WriteLine($"  • {reason}");
            }
        }

        Console.WriteLine();
    }

    private static void TestWeatherScenario(string scenarioName, decimal maxTemp, decimal minTemp,
        decimal precipChance, decimal precipAmount, decimal windSpeed, decimal humidity)
    {
        Console.WriteLine($"--- {scenarioName} ---");

        // Test with default strategy
        var defaultStrategy = ScoringStrategyFactory.CreateDefaultStrategy();
        var condition = WeatherCondition.Assess(defaultStrategy, maxTemp, minTemp, precipChance, precipAmount, windSpeed, humidity);

        Console.WriteLine($"Temperature: {minTemp}°C - {maxTemp}°C");
        Console.WriteLine($"Precipitation: {precipChance}% chance, {precipAmount}mm");
        Console.WriteLine($"Wind: {windSpeed} km/h, Humidity: {humidity}%");
        Console.WriteLine($"Result: {condition.Type} - {condition.Description} (Score: {condition.Score}/100)");

        if (condition.Reasons.Any())
        {
            Console.WriteLine("Reasons:");
            foreach (var reason in condition.Reasons)
            {
                Console.WriteLine($"  • {reason}");
            }
        }

        Console.WriteLine();
    }
}
