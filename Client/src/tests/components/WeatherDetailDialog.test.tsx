import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import {
  WeatherDetailDialog,
  WeatherDetailDialogTestIds,
} from "../../components/WeatherDetailDialog";
import type { LocationInfo, WeatherForecastDto } from "../../types";
import { TEMPERATURE_UNIT } from "../../types";

// Mock the PicnicSuitabilityIndicator component
vi.mock("../../components/PicnicSuitabilityIndicator", () => ({
  default: ({ condition, showDetails }: any) => (
    <div data-testid="picnic-suitability-indicator">
      Suitability: {condition.type} (Score: {condition.score})
      {showDetails && <div>Details shown</div>}
    </div>
  ),
}));

// Mock the HistoricalWeatherTable component
vi.mock("../../components/HistoricalWeatherTable", () => ({
  default: ({ location, date, temperatureUnit, yearsBack }: any) => (
    <div data-testid="historical-weather-table">
      Historical data for {location.city} on {date} in {temperatureUnit} (
      {yearsBack} years)
    </div>
  ),
}));

// Mock theme for Material UI components
const theme = createTheme();

// Helper component to wrap with providers
const WeatherDetailDialogWrapper = (props: any) => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <WeatherDetailDialog {...props} />
    </LocalizationProvider>
  </ThemeProvider>
);

describe("WeatherDetailDialog", () => {
  const mockLocation: LocationInfo = {
    city: "New York",
    state: "NY",
    country: "USA",
  };

  const mockForecast: WeatherForecastDto = {
    date: "2024-01-15T00:00:00Z",
    maxTemperature: 22,
    minTemperature: 15,
    precipitationChance: 30,
    precipitationAmount: 0.5,
    humidity: 65,
    windSpeed: 12,
    windDirection: 180,
    condition: {
      type: "good",
      description: "Good weather for picnic",
      score: 85,
      reasons: ["Moderate temperature", "Low precipitation chance"],
    },
  };

  const mockSelectedDate = dayjs("2024-01-15");

  const defaultProps = {
    dialogOpen: true,
    handleCloseDialog: vi.fn(),
    isMobile: false,
    selectedDate: mockSelectedDate,
    selectedForecast: mockForecast,
    location: mockLocation,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders dialog when open", () => {
    render(<WeatherDetailDialogWrapper {...defaultProps} />);

    expect(
      screen.getByTestId(WeatherDetailDialogTestIds.dialog)
    ).toBeInTheDocument();
    expect(screen.getByText("Monday, January 15, 2024")).toBeInTheDocument();
  });

  it("does not render dialog when closed", () => {
    render(<WeatherDetailDialogWrapper {...defaultProps} dialogOpen={false} />);

    expect(
      screen.queryByTestId(WeatherDetailDialogTestIds.dialog)
    ).not.toBeInTheDocument();
  });

  it("displays weather data correctly", () => {
    render(<WeatherDetailDialogWrapper {...defaultProps} />);

    expect(screen.getByText("Weather Details")).toBeInTheDocument();
    expect(screen.getByText("Temperature")).toBeInTheDocument();
    expect(screen.getByText("30%")).toBeInTheDocument(); // precipitation
    expect(screen.getByText("12 km/h")).toBeInTheDocument(); // wind speed
    expect(screen.getByText("65%")).toBeInTheDocument(); // humidity
  });

  it("toggles temperature units", async () => {
    const user = userEvent.setup();
    render(<WeatherDetailDialogWrapper {...defaultProps} />);

    // Should start with Celsius
    expect(
      screen.getByTestId(WeatherDetailDialogTestIds.celsiusButton)
    ).toHaveAttribute("aria-pressed", "true");

    // Click Fahrenheit
    await user.click(
      screen.getByTestId(WeatherDetailDialogTestIds.fahrenheitButton)
    );

    expect(
      screen.getByTestId(WeatherDetailDialogTestIds.fahrenheitButton)
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("shows picnic suitability indicator", () => {
    render(<WeatherDetailDialogWrapper {...defaultProps} />);

    expect(screen.getByText("Picnic Suitability")).toBeInTheDocument();
    expect(
      screen.getByTestId("picnic-suitability-indicator")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Suitability: good (Score: 85)")
    ).toBeInTheDocument();
  });

  it("shows historical weather data", () => {
    render(<WeatherDetailDialogWrapper {...defaultProps} />);

    expect(screen.getByText("Historical Weather Data")).toBeInTheDocument();
    expect(screen.getByTestId("historical-weather-table")).toBeInTheDocument();
    expect(
      screen.getByText(/Historical data for New York/)
    ).toBeInTheDocument();
  });

  it("calls close handler when header close button is clicked", async () => {
    const user = userEvent.setup();
    const mockClose = vi.fn();

    render(
      <WeatherDetailDialogWrapper
        {...defaultProps}
        handleCloseDialog={mockClose}
      />
    );

    await user.click(
      screen.getByTestId(WeatherDetailDialogTestIds.closeButton)
    );
    expect(mockClose).toHaveBeenCalledOnce();
  });

  it("calls close handler when action close button is clicked", async () => {
    const user = userEvent.setup();
    const mockClose = vi.fn();

    render(
      <WeatherDetailDialogWrapper
        {...defaultProps}
        handleCloseDialog={mockClose}
      />
    );

    await user.click(
      screen.getByTestId(WeatherDetailDialogTestIds.closeActionButton)
    );
    expect(mockClose).toHaveBeenCalledOnce();
  });

  it("handles mobile view correctly", () => {
    render(<WeatherDetailDialogWrapper {...defaultProps} isMobile={true} />);

    const dialog = screen.getByTestId(WeatherDetailDialogTestIds.dialog);
    expect(dialog).toBeInTheDocument();
    // Dialog should be fullscreen on mobile
  });

  it("handles missing forecast data gracefully", () => {
    render(
      <WeatherDetailDialogWrapper {...defaultProps} selectedForecast={null} />
    );

    expect(
      screen.getByTestId(WeatherDetailDialogTestIds.dialog)
    ).toBeInTheDocument();
    expect(screen.getByText("Monday, January 15, 2024")).toBeInTheDocument();
    // Should not crash when forecast is null
  });

  it("displays correct date format", () => {
    const customDate = dayjs("2024-12-25");

    render(
      <WeatherDetailDialogWrapper {...defaultProps} selectedDate={customDate} />
    );

    expect(
      screen.getByText("Wednesday, December 25, 2024")
    ).toBeInTheDocument();
  });

  it("handles zero values in weather data", () => {
    const forecastWithZeros = {
      ...mockForecast,
      precipitationChance: 0,
      humidity: 0,
      windSpeed: 0,
    };

    render(
      <WeatherDetailDialogWrapper
        {...defaultProps}
        selectedForecast={forecastWithZeros}
      />
    );

    // Check for zero values in specific containers
    const precipitationItem = screen.getByTestId(
      WeatherDetailDialogTestIds.precipitationItem
    );
    const humidityItem = screen.getByTestId(
      WeatherDetailDialogTestIds.humidityItem
    );
    const windSpeedItem = screen.getByTestId(
      WeatherDetailDialogTestIds.windSpeedItem
    );

    expect(precipitationItem).toHaveTextContent("0%");
    expect(humidityItem).toHaveTextContent("0%");
    expect(windSpeedItem).toHaveTextContent("0 km/h");
  });

  it("passes correct props to historical weather table", () => {
    render(<WeatherDetailDialogWrapper {...defaultProps} />);

    const historicalTable = screen.getByTestId("historical-weather-table");
    expect(historicalTable).toHaveTextContent(
      "Historical data for New York on 2024-01-15T00:00:00Z in celsius (10 years)"
    );
  });
});
