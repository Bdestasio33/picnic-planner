using System.ComponentModel.DataAnnotations;

namespace PicnicPlanner.Api.Presentation.Requests;

/// <summary>
/// Request model for getting combined forecast and historical weather data
/// </summary>
public class GetCombinedWeatherRequest
{
    /// <summary>
    /// City name - required
    /// </summary>
    [Required(ErrorMessage = "City name is required")]
    [StringLength(100, ErrorMessage = "City name cannot exceed 100 characters")]
    public string City { get; set; } = string.Empty;

    /// <summary>
    /// Optional state or province (used with city)
    /// </summary>
    [StringLength(100, ErrorMessage = "State name cannot exceed 100 characters")]
    public string? State { get; set; }

    /// <summary>
    /// Optional country (used with city)
    /// </summary>
    [StringLength(100, ErrorMessage = "Country name cannot exceed 100 characters")]
    public string? Country { get; set; }

    /// <summary>
    /// Date for combined data in ISO format (yyyy-MM-dd)
    /// </summary>
    [Required(ErrorMessage = "Date is required")]
    [RegularExpression(@"^\d{4}-\d{2}-\d{2}$", ErrorMessage = "Date must be in ISO format (yyyy-MM-dd)")]
    public string Date { get; set; } = string.Empty;

    /// <summary>
    /// Number of years of historical data to retrieve (1-50, default: 10)
    /// </summary>
    [Range(1, 50, ErrorMessage = "Years back must be between 1 and 50")]
    public int YearsBack { get; set; } = 10;
}