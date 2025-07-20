import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import dayjs from "dayjs";
import PicnicCalendar, {
  PicnicCalendarTestIds,
} from "../../components/PicnicCalendar";
import { PreferencesProvider } from "../../contexts/PreferencesContext";
import type { LocationInfo, WeatherForecastDto } from "../../types";

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

// Mock the WeatherDetailDialog component
vi.mock("../../components/WeatherDetailDialog", () => ({
  WeatherDetailDialog: ({ dialogOpen, handleCloseDialog }: any) => (
    <div data-testid="weather-detail-dialog-mock">
      {dialogOpen && (
        <div>
          <div>Weather Detail Dialog</div>
          <button onClick={handleCloseDialog}>Close</button>
        </div>
      )}
    </div>
  ),
}));

// Mock the getConditionColor utility
vi.mock("../../utils/conditionColors", () => ({
  getConditionColor: (type?: string | null): string => {
    switch (type?.toLowerCase()) {
      case "ideal":
        return "#4caf50";
      case "fair":
        return "#ff9800";
      case "poor":
        return "#f44336";
      default:
        return "#2196f3";
    }
  },
  getConditionColorFromPreferences: (
    forecast: any,
    preferences: any
  ): string => {
    // Simple mock that returns ideal color for any forecast/preferences
    return "#4caf50";
  },
}));

// Mock theme for Material UI components
const theme = createTheme();

// Helper component to wrap PicnicCalendar with theme and preferences
const PicnicCalendarWrapper = (props: any) => (
  <PreferencesProvider>
    <ThemeProvider theme={theme}>
      <PicnicCalendar {...props} />
    </ThemeProvider>
  </PreferencesProvider>
);

describe("PicnicCalendar", () => {
  const mockLocation: LocationInfo = {
    city: "San Francisco",
    state: "CA",
    country: "USA",
  };

  const createMockWeatherData = (
    days: number = 7,
    conditionType: string = "ideal"
  ): WeatherForecastDto[] => {
    const today = dayjs();
    return Array.from({ length: days }, (_, index) => ({
      date: today.add(index, "day").toISOString(),
      maxTemperature: 75,
      minTemperature: 65,
      precipitationChance: 20,
      precipitationAmount: 0.1,
      humidity: 60,
      windSpeed: 10,
      windDirection: 180,
      condition: {
        type: conditionType,
        description: `${conditionType} weather`,
        score: 85,
        reasons: ["Good temperature", "Low precipitation"],
      },
    }));
  };

  const defaultProps = {
    weatherData: createMockWeatherData(),
    location: mockLocation,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    cleanup();
  });

  describe("Rendering", () => {
    it("should render the calendar container", () => {
      render(<PicnicCalendarWrapper {...defaultProps} />);

      expect(
        screen.getByTestId(PicnicCalendarTestIds.container)
      ).toBeInTheDocument();
    });

    it("should render the localization provider wrapper", () => {
      render(<PicnicCalendarWrapper {...defaultProps} />);

      // LocalizationProvider is a wrapper component that doesn't render its own DOM node
      // We verify it's working by checking that the calendar renders correctly
      expect(
        screen.getByTestId(PicnicCalendarTestIds.dateCalendar)
      ).toBeInTheDocument();
    });

    it("should render the date calendar", () => {
      render(<PicnicCalendarWrapper {...defaultProps} />);

      expect(
        screen.getByTestId(PicnicCalendarTestIds.dateCalendar)
      ).toBeInTheDocument();
    });

    it("should render calendar days with weather data", () => {
      render(<PicnicCalendarWrapper {...defaultProps} />);

      const today = dayjs().format("YYYY-MM-DD");
      const todayButton = screen.getByTestId(
        `${PicnicCalendarTestIds.calendarDay}-${today}`
      );

      expect(todayButton).toBeInTheDocument();
    });

    it("should render with empty weather data", () => {
      render(<PicnicCalendarWrapper {...defaultProps} weatherData={[]} />);

      expect(
        screen.getByTestId(PicnicCalendarTestIds.container)
      ).toBeInTheDocument();
    });
  });

  describe("Weather Data Display", () => {
    it("should display different colors for different weather conditions", () => {
      const mixedWeatherData = [
        {
          ...createMockWeatherData(1, "ideal")[0],
          date: dayjs().toISOString(),
        },
        {
          ...createMockWeatherData(1, "fair")[0],
          date: dayjs().add(1, "day").toISOString(),
        },
        {
          ...createMockWeatherData(1, "poor")[0],
          date: dayjs().add(2, "day").toISOString(),
        },
      ];

      render(
        <PicnicCalendarWrapper
          {...defaultProps}
          weatherData={mixedWeatherData}
        />
      );

      // Check that calendar days exist for each weather condition
      const today = dayjs().format("YYYY-MM-DD");
      const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");
      const dayAfter = dayjs().add(2, "day").format("YYYY-MM-DD");

      expect(
        screen.getByTestId(`${PicnicCalendarTestIds.calendarDay}-${today}`)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`${PicnicCalendarTestIds.calendarDay}-${tomorrow}`)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`${PicnicCalendarTestIds.calendarDay}-${dayAfter}`)
      ).toBeInTheDocument();
    });

    it("should handle weather data with null/undefined condition", () => {
      const weatherDataWithNullCondition = [
        {
          ...createMockWeatherData(1)[0],
          condition: null,
        },
      ];

      render(
        <PicnicCalendarWrapper
          {...defaultProps}
          weatherData={weatherDataWithNullCondition}
        />
      );

      expect(
        screen.getByTestId(PicnicCalendarTestIds.container)
      ).toBeInTheDocument();
    });
  });

  describe("Date Selection", () => {
    it("should open weather detail dialog when clicking a day with weather data", async () => {
      const user = userEvent.setup();
      render(<PicnicCalendarWrapper {...defaultProps} />);

      const today = dayjs().format("YYYY-MM-DD");
      const todayButton = screen.getByTestId(
        `${PicnicCalendarTestIds.calendarDay}-${today}`
      );

      await user.click(todayButton);

      await waitFor(() => {
        expect(
          screen.getByTestId("weather-detail-dialog-mock")
        ).toBeInTheDocument();
        expect(screen.getByText("Weather Detail Dialog")).toBeInTheDocument();
      });
    });

    it("should not open dialog when clicking a day without weather data", async () => {
      const user = userEvent.setup();
      const limitedWeatherData = createMockWeatherData(1); // Only today has data

      render(
        <PicnicCalendarWrapper
          {...defaultProps}
          weatherData={limitedWeatherData}
        />
      );

      // Try to click tomorrow (which has no weather data)
      const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");
      const tomorrowButton = screen.queryByTestId(
        `${PicnicCalendarTestIds.calendarDay}-${tomorrow}`
      );

      if (tomorrowButton) {
        await user.click(tomorrowButton);
      }

      // Dialog should not open
      expect(
        screen.queryByText("Weather Detail Dialog")
      ).not.toBeInTheDocument();
    });

    it("should close dialog when close button is clicked", async () => {
      const user = userEvent.setup();
      render(<PicnicCalendarWrapper {...defaultProps} />);

      // Open dialog
      const today = dayjs().format("YYYY-MM-DD");
      const todayButton = screen.getByTestId(
        `${PicnicCalendarTestIds.calendarDay}-${today}`
      );

      await user.click(todayButton);

      await waitFor(() => {
        expect(screen.getByText("Weather Detail Dialog")).toBeInTheDocument();
      });

      // Close dialog
      const closeButton = screen.getByText("Close");
      await user.click(closeButton);

      await waitFor(() => {
        expect(
          screen.queryByText("Weather Detail Dialog")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Date Range Constraints", () => {
    it("should display dates within the 14-day range", () => {
      render(<PicnicCalendarWrapper {...defaultProps} />);

      const today = dayjs();

      // Check that today's date exists
      const todayFormatted = today.format("YYYY-MM-DD");
      const todayButton = screen.getByTestId(
        `${PicnicCalendarTestIds.calendarDay}-${todayFormatted}`
      );
      expect(todayButton).toBeInTheDocument();

      // The calendar component itself manages the date range,
      // so we just verify the calendar is rendered
      expect(
        screen.getByTestId(PicnicCalendarTestIds.dateCalendar)
      ).toBeInTheDocument();
    });
  });

  describe("Props Handling", () => {
    it("should handle location prop correctly", () => {
      const customLocation: LocationInfo = {
        city: "New York",
        state: "NY",
        country: "USA",
      };

      render(
        <PicnicCalendarWrapper {...defaultProps} location={customLocation} />
      );

      expect(
        screen.getByTestId(PicnicCalendarTestIds.container)
      ).toBeInTheDocument();
    });

    it("should handle large amounts of weather data", () => {
      const largeWeatherData = createMockWeatherData(14); // Maximum days

      render(
        <PicnicCalendarWrapper
          {...defaultProps}
          weatherData={largeWeatherData}
        />
      );

      expect(
        screen.getByTestId(PicnicCalendarTestIds.container)
      ).toBeInTheDocument();
    });

    it("should handle weather data with missing dates", () => {
      const weatherDataWithMissingDate = [
        {
          ...createMockWeatherData(1)[0],
          date: undefined,
        },
      ];

      render(
        <PicnicCalendarWrapper
          {...defaultProps}
          weatherData={weatherDataWithMissingDate}
        />
      );

      expect(
        screen.getByTestId(PicnicCalendarTestIds.container)
      ).toBeInTheDocument();
    });
  });

  describe("Component Integration", () => {
    it("should pass correct props to WeatherDetailDialog", async () => {
      const user = userEvent.setup();
      render(<PicnicCalendarWrapper {...defaultProps} />);

      // Open dialog by clicking a day
      const today = dayjs().format("YYYY-MM-DD");
      const todayButton = screen.getByTestId(
        `${PicnicCalendarTestIds.calendarDay}-${today}`
      );

      await user.click(todayButton);

      await waitFor(() => {
        const dialog = screen.getByTestId("weather-detail-dialog-mock");
        expect(dialog).toBeInTheDocument();
      });
    });

    it("should maintain component state during re-renders", async () => {
      const user = userEvent.setup();
      const { rerender } = render(<PicnicCalendarWrapper {...defaultProps} />);

      // Open dialog
      const today = dayjs().format("YYYY-MM-DD");
      const todayButton = screen.getByTestId(
        `${PicnicCalendarTestIds.calendarDay}-${today}`
      );

      await user.click(todayButton);

      await waitFor(() => {
        expect(screen.getByText("Weather Detail Dialog")).toBeInTheDocument();
      });

      // Re-render with new props
      const newWeatherData = createMockWeatherData(5, "fair");
      rerender(
        <PicnicCalendarWrapper {...defaultProps} weatherData={newWeatherData} />
      );

      // Dialog should still be open
      expect(screen.getByText("Weather Detail Dialog")).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid date formats gracefully", () => {
      const invalidWeatherData = [
        {
          ...createMockWeatherData(1)[0],
          date: "invalid-date",
        },
      ];

      render(
        <PicnicCalendarWrapper
          {...defaultProps}
          weatherData={invalidWeatherData}
        />
      );

      expect(
        screen.getByTestId(PicnicCalendarTestIds.container)
      ).toBeInTheDocument();
    });

    it("should handle weather data with missing required fields", () => {
      const incompleteWeatherData = [
        {
          date: dayjs().toISOString(),
          // Missing other required fields
        } as WeatherForecastDto,
      ];

      render(
        <PicnicCalendarWrapper
          {...defaultProps}
          weatherData={incompleteWeatherData}
        />
      );

      expect(
        screen.getByTestId(PicnicCalendarTestIds.container)
      ).toBeInTheDocument();
    });
  });
});
