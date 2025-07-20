namespace PicnicPlanner.Api.Domain.ValueObjects;

/// <summary>
/// Represents a US State as a domain value object with validation and mapping capabilities
/// </summary>
public record UsState
{
    /// <summary>
    /// The two-letter state abbreviation (e.g., "CA", "NY")
    /// </summary>
    public string Abbreviation { get; init; }

    /// <summary>
    /// The full state name (e.g., "California", "New York")
    /// </summary>
    public string FullName { get; init; }

    /// <summary>
    /// Private mapping of state abbreviations to full names
    /// </summary>
    private static readonly Dictionary<string, string> StateMapping = new()
    {
        ["AL"] = "Alabama",
        ["AK"] = "Alaska",
        ["AZ"] = "Arizona",
        ["AR"] = "Arkansas",
        ["CA"] = "California",
        ["CO"] = "Colorado",
        ["CT"] = "Connecticut",
        ["DE"] = "Delaware",
        ["FL"] = "Florida",
        ["GA"] = "Georgia",
        ["HI"] = "Hawaii",
        ["ID"] = "Idaho",
        ["IL"] = "Illinois",
        ["IN"] = "Indiana",
        ["IA"] = "Iowa",
        ["KS"] = "Kansas",
        ["KY"] = "Kentucky",
        ["LA"] = "Louisiana",
        ["ME"] = "Maine",
        ["MD"] = "Maryland",
        ["MA"] = "Massachusetts",
        ["MI"] = "Michigan",
        ["MN"] = "Minnesota",
        ["MS"] = "Mississippi",
        ["MO"] = "Missouri",
        ["MT"] = "Montana",
        ["NE"] = "Nebraska",
        ["NV"] = "Nevada",
        ["NH"] = "New Hampshire",
        ["NJ"] = "New Jersey",
        ["NM"] = "New Mexico",
        ["NY"] = "New York",
        ["NC"] = "North Carolina",
        ["ND"] = "North Dakota",
        ["OH"] = "Ohio",
        ["OK"] = "Oklahoma",
        ["OR"] = "Oregon",
        ["PA"] = "Pennsylvania",
        ["RI"] = "Rhode Island",
        ["SC"] = "South Carolina",
        ["SD"] = "South Dakota",
        ["TN"] = "Tennessee",
        ["TX"] = "Texas",
        ["UT"] = "Utah",
        ["VT"] = "Vermont",
        ["VA"] = "Virginia",
        ["WA"] = "Washington",
        ["WV"] = "West Virginia",
        ["WI"] = "Wisconsin",
        ["WY"] = "Wyoming",
        ["DC"] = "District of Columbia"
    };

    /// <summary>
    /// Private constructor for creating valid US states
    /// </summary>
    private UsState(string abbreviation, string fullName)
    {
        Abbreviation = abbreviation;
        FullName = fullName;
    }

    /// <summary>
    /// Creates a UsState from a state abbreviation
    /// </summary>
    /// <param name="abbreviation">Two-letter state abbreviation</param>
    /// <returns>UsState instance if valid, null if invalid</returns>
    public static UsState? FromAbbreviation(string abbreviation)
    {
        if (string.IsNullOrWhiteSpace(abbreviation))
            return null;

        var upperAbbr = abbreviation.Trim().ToUpperInvariant();

        return StateMapping.TryGetValue(upperAbbr, out var fullName)
            ? new UsState(upperAbbr, fullName)
            : null;
    }

    /// <summary>
    /// Creates a UsState from a full state name
    /// </summary>
    /// <param name="fullName">Full state name</param>
    /// <returns>UsState instance if valid, null if invalid</returns>
    public static UsState? FromFullName(string fullName)
    {
        if (string.IsNullOrWhiteSpace(fullName))
            return null;

        var normalizedName = fullName.Trim();
        var kvp = StateMapping.FirstOrDefault(x =>
            string.Equals(x.Value, normalizedName, StringComparison.OrdinalIgnoreCase));

        return kvp.Key != null
            ? new UsState(kvp.Key, kvp.Value)
            : null;
    }

    /// <summary>
    /// Validates if a string is a valid US state abbreviation
    /// </summary>
    /// <param name="abbreviation">The abbreviation to validate</param>
    /// <returns>True if valid, false otherwise</returns>
    public static bool IsValidAbbreviation(string abbreviation)
    {
        if (string.IsNullOrWhiteSpace(abbreviation))
            return false;

        return StateMapping.ContainsKey(abbreviation.Trim().ToUpperInvariant());
    }

    /// <summary>
    /// Gets all valid US state abbreviations
    /// </summary>
    /// <returns>Collection of all valid state abbreviations</returns>
    public static IEnumerable<string> GetAllAbbreviations()
    {
        return StateMapping.Keys;
    }

    /// <summary>
    /// Gets all US states as value objects
    /// </summary>
    /// <returns>Collection of all US states</returns>
    public static IEnumerable<UsState> GetAllStates()
    {
        return StateMapping.Select(kvp => new UsState(kvp.Key, kvp.Value));
    }

    /// <summary>
    /// Returns the full name for display purposes
    /// </summary>
    public override string ToString()
    {
        return FullName;
    }
}