using MediatR;
using PicnicPlanner.Api.Application.Queries;
using PicnicPlanner.Api.Domain.Common;
using PicnicPlanner.Api.Domain.Interfaces;
using PicnicPlanner.Api.Presentation.Responses;

namespace PicnicPlanner.Api.Application.Handlers;

/// <summary>
/// Handler for historical weather queries
/// </summary>
public class GetHistoricalWeatherHandler : IRequestHandler<GetHistoricalWeatherQuery, Result<GetHistoricalWeatherResponse>>
{
    private readonly IWeatherService _weatherService;

    /// <summary>
    /// Initializes a new historical weather handler
    /// </summary>
    /// <param name="weatherService">The weather service dependency</param>
    public GetHistoricalWeatherHandler(IWeatherService weatherService)
    {
        _weatherService = weatherService ?? throw new ArgumentNullException(nameof(weatherService));
    }

    /// <summary>
    /// Handles the historical weather query
    /// </summary>
    /// <param name="query">The historical weather query</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Historical weather response wrapped in Result</returns>
    public async Task<Result<GetHistoricalWeatherResponse>> Handle(
        GetHistoricalWeatherQuery query,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var historicalData = await _weatherService.GetHistoricalDataAsync(
                query.Location,
                query.Date,
                query.YearsBack,
                cancellationToken);

            var response = new GetHistoricalWeatherResponse(query.Location, query.Date, historicalData);
            return Result.Success(response);
        }
        catch (ArgumentOutOfRangeException ex)
        {
            return Result.Failure<GetHistoricalWeatherResponse>(
                Error.Validation("Weather.InvalidCoordinates", ex.Message));
        }
        catch (ArgumentException ex)
        {
            return Result.Failure<GetHistoricalWeatherResponse>(
                Error.Validation("Weather.InvalidParameters", ex.Message));
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("No historical weather data available"))
        {
            return Result.Failure<GetHistoricalWeatherResponse>(
                Error.NotFound("Weather.HistoricalDataNotFound", ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return Result.Failure<GetHistoricalWeatherResponse>(
                Error.Failure("Weather.ServiceError", ex.Message));
        }
        catch (Exception ex)
        {
            return Result.Failure<GetHistoricalWeatherResponse>(
                Error.Unexpected("Weather.UnexpectedError", $"An unexpected error occurred: {ex.Message}"));
        }
    }
}