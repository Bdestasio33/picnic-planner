namespace PicnicPlanner.Api.Domain.Entities;

/// <summary>
/// Represents historical weather data for a specific calendar date across multiple years
/// </summary>
public class HistoricalWeatherData
{
    /// <summary>
    /// The calendar date (month and day) for which historical data is collected
    /// </summary>
    public DateOnly Date { get; private set; }

    /// <summary>
    /// Average temperature across all years in Celsius
    /// </summary>
    public decimal AverageTemperature { get; private set; }

    /// <summary>
    /// Average precipitation across all years in millimeters
    /// </summary>
    public decimal AveragePrecipitation { get; private set; }

    /// <summary>
    /// Average humidity across all years as percentage (0-100)
    /// </summary>
    public decimal AverageHumidity { get; private set; }

    /// <summary>
    /// Historical data points for individual years
    /// </summary>
    public IReadOnlyList<YearlyWeatherData> YearlyData { get; private set; }

    /// <summary>
    /// Number of years of historical data available
    /// </summary>
    public int YearsOfData => YearlyData.Count;

    /// <summary>
    /// Initializes historical weather data for a specific date
    /// </summary>
    /// <param name="date">The calendar date</param>
    /// <param name="yearlyData">Weather data for individual years</param>
    /// <exception cref="ArgumentException">Thrown when no yearly data is provided</exception>
    public HistoricalWeatherData(DateOnly date, IEnumerable<YearlyWeatherData> yearlyData)
    {
        Date = date;
        var dataList = yearlyData.ToList();

        if (!dataList.Any())
            throw new ArgumentException("At least one year of historical data is required", nameof(yearlyData));

        YearlyData = dataList.AsReadOnly();

        // Calculate averages
        AverageTemperature = Math.Round(dataList.Average(d => d.Temperature), 1);
        AveragePrecipitation = Math.Round(dataList.Average(d => d.Precipitation), 1);
        AverageHumidity = Math.Round(dataList.Average(d => d.Humidity), 1);
    }

    /// <summary>
    /// Gets the historical data for a specific year
    /// </summary>
    /// <param name="year">The year to retrieve</param>
    /// <returns>Weather data for the specified year, or null if not available</returns>
    public YearlyWeatherData? GetDataForYear(int year)
    {
        return YearlyData.FirstOrDefault(d => d.Year == year);
    }

    /// <summary>
    /// Gets the temperature range (min and max) across all historical years
    /// </summary>
    /// <returns>Tuple containing minimum and maximum temperatures</returns>
    public (decimal Min, decimal Max) GetTemperatureRange()
    {
        return (YearlyData.Min(d => d.Temperature), YearlyData.Max(d => d.Temperature));
    }

    /// <summary>
    /// Gets the precipitation range (min and max) across all historical years
    /// </summary>
    /// <returns>Tuple containing minimum and maximum precipitation</returns>
    public (decimal Min, decimal Max) GetPrecipitationRange()
    {
        return (YearlyData.Min(d => d.Precipitation), YearlyData.Max(d => d.Precipitation));
    }

    /// <summary>
    /// Returns a string representation of the historical data
    /// </summary>
    public override string ToString()
    {
        var tempRange = GetTemperatureRange();
        return $"{Date:MM-dd}: Avg {AverageTemperature}°C ({tempRange.Min}-{tempRange.Max}°C), " +
               $"Avg {AveragePrecipitation}mm precipitation, {YearsOfData} years of data";
    }
}

/// <summary>
/// Represents weather data for a specific year and date
/// </summary>
public record YearlyWeatherData
{
    /// <summary>
    /// The year of this weather data
    /// </summary>
    public int Year { get; init; }

    /// <summary>
    /// Average temperature for this date in this year (Celsius)
    /// </summary>
    public decimal Temperature { get; init; }

    /// <summary>
    /// Total precipitation for this date in this year (millimeters)
    /// </summary>
    public decimal Precipitation { get; init; }

    /// <summary>
    /// Average humidity for this date in this year (0-100)
    /// </summary>
    public decimal Humidity { get; init; }

    /// <summary>
    /// Initializes yearly weather data
    /// </summary>
    /// <param name="year">The year</param>
    /// <param name="temperature">Temperature in Celsius</param>
    /// <param name="precipitation">Precipitation in millimeters</param>
    /// <param name="humidity">Humidity percentage (0-100)</param>
    public YearlyWeatherData(int year, decimal temperature, decimal precipitation, decimal humidity)
    {
        Year = year;
        Temperature = temperature;
        Precipitation = Math.Max(precipitation, 0);
        Humidity = Math.Clamp(humidity, 0, 100);
    }
}