using System.Text.Json;
using System.Web;
using PicnicPlanner.Api.Domain.Interfaces;
using PicnicPlanner.Api.Domain.ValueObjects;

namespace PicnicPlanner.Api.Infrastructure.ExternalServices;

/// <summary>
/// Geocoding service implementation using the Open-Meteo Geocoding API
/// Documentation: https://open-meteo.com/en/docs/geocoding-api
/// </summary>
public class OpenMeteoGeocodeService : IGeocodeService
{
    private readonly HttpClient _httpClient;
    private const string BaseUrl = "https://geocoding-api.open-meteo.com/v1";

    /// <summary>
    /// Initializes a new Open-Meteo geocoding service
    /// </summary>
    /// <param name="httpClient">HTTP client for API requests</param>
    public OpenMeteoGeocodeService(HttpClient httpClient)
    {
        _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
    }

    /// <summary>
    /// Geocodes a location by city and optional state/country
    /// </summary>
    public async Task<Location> GeocodeAsync(string city, string? state = null, string? country = null, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(city))
            throw new ArgumentException("City name cannot be empty", nameof(city));

        // Open-Meteo works better with simple city names, so try city first
        var searchQuery = city;

        // Try with just the city name first
        try
        {
            var location = await PerformGeocodeAsync(searchQuery, state, country, cancellationToken);
            return location;
        }
        catch (InvalidOperationException)
        {
            // If no results with city name, try with state if provided
            if (!string.IsNullOrWhiteSpace(state))
            {
                searchQuery = $"{city}, {state}";
                return await PerformGeocodeAsync(searchQuery, state, country, cancellationToken);
            }
            throw;
        }
    }

    /// <summary>
    /// Geocodes a location by free-form address string
    /// </summary>
    public async Task<Location> GeocodeAsync(string address, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(address))
            throw new ArgumentException("Address cannot be empty", nameof(address));

        return await PerformGeocodeAsync(address, null, null, cancellationToken);
    }

    /// <summary>
    /// Performs the actual geocoding request to Open-Meteo API
    /// </summary>
    private async Task<Location> PerformGeocodeAsync(string searchQuery, string? state, string? country, CancellationToken cancellationToken)
    {
        var url = BuildGeocodingUrl(searchQuery);

        try
        {
            var response = await _httpClient.GetAsync(url, cancellationToken);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            var data = JsonSerializer.Deserialize<OpenMeteoGeocodingResponse>(json, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
            });

            if (data?.Results == null || !data.Results.Any())
                throw new InvalidOperationException($"No geocoding results found for query: {searchQuery}");

            // Filter results by state/country if provided
            var filteredResults = data.Results.AsEnumerable();

            if (!string.IsNullOrWhiteSpace(state))
            {
                var usState = UsState.FromAbbreviation(state);
                filteredResults = filteredResults.Where(r =>
                    string.Equals(r.Admin1, state, StringComparison.OrdinalIgnoreCase) ||
                    (usState != null && string.Equals(r.Admin1, usState.FullName, StringComparison.OrdinalIgnoreCase)));
            }

            if (!string.IsNullOrWhiteSpace(country))
            {
                filteredResults = filteredResults.Where(r =>
                    string.Equals(r.Country, country, StringComparison.OrdinalIgnoreCase));
            }

            var result = filteredResults.FirstOrDefault() ?? data.Results.First();

            var locationName = BuildLocationName(result);

            return new Location(
                (decimal)result.Latitude,
                (decimal)result.Longitude,
                locationName
            );
        }
        catch (HttpRequestException ex)
        {
            throw new InvalidOperationException($"Failed to geocode location: {searchQuery}", ex);
        }
        catch (JsonException ex)
        {
            throw new InvalidOperationException($"Failed to parse geocoding response for: {searchQuery}", ex);
        }
    }



    /// <summary>
    /// Builds the geocoding API URL
    /// </summary>
    private static string BuildGeocodingUrl(string searchQuery)
    {
        var encodedQuery = HttpUtility.UrlEncode(searchQuery);
        return $"{BaseUrl}/search?name={encodedQuery}&count=10&language=en&format=json";
    }

    /// <summary>
    /// Builds a readable location name from the geocoding result
    /// </summary>
    private static string BuildLocationName(OpenMeteoGeocodingResult result)
    {
        var parts = new List<string> { result.Name };

        if (!string.IsNullOrWhiteSpace(result.Admin1))
            parts.Add(result.Admin1);

        if (!string.IsNullOrWhiteSpace(result.Country))
            parts.Add(result.Country);

        return string.Join(", ", parts);
    }
}

/// <summary>
/// Response model for Open-Meteo geocoding API
/// </summary>
public record OpenMeteoGeocodingResponse
{
    public List<OpenMeteoGeocodingResult> Results { get; init; } = new();
}

/// <summary>
/// Individual geocoding result from Open-Meteo API
/// </summary>
public record OpenMeteoGeocodingResult
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public double Latitude { get; init; }
    public double Longitude { get; init; }
    public double Elevation { get; init; }
    public string FeatureCode { get; init; } = string.Empty;
    public string CountryCode { get; init; } = string.Empty;
    public int Admin1Id { get; init; }
    public int Admin2Id { get; init; }
    public string Timezone { get; init; } = string.Empty;
    public int Population { get; init; }
    public List<string> Postcodes { get; init; } = new();
    public int CountryId { get; init; }
    public string Country { get; init; } = string.Empty;
    public string Admin1 { get; init; } = string.Empty;
    public string Admin2 { get; init; } = string.Empty;
}