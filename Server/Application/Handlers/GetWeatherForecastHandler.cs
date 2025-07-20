using MediatR;
using PicnicPlanner.Api.Application.Queries;
using PicnicPlanner.Api.Domain.Common;
using PicnicPlanner.Api.Domain.Interfaces;
using PicnicPlanner.Api.Presentation.Responses;

namespace PicnicPlanner.Api.Application.Handlers;

/// <summary>
/// Handler for weather forecast queries
/// </summary>
public class GetWeatherForecastHandler : IRequestHandler<GetWeatherForecastQuery, Result<GetWeatherForecastResponse>>
{
    private readonly IWeatherService _weatherService;

    /// <summary>
    /// Initializes a new weather forecast handler
    /// </summary>
    /// <param name="weatherService">The weather service dependency</param>
    public GetWeatherForecastHandler(IWeatherService weatherService)
    {
        _weatherService = weatherService ?? throw new ArgumentNullException(nameof(weatherService));
    }

    /// <summary>
    /// Handles the weather forecast query
    /// </summary>
    /// <param name="query">The forecast query</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Weather forecast response wrapped in Result</returns>
    public async Task<Result<GetWeatherForecastResponse>> Handle(
        GetWeatherForecastQuery query,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var forecasts = await _weatherService.GetForecastAsync(query.Location, cancellationToken);
            var response = new GetWeatherForecastResponse(query.Location, forecasts);
            return Result.Success(response);
        }
        catch (ArgumentOutOfRangeException ex)
        {
            return Result.Failure<GetWeatherForecastResponse>(
                Error.Validation("Weather.InvalidCoordinates", ex.Message));
        }
        catch (ArgumentException ex)
        {
            return Result.Failure<GetWeatherForecastResponse>(
                Error.Validation("Weather.InvalidParameters", ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return Result.Failure<GetWeatherForecastResponse>(
                Error.Failure("Weather.ServiceError", ex.Message));
        }
        catch (Exception ex)
        {
            return Result.Failure<GetWeatherForecastResponse>(
                Error.Unexpected("Weather.UnexpectedError", $"An unexpected error occurred: {ex.Message}"));
        }
    }
}