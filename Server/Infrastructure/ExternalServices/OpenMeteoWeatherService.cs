using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;
using PicnicPlanner.Api.Domain.Entities;
using PicnicPlanner.Api.Domain.Interfaces;
using PicnicPlanner.Api.Domain.ValueObjects;

namespace PicnicPlanner.Api.Infrastructure.ExternalServices;

/// <summary>
/// Weather service implementation using the Open-Meteo API
/// Documentation: https://open-meteo.com/
/// </summary>
public class OpenMeteoWeatherService : IWeatherService
{
    private readonly HttpClient _httpClient;
    private const string BaseUrl = "https://api.open-meteo.com/v1";

    /// <summary>
    /// Initializes a new Open-Meteo weather service
    /// </summary>
    /// <param name="httpClient">HTTP client for API requests</param>
    public OpenMeteoWeatherService(HttpClient httpClient)
    {
        _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
    }

    /// <summary>
    /// Retrieves weather forecast for the next 14 days from Open-Meteo API
    /// </summary>
    /// <param name="location">The geographical location</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Collection of daily weather forecasts</returns>
    public async Task<IEnumerable<WeatherForecast>> GetForecastAsync(
        Location location,
        CancellationToken cancellationToken = default)
    {
        var url = BuildForecastUrl(location);

        try
        {
            var response = await _httpClient.GetAsync(url, cancellationToken);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            var data = JsonSerializer.Deserialize<OpenMeteoForecastResponse>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (data?.Daily == null)
                throw new InvalidOperationException("Invalid response from Open-Meteo forecast API");

            return ParseForecastData(data.Daily);
        }
        catch (HttpRequestException ex)
        {
            throw new InvalidOperationException($"Failed to retrieve forecast data from Open-Meteo API", ex);
        }
        catch (JsonException ex)
        {
            throw new InvalidOperationException($"Failed to parse forecast response from Open-Meteo API", ex);
        }
    }

    /// <summary>
    /// Retrieves historical weather data for a specific date across multiple years
    /// </summary>
    /// <param name="location">The geographical location</param>
    /// <param name="date">The date for which to retrieve historical data</param>
    /// <param name="yearsBack">Number of years of historical data to retrieve</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Historical weather data for the specified date</returns>
    public async Task<HistoricalWeatherData> GetHistoricalDataAsync(
        Location location,
        DateOnly date,
        int yearsBack = 10,
        CancellationToken cancellationToken = default)
    {
        var yearlyDataTasks = new List<Task<YearlyWeatherData?>>();
        var requestedYear = date.Year;

        // Create tasks for each year of historical data
        for (int i = 1; i <= yearsBack; i++)
        {
            var targetYear = requestedYear - i;
            var historicalDate = new DateOnly(targetYear, date.Month, date.Day);

            // Skip leap day if target year is not a leap year
            if (date.Month == 2 && date.Day == 29 && !DateTime.IsLeapYear(targetYear))
                continue;

            yearlyDataTasks.Add(GetHistoricalDataForYearAsync(location, historicalDate, cancellationToken));
        }

        var yearlyDataResults = await Task.WhenAll(yearlyDataTasks);
        var validYearlyData = yearlyDataResults.Where(data => data != null).Cast<YearlyWeatherData>().ToList();

        if (!validYearlyData.Any())
            throw new InvalidOperationException($"No historical weather data available for {date:MM-dd} at location {location}");

        return new HistoricalWeatherData(date, validYearlyData);
    }

    /// <summary>
    /// Retrieves both forecast and historical data for a specific date
    /// </summary>
    /// <param name="location">The geographical location</param>
    /// <param name="date">The date for which to retrieve combined data</param>
    /// <param name="yearsBack">Number of years of historical data to retrieve</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Tuple containing forecast and historical data</returns>
    public async Task<(WeatherForecast? Forecast, HistoricalWeatherData Historical)> GetCombinedWeatherDataAsync(
        Location location,
        DateOnly date,
        int yearsBack = 10,
        CancellationToken cancellationToken = default)
    {
        var forecastTask = GetForecastAsync(location, cancellationToken);
        var historicalTask = GetHistoricalDataAsync(location, date, yearsBack, cancellationToken);

        await Task.WhenAll(forecastTask, historicalTask);

        var forecasts = await forecastTask;
        var historical = await historicalTask;

        var forecast = forecasts.FirstOrDefault(f => f.Date == date);

        return (forecast, historical);
    }

    /// <summary>
    /// Retrieves historical weather data for a specific year and date
    /// </summary>
    private async Task<YearlyWeatherData?> GetHistoricalDataForYearAsync(
        Location location,
        DateOnly date,
        CancellationToken cancellationToken)
    {
        var url = BuildHistoricalUrl(location, date, date);

        try
        {
            // Use HttpClient without base address for archive API
            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Add("User-Agent", "PicnicPlanner/1.0");

            var response = await httpClient.GetAsync(url, cancellationToken);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            var data = JsonSerializer.Deserialize<OpenMeteoHistoricalResponse>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (data?.Daily == null || !data.Daily.Time.Any())
                return null;

            // Use safe array access with bounds checking
            var temperature = GetArrayValue(data.Daily.Temperature2mMean, 0, 0m);
            var precipitation = GetArrayValue(data.Daily.PrecipitationSum, 0, 0m);
            var humidity = GetArrayValue(data.Daily.RelativeHumidity2m, 0, 0m);

            return new YearlyWeatherData(
                date.Year,
                temperature,
                precipitation,
                humidity
            );
        }
        catch (Exception)
        {
            // Return null for failed requests (e.g., data not available for that year)
            return null;
        }
    }

    /// <summary>
    /// Builds the URL for forecast API requests
    /// </summary>
    private static string BuildForecastUrl(Location location)
    {
        var culture = CultureInfo.InvariantCulture;
        return $"{BaseUrl}/forecast?" +
               $"latitude={location.Latitude.ToString(culture)}&" +
               $"longitude={location.Longitude.ToString(culture)}&" +
               $"daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max," +
               $"precipitation_sum,relative_humidity_2m_mean,wind_speed_10m_max,wind_direction_10m_dominant&" +
               $"timezone=auto&" +
               $"forecast_days=14";
    }

    /// <summary>
    /// Builds the URL for historical weather API requests
    /// </summary>
    private static string BuildHistoricalUrl(Location location, DateOnly startDate, DateOnly endDate)
    {
        var culture = CultureInfo.InvariantCulture;
        return $"https://archive-api.open-meteo.com/v1/archive?" +
               $"latitude={location.Latitude.ToString(culture)}&" +
               $"longitude={location.Longitude.ToString(culture)}&" +
               $"start_date={startDate:yyyy-MM-dd}&" +
               $"end_date={endDate:yyyy-MM-dd}&" +
               $"daily=temperature_2m_mean,precipitation_sum,relative_humidity_2m_mean&" +
               $"timezone=auto";
    }

    /// <summary>
    /// Parses forecast data from Open-Meteo API response
    /// </summary>
    private static IEnumerable<WeatherForecast> ParseForecastData(OpenMeteoDailyData daily)
    {
        for (int i = 0; i < daily.Time.Length; i++)
        {
            if (!DateOnly.TryParse(daily.Time[i], out var date))
                continue;

            // Use safe array access with bounds checking
            var maxTemp = GetArrayValue(daily.Temperature2mMax, i, 0m);
            var minTemp = GetArrayValue(daily.Temperature2mMin, i, 0m);
            var precipProb = GetArrayValue(daily.PrecipitationProbabilityMax, i, 0m);
            var precipSum = GetArrayValue(daily.PrecipitationSum, i, 0m);
            var humidity = GetArrayValue(daily.RelativeHumidity2m, i, 0m);
            var windSpeed = GetArrayValue(daily.WindSpeed10mMax, i, 0m);
            var windDirection = GetArrayValue(daily.WindDirection10mDominant, i, 0m);

            yield return new WeatherForecast(
                date,
                maxTemp,
                minTemp,
                precipProb,
                precipSum,
                humidity,
                windSpeed,
                windDirection
            );
        }
    }

    /// <summary>
    /// Safely gets a value from an array with bounds checking
    /// </summary>
    private static T GetArrayValue<T>(T[] array, int index, T defaultValue)
    {
        return index < array.Length ? array[index] : defaultValue;
    }
}

/// <summary>
/// Response model for Open-Meteo forecast API
/// </summary>
public record OpenMeteoForecastResponse
{
    [JsonPropertyName("daily")]
    public OpenMeteoDailyData Daily { get; init; } = new();
}

/// <summary>
/// Response model for Open-Meteo historical weather API
/// </summary>
public record OpenMeteoHistoricalResponse
{
    [JsonPropertyName("daily")]
    public OpenMeteoHistoricalDailyData Daily { get; init; } = new();
}

/// <summary>
/// Daily forecast data from Open-Meteo API
/// </summary>
public record OpenMeteoDailyData
{
    [JsonPropertyName("time")]
    public string[] Time { get; init; } = Array.Empty<string>();

    [JsonPropertyName("temperature_2m_max")]
    public decimal[] Temperature2mMax { get; init; } = Array.Empty<decimal>();

    [JsonPropertyName("temperature_2m_min")]
    public decimal[] Temperature2mMin { get; init; } = Array.Empty<decimal>();

    [JsonPropertyName("precipitation_probability_max")]
    public decimal[] PrecipitationProbabilityMax { get; init; } = Array.Empty<decimal>();

    [JsonPropertyName("precipitation_sum")]
    public decimal[] PrecipitationSum { get; init; } = Array.Empty<decimal>();

    [JsonPropertyName("relative_humidity_2m_mean")]
    public decimal[] RelativeHumidity2m { get; init; } = Array.Empty<decimal>();

    [JsonPropertyName("wind_speed_10m_max")]
    public decimal[] WindSpeed10mMax { get; init; } = Array.Empty<decimal>();

    [JsonPropertyName("wind_direction_10m_dominant")]
    public decimal[] WindDirection10mDominant { get; init; } = Array.Empty<decimal>();
}

/// <summary>
/// Daily historical data from Open-Meteo API
/// </summary>
public record OpenMeteoHistoricalDailyData
{
    [JsonPropertyName("time")]
    public string[] Time { get; init; } = Array.Empty<string>();

    [JsonPropertyName("temperature_2m_mean")]
    public decimal[] Temperature2mMean { get; init; } = Array.Empty<decimal>();

    [JsonPropertyName("precipitation_sum")]
    public decimal[] PrecipitationSum { get; init; } = Array.Empty<decimal>();

    [JsonPropertyName("relative_humidity_2m_mean")]
    public decimal[] RelativeHumidity2m { get; init; } = Array.Empty<decimal>();
}