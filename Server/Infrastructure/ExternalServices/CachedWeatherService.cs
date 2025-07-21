using Microsoft.Extensions.Caching.Memory;
using PicnicPlanner.Api.Domain.Entities;
using PicnicPlanner.Api.Domain.Interfaces;
using PicnicPlanner.Api.Domain.ValueObjects;

namespace PicnicPlanner.Api.Infrastructure.ExternalServices;

/// <summary>
/// Decorator for weather service that adds in-memory caching to reduce API calls
/// </summary>
public class CachedWeatherService : IWeatherService
{
    private readonly IWeatherService _innerWeatherService;
    private readonly IMemoryCache _memoryCache;
    private readonly ILogger<CachedWeatherService> _logger;

    // Cache duration settings
    private static readonly TimeSpan ForecastCacheDuration = TimeSpan.FromMinutes(10);
    private static readonly TimeSpan HistoricalCacheDuration = TimeSpan.FromHours(24);

    /// <summary>
    /// Initializes a new cached weather service
    /// </summary>
    /// <param name="innerWeatherService">The underlying weather service implementation</param>
    /// <param name="memoryCache">Memory cache for storing weather data</param>
    /// <param name="logger">Logger for cache operations</param>
    public CachedWeatherService(
        IWeatherService innerWeatherService,
        IMemoryCache memoryCache,
        ILogger<CachedWeatherService> logger)
    {
        _innerWeatherService = innerWeatherService ?? throw new ArgumentNullException(nameof(innerWeatherService));
        _memoryCache = memoryCache ?? throw new ArgumentNullException(nameof(memoryCache));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Retrieves weather forecast with caching (10-minute cache)
    /// </summary>
    public async Task<IEnumerable<WeatherForecast>> GetForecastAsync(Location location, CancellationToken cancellationToken = default)
    {
        var cacheKey = GenerateForecastCacheKey(location);

        if (_memoryCache.TryGetValue(cacheKey, out IEnumerable<WeatherForecast>? cachedForecast))
        {
            _logger.LogDebug("Cache hit for forecast: {CacheKey}", cacheKey);
            return cachedForecast!;
        }

        _logger.LogDebug("Cache miss for forecast: {CacheKey}", cacheKey);

        var forecast = await _innerWeatherService.GetForecastAsync(location, cancellationToken);

        var cacheOptions = new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = ForecastCacheDuration,
            SlidingExpiration = TimeSpan.FromMinutes(5), // Refresh if accessed within 5 minutes of expiry
            Priority = CacheItemPriority.High
        };

        _memoryCache.Set(cacheKey, forecast, cacheOptions);

        _logger.LogInformation("Cached forecast for location {Location} for {Duration} minutes",
            location.Name, ForecastCacheDuration.TotalMinutes);

        return forecast;
    }

    /// <summary>
    /// Retrieves historical weather data with caching (24-hour cache)
    /// </summary>
    public async Task<HistoricalWeatherData> GetHistoricalDataAsync(
        Location location,
        DateOnly date,
        int yearsBack = 10,
        CancellationToken cancellationToken = default)
    {
        var cacheKey = GenerateHistoricalCacheKey(location, date, yearsBack);

        if (_memoryCache.TryGetValue(cacheKey, out HistoricalWeatherData? cachedHistorical))
        {
            _logger.LogDebug("Cache hit for historical: {CacheKey}", cacheKey);
            return cachedHistorical!;
        }

        _logger.LogDebug("Cache miss for historical: {CacheKey}", cacheKey);

        var historical = await _innerWeatherService.GetHistoricalDataAsync(location, date, yearsBack, cancellationToken);

        var cacheOptions = new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = HistoricalCacheDuration,
            Priority = CacheItemPriority.High // Historical data is valuable and doesn't change
        };

        _memoryCache.Set(cacheKey, historical, cacheOptions);

        _logger.LogInformation("Cached historical data for location {Location}, date {Date} for {Duration} hours",
            location.Name, date, HistoricalCacheDuration.TotalHours);

        return historical;
    }

    /// <summary>
    /// Retrieves combined weather data (leverages individual method caching)
    /// </summary>
    public async Task<(WeatherForecast? Forecast, HistoricalWeatherData Historical)> GetCombinedWeatherDataAsync(
        Location location,
        DateOnly date,
        int yearsBack = 10,
        CancellationToken cancellationToken = default)
    {
        // Use the cached methods for individual components instead of caching combined result
        // This provides better cache efficiency and reuse

        var forecastTask = GetForecastAsync(location, cancellationToken);
        var historicalTask = GetHistoricalDataAsync(location, date, yearsBack, cancellationToken);

        await Task.WhenAll(forecastTask, historicalTask);

        var forecasts = await forecastTask;
        var historical = await historicalTask;

        var forecast = forecasts.FirstOrDefault(f => f.Date == date);

        _logger.LogDebug("Retrieved combined weather data for location {Location}, date {Date}",
            location.Name, date);

        return (forecast, historical);
    }

    /// <summary>
    /// Generates cache key for forecast data
    /// </summary>
    private static string GenerateForecastCacheKey(Location location)
    {
        // Round coordinates to 2 decimal places to avoid cache misses from tiny differences
        var lat = Math.Round(location.Latitude, 2);
        var lng = Math.Round(location.Longitude, 2);
        return $"forecast:{lat}:{lng}";
    }

    /// <summary>
    /// Generates cache key for historical data
    /// </summary>
    private static string GenerateHistoricalCacheKey(Location location, DateOnly date, int yearsBack)
    {
        // Round coordinates to 2 decimal places to avoid cache misses from tiny differences
        var lat = Math.Round(location.Latitude, 2);
        var lng = Math.Round(location.Longitude, 2);
        return $"historical:{lat}:{lng}:{date:yyyy-MM-dd}:{yearsBack}";
    }
}