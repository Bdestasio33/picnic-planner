using PicnicPlanner.Api.Presentation.Responses;

namespace PicnicPlanner.Api.Application.Mappings;

/// <summary>
/// Mapping class for transforming domain responses to application responses
/// </summary>
public static class WeatherResponseMapping
{
    /// <summary>
    /// Maps forecast and historical data to combined response
    /// </summary>
    public static CombinedWeatherResponse ToCombinedResponse(
        GetWeatherForecastResponse forecastResponse,
        GetHistoricalWeatherResponse historicalResponse,
        DateOnly requestedDate)
    {
        // Find the forecast for the requested date
        var specificForecast = forecastResponse.Forecasts.FirstOrDefault(f => f.Date == requestedDate);

        return new CombinedWeatherResponse(
            forecastResponse.Location,
            requestedDate,
            specificForecast,
            historicalResponse.HistoricalData,
            DateTime.UtcNow
        );
    }
}

