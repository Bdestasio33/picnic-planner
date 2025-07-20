using Microsoft.AspNetCore.Mvc;
using MediatR;
using PicnicPlanner.Api.Domain.Common;
using PicnicPlanner.Api.Domain.ValueObjects;
using PicnicPlanner.Api.Application.Mappings;

namespace PicnicPlanner.Api.Presentation.Controllers;

/// <summary>
/// Base controller providing common functionality for all API controllers
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public abstract class BaseController : ControllerBase
{
    /// <summary>
    /// Common pattern for weather endpoints: resolve location, execute query, handle response
    /// </summary>
    protected async Task<IActionResult> ExecuteWeatherQueryAsync<TQuery, TResponse, TDto>(
        string city,
        string? state,
        string? country,
        Func<Location, TQuery> createQuery,
        Func<TResponse, TDto> mapToDto,
        IMediator mediator,
        CancellationToken cancellationToken = default)
        where TQuery : IRequest<Result<TResponse>>
    {
        var locationResult = await WeatherRequestMapping.ResolveLocationAsync(
            city, state, country, mediator, cancellationToken);

        if (!locationResult.IsSuccess)
            return HandleFailure(locationResult);

        var query = createQuery(locationResult.ResultValue!);
        var response = await mediator.Send(query, cancellationToken);

        if (!response.IsSuccess)
            return HandleFailure(response);

        var dto = mapToDto(response.ResultValue!);
        return Ok(dto);
    }

    /// <summary>
    /// Validates date format and returns parsed date
    /// </summary>
    protected IActionResult? ValidateAndParseDate(string dateString, out DateOnly parsedDate)
    {
        if (!DateOnly.TryParse(dateString, out parsedDate))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid date format",
                Detail = "Date must be in ISO format (yyyy-MM-dd)",
                Status = StatusCodes.Status400BadRequest
            });
        }
        return null;
    }

    /// <summary>
    /// Handles failures by converting them to appropriate HTTP responses
    /// </summary>
    /// <param name="result">The failed result</param>
    /// <returns>HTTP response based on error type</returns>
    protected IActionResult HandleFailure(Result result)
    {
        var problemDetails = new ProblemDetails
        {
            Title = GetTitle(result.Error.Type),
            Detail = result.Error.Message,
            Status = GetStatusCode(result.Error.Type)
        };

        problemDetails.Extensions.Add("errorCode", result.Error.Code);

        return result.Error.Type switch
        {
            ErrorType.Validation => BadRequest(problemDetails),
            ErrorType.NotFound => NotFound(problemDetails),
            ErrorType.Conflict => Conflict(problemDetails),
            ErrorType.Unexpected => StatusCode(StatusCodes.Status500InternalServerError, problemDetails),
            _ => StatusCode(StatusCodes.Status500InternalServerError, problemDetails)
        };
    }

    /// <summary>
    /// Gets the appropriate HTTP status code for the error type
    /// </summary>
    private static int GetStatusCode(ErrorType errorType) => errorType switch
    {
        ErrorType.Validation => StatusCodes.Status400BadRequest,
        ErrorType.NotFound => StatusCodes.Status404NotFound,
        ErrorType.Conflict => StatusCodes.Status409Conflict,
        ErrorType.Unexpected => StatusCodes.Status500InternalServerError,
        _ => StatusCodes.Status500InternalServerError
    };

    /// <summary>
    /// Gets the appropriate title for the error type
    /// </summary>
    private static string GetTitle(ErrorType errorType) => errorType switch
    {
        ErrorType.Validation => "Validation Error",
        ErrorType.NotFound => "Not Found",
        ErrorType.Conflict => "Conflict",
        ErrorType.Unexpected => "Unexpected Error",
        _ => "Server Error"
    };
}