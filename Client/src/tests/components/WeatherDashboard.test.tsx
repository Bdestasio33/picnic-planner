import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import WeatherDashboard, {
  WeatherDashboardTestIds,
} from "../../components/WeatherDashboard";
import { PreferencesProvider } from "../../contexts/PreferencesContext";
import type { WeatherForecastResponseDto } from "../../types";

// Mock localStorage for PreferencesProvider
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

// Mock the weather API hook
vi.mock("../../hooks/weather/weather");

import { useGetApiWeatherForecast } from "../../hooks/weather/weather";
const mockUseGetApiWeatherForecast = vi.mocked(useGetApiWeatherForecast) as any;

// Mock the PicnicCalendar component
vi.mock("../../components/PicnicCalendar", () => ({
  default: ({ location }: any) => (
    <div data-testid="picnic-calendar">
      Picnic Calendar for {location?.city || "Unknown Location"}
    </div>
  ),
}));

// Mock the CitySelectionDialog component
vi.mock("../../components/CitySelectionDialog", () => ({
  default: ({ open, onClose, onSave }: any) =>
    open ? (
      <div role="dialog" data-testid="city-selection-dialog">
        <button
          onClick={() =>
            onSave({ city: "Los Angeles", state: "CA", country: "USA" })
          }
        >
          Save Location
        </button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

// Mock theme for Material UI components
const theme = createTheme();

// Helper component to wrap WeatherDashboard with theme and preferences
const WeatherDashboardWrapper = () => (
  <PreferencesProvider>
    <ThemeProvider theme={theme}>
      <WeatherDashboard />
    </ThemeProvider>
  </PreferencesProvider>
);

describe("WeatherDashboard", () => {
  const mockWeatherData: WeatherForecastResponseDto = {
    location: {
      name: "New York, NY, USA",
      latitude: 40.7128,
      longitude: -74.006,
    },
    forecasts: [
      {
        date: "2024-01-01T00:00:00Z",
        maxTemperature: 75,
        minTemperature: 65,
        precipitationChance: 20,
        precipitationAmount: 0.1,
        humidity: 60,
        windSpeed: 10,
        windDirection: 180,
        condition: {
          type: "ideal",
          description: "Perfect weather",
          score: 95,
          reasons: ["Great temperature", "Low precipitation"],
        },
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    cleanup();
  });

  it("shows loading state", () => {
    mockUseGetApiWeatherForecast.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    } as any);

    render(<WeatherDashboardWrapper />);
    expect(
      screen.getByTestId(WeatherDashboardTestIds.loadingText)
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(WeatherDashboardTestIds.loadingSkeleton)
    ).toBeInTheDocument();
  });

  it("shows error state with button", () => {
    mockUseGetApiWeatherForecast.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error("Failed to fetch"),
    } as any);

    render(<WeatherDashboardWrapper />);

    expect(
      screen.getByTestId(WeatherDashboardTestIds.errorTitle)
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(WeatherDashboardTestIds.errorMessage)
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(WeatherDashboardTestIds.tryDifferentLocationButton)
    ).toBeInTheDocument();
  });

  it("shows weather dashboard with location and calendar", () => {
    mockUseGetApiWeatherForecast.mockReturnValue({
      data: mockWeatherData,
      isLoading: false,
      error: null,
    } as any);

    render(<WeatherDashboardWrapper />);

    expect(
      screen.getByTestId(WeatherDashboardTestIds.locationName)
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(WeatherDashboardTestIds.changeLocationButton)
    ).toBeInTheDocument();
    expect(screen.getByTestId("picnic-calendar")).toBeInTheDocument();
    expect(
      screen.getByTestId(WeatherDashboardTestIds.detailsTitle)
    ).toBeInTheDocument();
  });

  it("opens and closes location dialog", async () => {
    const user = userEvent.setup();
    mockUseGetApiWeatherForecast.mockReturnValue({
      data: mockWeatherData,
      isLoading: false,
      error: null,
    } as any);

    render(<WeatherDashboardWrapper />);

    // Dialog initially closed
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Open dialog
    await user.click(
      screen.getByTestId(WeatherDashboardTestIds.changeLocationButton)
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Close dialog
    await user.click(screen.getByText("Close"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("updates location when saving from dialog", async () => {
    const user = userEvent.setup();
    mockUseGetApiWeatherForecast.mockReturnValue({
      data: mockWeatherData,
      isLoading: false,
      error: null,
    } as any);

    render(<WeatherDashboardWrapper />);

    // Open dialog and save new location
    await user.click(
      screen.getByTestId(WeatherDashboardTestIds.changeLocationButton)
    );
    await user.click(screen.getByText("Save Location"));

    // Verify API was called with new location
    expect(mockUseGetApiWeatherForecast).toHaveBeenCalledWith({
      City: "Los Angeles",
      State: "CA",
      Country: "USA",
    });
  });

  it("handles missing location data", () => {
    mockUseGetApiWeatherForecast.mockReturnValue({
      data: { location: null, forecasts: [] },
      isLoading: false,
      error: null,
    } as any);

    render(<WeatherDashboardWrapper />);
    expect(
      screen.getByTestId(WeatherDashboardTestIds.noLocationDataText)
    ).toBeInTheDocument();
  });
});
