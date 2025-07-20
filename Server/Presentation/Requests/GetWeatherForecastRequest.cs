using System.ComponentModel.DataAnnotations;

namespace PicnicPlanner.Api.Presentation.Requests;

/// <summary>
/// Request model for getting weather forecast data
/// </summary>
public class GetWeatherForecastRequest
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
}