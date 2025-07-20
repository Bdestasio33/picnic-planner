namespace PicnicPlanner.Api.Domain.Common;

/// <summary>
/// Represents the result of an operation that can either succeed or fail
/// </summary>
public class Result
{
    /// <summary>
    /// Indicates whether the operation was successful
    /// </summary>
    public bool IsSuccess { get; protected set; }

    /// <summary>
    /// Indicates whether the operation failed
    /// </summary>
    public bool IsFailure => !IsSuccess;

    /// <summary>
    /// Error information if the operation failed
    /// </summary>
    public Error Error { get; protected set; }

    /// <summary>
    /// Creates a successful result
    /// </summary>
    protected Result(bool isSuccess, Error error)
    {
        IsSuccess = isSuccess;
        Error = error;
    }

    /// <summary>
    /// Creates a successful result
    /// </summary>
    public static Result Success() => new(true, Error.None);

    /// <summary>
    /// Creates a failed result with an error
    /// </summary>
    public static Result Failure(Error error) => new(false, error);

    /// <summary>
    /// Creates a successful result with a value
    /// </summary>
    public static Result<TValue> Success<TValue>(TValue value) => new(value, true, Error.None);

    /// <summary>
    /// Creates a failed result with an error
    /// </summary>
    public static Result<TValue> Failure<TValue>(Error error) => new(default, false, error);

    /// <summary>
    /// Implicit conversion from Result to bool
    /// </summary>
    public static implicit operator bool(Result result) => result.IsSuccess;
}

/// <summary>
/// Represents the result of an operation that can either succeed with a value or fail
/// </summary>
public class Result<TValue> : Result
{
    /// <summary>
    /// The value if the operation was successful
    /// </summary>
    public TValue? ResultValue { get; private set; }

    /// <summary>
    /// Creates a result with a value
    /// </summary>
    internal Result(TValue? value, bool isSuccess, Error error) : base(isSuccess, error)
    {
        ResultValue = value;
    }

    /// <summary>
    /// Implicit conversion from TValue to Result<TValue>
    /// </summary>
    public static implicit operator Result<TValue>(TValue value) => Success(value);

    /// <summary>
    /// Implicit conversion from Error to Result<TValue>
    /// </summary>
    public static implicit operator Result<TValue>(Error error) => Failure<TValue>(error);
}

/// <summary>
/// Represents an error with a code and message
/// </summary>
public sealed record Error(string Code, string Message, ErrorType Type = ErrorType.Failure)
{
    /// <summary>
    /// Represents no error
    /// </summary>
    public static readonly Error None = new(string.Empty, string.Empty, ErrorType.None);

    /// <summary>
    /// Creates a validation error
    /// </summary>
    public static Error Validation(string code, string message) => new(code, message, ErrorType.Validation);

    /// <summary>
    /// Creates a not found error
    /// </summary>
    public static Error NotFound(string code, string message) => new(code, message, ErrorType.NotFound);

    /// <summary>
    /// Creates a conflict error
    /// </summary>
    public static Error Conflict(string code, string message) => new(code, message, ErrorType.Conflict);

    /// <summary>
    /// Creates a failure error
    /// </summary>
    public static Error Failure(string code, string message) => new(code, message, ErrorType.Failure);

    /// <summary>
    /// Creates an unexpected error
    /// </summary>
    public static Error Unexpected(string code, string message) => new(code, message, ErrorType.Unexpected);

    /// <summary>
    /// Implicit conversion from string to Error
    /// </summary>
    public static implicit operator Error(string message) => Failure("General.Failure", message);
}

/// <summary>
/// Represents different types of errors
/// </summary>
public enum ErrorType
{
    None,
    Validation,
    NotFound,
    Conflict,
    Failure,
    Unexpected
}