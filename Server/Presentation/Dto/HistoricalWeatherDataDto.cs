using PicnicPlanner.Api.Domain.Entities;

namespace PicnicPlanner.Api.Presentation.Dto;

/// <summary>
/// DTO for historical weather data
/// </summary>
public record HistoricalWeatherDataDto
{
    /// <summary>
    /// The date for which historical data was collected (MM-dd format)
    /// </summary>
    public string Date { get; init; } = string.Empty;

    /// <summary>
    /// Average temperature across all years in Celsius
    /// </summary>
    public decimal AverageTemperature { get; init; }

    /// <summary>
    /// Average precipitation across all years in millimeters
    /// </summary>
    public decimal AveragePrecipitation { get; init; }

    /// <summary>
    /// Average humidity across all years (0-100)
    /// </summary>
    public decimal AverageHumidity { get; init; }

    /// <summary>
    /// Historical data points for individual years
    /// </summary>
    public IEnumerable<YearlyWeatherDataDto> YearlyData { get; init; } = Enumerable.Empty<YearlyWeatherDataDto>();

    /// <summary>
    /// Number of years of historical data available
    /// </summary>
    public int YearsOfData { get; init; }

    /// <summary>
    /// Creates a HistoricalWeatherDataDto from a domain HistoricalWeatherData entity
    /// </summary>
    public static HistoricalWeatherDataDto FromDomain(HistoricalWeatherData data) => new()
    {
        Date = data.Date.ToString("MM-dd"),
        AverageTemperature = data.AverageTemperature,
        AveragePrecipitation = data.AveragePrecipitation,
        AverageHumidity = data.AverageHumidity,
        YearlyData = data.YearlyData.Select(YearlyWeatherDataDto.FromDomain),
        YearsOfData = data.YearsOfData
    };
}