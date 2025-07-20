using MediatR;
using Microsoft.AspNetCore.Mvc;
using PicnicPlanner.Api.Application.Mappings;
using PicnicPlanner.Api.Application.Queries;
using PicnicPlanner.Api.Presentation.Dto;
using PicnicPlanner.Api.Presentation.Requests;
using PicnicPlanner.Api.Presentation.Responses;

namespace PicnicPlanner.Api.Presentation.Controllers;

/// <summary>
/// Controller for weather-related endpoints
/// </summary>
public class WeatherController : BaseController
{
    private readonly IMediator _mediator;

    /// <summary>
    /// Initializes a new weather controller
    /// </summary>
    /// <param name="mediator">MediatR mediator for handling queries</param>
    public WeatherController(IMediator mediator)
    {
        _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
    }

    /// <summary>
    /// Gets the 14-day weather forecast for a specific location
    /// </summary>
    /// <param name="request">Weather forecast request parameters</param>
    /// <param name="cancellationToken">Cancellation token</param>
    [HttpGet("forecast")]
    [ProducesResponseType(typeof(WeatherForecastResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetForecast(
        [FromQuery] GetWeatherForecastRequest request,
        CancellationToken cancellationToken = default)
    {
        return await ExecuteWeatherQueryAsync<GetWeatherForecastQuery, GetWeatherForecastResponse, WeatherForecastResponseDto>(
            request.City,
            request.State,
            request.Country,
            location => WeatherRequestMapping.ToForecastQuery(location),
            response => new WeatherForecastResponseDto
            {
                Location = LocationDto.FromDomain(response.Location),
                Forecasts = response.Forecasts.Select(WeatherForecastDto.FromDomain),
                RetrievedAt = response.RetrievedAt
            },
            _mediator,
            cancellationToken);
    }

    /// <summary>
    /// Gets historical weather data for a specific date and location
    /// </summary>
    /// <param name="request">Historical weather request parameters</param>
    /// <param name="cancellationToken">Cancellation token</param>
    [HttpGet("historical")]
    [ProducesResponseType(typeof(HistoricalWeatherResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetHistoricalWeather(
        [FromQuery] GetHistoricalWeatherRequest request,
        CancellationToken cancellationToken = default)
    {
        var dateValidationError = ValidateAndParseDate(request.Date, out var parsedDate);
        if (dateValidationError != null) return dateValidationError;

        return await ExecuteWeatherQueryAsync<GetHistoricalWeatherQuery, GetHistoricalWeatherResponse, HistoricalWeatherResponseDto>(
            request.City,
            request.State,
            request.Country,
            location => WeatherRequestMapping.ToHistoricalQuery(location, parsedDate, request.YearsBack),
            response => new HistoricalWeatherResponseDto
            {
                Location = LocationDto.FromDomain(response.Location),
                RequestedDate = response.RequestedDate.ToString("yyyy-MM-dd"),
                HistoricalData = HistoricalWeatherDataDto.FromDomain(response.HistoricalData),
                RetrievedAt = response.RetrievedAt
            },
            _mediator,
            cancellationToken);
    }

    /// <summary>
    /// Gets both current forecast and historical data for a specific date and location
    /// </summary>
    /// <param name="request">Combined weather request parameters</param>
    /// <param name="cancellationToken">Cancellation token</param>
    [HttpGet("combined")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetCombinedWeatherData(
        [FromQuery] GetCombinedWeatherRequest request,
        CancellationToken cancellationToken = default)
    {
        var dateValidationError = ValidateAndParseDate(request.Date, out var parsedDate);
        if (dateValidationError != null) return dateValidationError;

        var locationResult = await WeatherRequestMapping.ResolveLocationAsync(
            request.City, request.State, request.Country, _mediator, cancellationToken);
        if (!locationResult.IsSuccess)
            return HandleFailure(locationResult);

        var location = locationResult.ResultValue!;
        var forecastQuery = WeatherRequestMapping.ToForecastQuery(location);
        var historicalQuery = WeatherRequestMapping.ToHistoricalQuery(location, parsedDate, request.YearsBack);

        var forecastTask = _mediator.Send(forecastQuery, cancellationToken);
        var historicalTask = _mediator.Send(historicalQuery, cancellationToken);

        await Task.WhenAll(forecastTask, historicalTask);

        var forecastResponse = await forecastTask;
        var historicalResponse = await historicalTask;

        if (!forecastResponse.IsSuccess) return HandleFailure(forecastResponse);
        if (!historicalResponse.IsSuccess) return HandleFailure(historicalResponse);

        var combinedResponse = WeatherResponseMapping.ToCombinedResponse(
            forecastResponse.ResultValue!, historicalResponse.ResultValue!, parsedDate);

        var dto = new
        {
            Location = LocationDto.FromDomain(combinedResponse.Location),
            RequestedDate = combinedResponse.RequestedDate.ToString("yyyy-MM-dd"),
            Forecast = combinedResponse.Forecast != null ? WeatherForecastDto.FromDomain(combinedResponse.Forecast) : null,
            HistoricalData = HistoricalWeatherDataDto.FromDomain(combinedResponse.HistoricalData),
            combinedResponse.RetrievedAt
        };

        return Ok(dto);
    }
}