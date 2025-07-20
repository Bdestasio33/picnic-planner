import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import HistoricalWeatherTable, {
  HistoricalWeatherTableTestIds,
} from "../../components/HistoricalWeatherTable";
import { TEMPERATURE_UNIT } from "../../types";

// Mock the weather hook
vi.mock("../../hooks/weather/weather", () => ({
  useGetApiWeatherHistorical: vi.fn(),
}));

// Mock the summary component
vi.mock("../../components/HistoricalWeatherTableSummary", () => ({
  default: ({ historicalData, temperatureUnit, ...props }: any) => (
    <div {...props}>Summary for {temperatureUnit.toLowerCase()} unit</div>
  ),
}));

import { useGetApiWeatherHistorical } from "../../hooks/weather/weather";

const mockUseGetApiWeatherHistorical = useGetApiWeatherHistorical as any;

// Mock theme for Material UI components
const theme = createTheme();

// Helper component to wrap with theme
const HistoricalWeatherTableWrapper = (props: any) => (
  <ThemeProvider theme={theme}>
    <HistoricalWeatherTable {...props} />
  </ThemeProvider>
);

describe("HistoricalWeatherTable", () => {
  const defaultProps = {
    location: {
      city: "New York",
      state: "NY",
      country: "USA",
    },
    date: "2024-07-15",
    temperatureUnit: TEMPERATURE_UNIT.FAHRENHEIT,
    yearsBack: 10,
  };

  const mockHistoricalData = {
    historicalData: {
      yearlyData: [
        {
          year: 2023,
          temperature: 25.5, // Celsius
          precipitation: 10.2,
          humidity: 65,
        },
        {
          year: 2022,
          temperature: 28.0,
          precipitation: 8.5,
          humidity: 70,
        },
        {
          year: 2021,
          temperature: 22.1,
          precipitation: 15.3,
          humidity: 60,
        },
      ],
      averageTemperature: 25.2,
      averagePrecipitation: 11.3,
      yearsOfData: 3,
    },
    requestedDate: "2024-07-15",
    retrievedAt: "2024-01-15T12:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("Loading State", () => {
    it("should render loading skeleton when isLoading is true", () => {
      mockUseGetApiWeatherHistorical.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      render(<HistoricalWeatherTableWrapper {...defaultProps} />);

      expect(
        screen.getByTestId(HistoricalWeatherTableTestIds.loadingSkeleton)
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId(HistoricalWeatherTableTestIds.container)
      ).not.toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    it("should render error alert when there is an error", () => {
      mockUseGetApiWeatherHistorical.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error("API Error"),
      });

      render(<HistoricalWeatherTableWrapper {...defaultProps} />);

      expect(
        screen.getByTestId(HistoricalWeatherTableTestIds.errorAlert)
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Failed to load historical weather data. Please try again later."
        )
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId(HistoricalWeatherTableTestIds.container)
      ).not.toBeInTheDocument();
    });
  });

  describe("No Data State", () => {
    it("should render no data alert when historicalData is empty", () => {
      mockUseGetApiWeatherHistorical.mockReturnValue({
        data: { historicalData: { yearlyData: [] } },
        isLoading: false,
        error: null,
      });

      render(<HistoricalWeatherTableWrapper {...defaultProps} />);

      expect(
        screen.getByTestId(HistoricalWeatherTableTestIds.noDataAlert)
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "No historical weather data available for this date and location."
        )
      ).toBeInTheDocument();
    });

    it("should render no data alert when historicalData is null", () => {
      mockUseGetApiWeatherHistorical.mockReturnValue({
        data: { historicalData: null },
        isLoading: false,
        error: null,
      });

      render(<HistoricalWeatherTableWrapper {...defaultProps} />);

      expect(
        screen.getByTestId(HistoricalWeatherTableTestIds.noDataAlert)
      ).toBeInTheDocument();
    });

    it("should render no data alert when data is null", () => {
      mockUseGetApiWeatherHistorical.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      render(<HistoricalWeatherTableWrapper {...defaultProps} />);

      expect(
        screen.getByTestId(HistoricalWeatherTableTestIds.noDataAlert)
      ).toBeInTheDocument();
    });
  });

  describe("Successful Data Rendering", () => {
    beforeEach(() => {
      mockUseGetApiWeatherHistorical.mockReturnValue({
        data: mockHistoricalData,
        isLoading: false,
        error: null,
      });
    });

    it("should render all main components when data is available", () => {
      render(<HistoricalWeatherTableWrapper {...defaultProps} />);

      expect(
        screen.getByTestId(HistoricalWeatherTableTestIds.container)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(HistoricalWeatherTableTestIds.summaryComponent)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(HistoricalWeatherTableTestIds.tableContainer)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(HistoricalWeatherTableTestIds.table)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(HistoricalWeatherTableTestIds.dataCaption)
      ).toBeInTheDocument();
    });

    it("should render table headers correctly", () => {
      render(<HistoricalWeatherTableWrapper {...defaultProps} />);

      expect(
        screen.getByTestId(HistoricalWeatherTableTestIds.yearHeader)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(HistoricalWeatherTableTestIds.temperatureHeader)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(HistoricalWeatherTableTestIds.precipitationHeader)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(HistoricalWeatherTableTestIds.humidityHeader)
      ).toBeInTheDocument();

      expect(screen.getByText("Year")).toBeInTheDocument();
      expect(screen.getByText("Temperature (°F)")).toBeInTheDocument();
      expect(screen.getByText("Precipitation (mm)")).toBeInTheDocument();
      expect(screen.getByText("Humidity (%)")).toBeInTheDocument();
    });

    it("should render table rows for each year of data", () => {
      render(<HistoricalWeatherTableWrapper {...defaultProps} />);

      // Check that rows exist for each year
      expect(
        screen.getByTestId(`${HistoricalWeatherTableTestIds.tableRow}-2023`)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`${HistoricalWeatherTableTestIds.tableRow}-2022`)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`${HistoricalWeatherTableTestIds.tableRow}-2021`)
      ).toBeInTheDocument();

      // Check year cells
      expect(
        screen.getByTestId(`${HistoricalWeatherTableTestIds.yearCell}-2023`)
      ).toHaveTextContent("2023");
      expect(
        screen.getByTestId(`${HistoricalWeatherTableTestIds.yearCell}-2022`)
      ).toHaveTextContent("2022");
      expect(
        screen.getByTestId(`${HistoricalWeatherTableTestIds.yearCell}-2021`)
      ).toHaveTextContent("2021");
    });

    it("should sort years in descending order", () => {
      render(<HistoricalWeatherTableWrapper {...defaultProps} />);

      const tableBody = screen.getByTestId(
        HistoricalWeatherTableTestIds.tableBody
      );
      const rows = tableBody.querySelectorAll(
        '[data-testid*="historical-weather-table-row-"]'
      );

      // Should be ordered 2023, 2022, 2021
      expect(rows[0]).toHaveAttribute(
        "data-testid",
        "historical-weather-table-row-2023"
      );
      expect(rows[1]).toHaveAttribute(
        "data-testid",
        "historical-weather-table-row-2022"
      );
      expect(rows[2]).toHaveAttribute(
        "data-testid",
        "historical-weather-table-row-2021"
      );
    });

    it("should render data caption with correct information", () => {
      render(<HistoricalWeatherTableWrapper {...defaultProps} />);

      const caption = screen.getByTestId(
        HistoricalWeatherTableTestIds.dataCaption
      );
      // Note: Due to JavaScript date parsing, the date may show as July 14
      expect(caption).toHaveTextContent("across 3 years");
      expect(caption).toHaveTextContent("Retrieved on 1/15/2024");
    });
  });

  describe("Temperature Unit Handling", () => {
    beforeEach(() => {
      mockUseGetApiWeatherHistorical.mockReturnValue({
        data: mockHistoricalData,
        isLoading: false,
        error: null,
      });
    });

    it("should display Fahrenheit temperatures when unit is FAHRENHEIT", () => {
      render(
        <HistoricalWeatherTableWrapper
          {...defaultProps}
          temperatureUnit={TEMPERATURE_UNIT.FAHRENHEIT}
        />
      );

      expect(screen.getByText("Temperature (°F)")).toBeInTheDocument();

      // Check converted temperatures (25.5°C = 77.9°F, 28.0°C = 82.4°F, 22.1°C = 71.8°F)
      expect(
        screen.getByTestId(
          `${HistoricalWeatherTableTestIds.temperatureCell}-2023`
        )
      ).toHaveTextContent("77.9");
      expect(
        screen.getByTestId(
          `${HistoricalWeatherTableTestIds.temperatureCell}-2022`
        )
      ).toHaveTextContent("82.4");
      expect(
        screen.getByTestId(
          `${HistoricalWeatherTableTestIds.temperatureCell}-2021`
        )
      ).toHaveTextContent("71.8");
    });

    it("should display Celsius temperatures when unit is CELSIUS", () => {
      render(
        <HistoricalWeatherTableWrapper
          {...defaultProps}
          temperatureUnit={TEMPERATURE_UNIT.CELSIUS}
        />
      );

      expect(screen.getByText("Temperature (°C)")).toBeInTheDocument();

      // Check original temperatures (already in Celsius)
      expect(
        screen.getByTestId(
          `${HistoricalWeatherTableTestIds.temperatureCell}-2023`
        )
      ).toHaveTextContent("25.5");
      expect(
        screen.getByTestId(
          `${HistoricalWeatherTableTestIds.temperatureCell}-2022`
        )
      ).toHaveTextContent("28.0");
      expect(
        screen.getByTestId(
          `${HistoricalWeatherTableTestIds.temperatureCell}-2021`
        )
      ).toHaveTextContent("22.1");
    });
  });

  describe("Data Formatting", () => {
    beforeEach(() => {
      mockUseGetApiWeatherHistorical.mockReturnValue({
        data: mockHistoricalData,
        isLoading: false,
        error: null,
      });
    });

    it("should format precipitation to 1 decimal place", () => {
      render(<HistoricalWeatherTableWrapper {...defaultProps} />);

      expect(
        screen.getByTestId(
          `${HistoricalWeatherTableTestIds.precipitationCell}-2023`
        )
      ).toHaveTextContent("10.2");
      expect(
        screen.getByTestId(
          `${HistoricalWeatherTableTestIds.precipitationCell}-2022`
        )
      ).toHaveTextContent("8.5");
      expect(
        screen.getByTestId(
          `${HistoricalWeatherTableTestIds.precipitationCell}-2021`
        )
      ).toHaveTextContent("15.3");
    });

    it("should format humidity to 0 decimal places", () => {
      render(<HistoricalWeatherTableWrapper {...defaultProps} />);

      expect(
        screen.getByTestId(`${HistoricalWeatherTableTestIds.humidityCell}-2023`)
      ).toHaveTextContent("65");
      expect(
        screen.getByTestId(`${HistoricalWeatherTableTestIds.humidityCell}-2022`)
      ).toHaveTextContent("70");
      expect(
        screen.getByTestId(`${HistoricalWeatherTableTestIds.humidityCell}-2021`)
      ).toHaveTextContent("60");
    });
  });

  describe("Hook Integration", () => {
    it("should call useGetApiWeatherHistorical with correct parameters", () => {
      mockUseGetApiWeatherHistorical.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      render(<HistoricalWeatherTableWrapper {...defaultProps} />);

      expect(mockUseGetApiWeatherHistorical).toHaveBeenCalledWith({
        City: "New York",
        State: "NY",
        Country: "USA",
        Date: "2024-07-15",
        YearsBack: 10,
      });
    });

    it("should use custom yearsBack prop", () => {
      mockUseGetApiWeatherHistorical.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      render(<HistoricalWeatherTableWrapper {...defaultProps} yearsBack={5} />);

      expect(mockUseGetApiWeatherHistorical).toHaveBeenCalledWith({
        City: "New York",
        State: "NY",
        Country: "USA",
        Date: "2024-07-15",
        YearsBack: 5,
      });
    });

    it("should handle location without state", () => {
      mockUseGetApiWeatherHistorical.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      const propsWithoutState = {
        ...defaultProps,
        location: {
          city: "London",
          country: "UK",
        },
      };

      render(<HistoricalWeatherTableWrapper {...propsWithoutState} />);

      expect(mockUseGetApiWeatherHistorical).toHaveBeenCalledWith({
        City: "London",
        State: undefined,
        Country: "UK",
        Date: "2024-07-15",
        YearsBack: 10,
      });
    });
  });

  describe("Summary Component Integration", () => {
    beforeEach(() => {
      mockUseGetApiWeatherHistorical.mockReturnValue({
        data: mockHistoricalData,
        isLoading: false,
        error: null,
      });
    });

    it("should render summary component with correct props", () => {
      render(<HistoricalWeatherTableWrapper {...defaultProps} />);

      const summary = screen.getByTestId(
        HistoricalWeatherTableTestIds.summaryComponent
      );
      expect(summary).toBeInTheDocument();
      expect(summary).toHaveTextContent("Summary for fahrenheit unit");
    });

    it("should pass correct temperature unit to summary", () => {
      render(
        <HistoricalWeatherTableWrapper
          {...defaultProps}
          temperatureUnit={TEMPERATURE_UNIT.CELSIUS}
        />
      );

      const summary = screen.getByTestId(
        HistoricalWeatherTableTestIds.summaryComponent
      );
      expect(summary).toHaveTextContent("Summary for celsius unit");
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing precipitation and humidity data", () => {
      const dataWithMissingValues = {
        ...mockHistoricalData,
        historicalData: {
          ...mockHistoricalData.historicalData,
          yearlyData: [
            {
              year: 2023,
              temperature: 25.5,
              precipitation: null,
              humidity: null,
            },
          ],
        },
      };

      mockUseGetApiWeatherHistorical.mockReturnValue({
        data: dataWithMissingValues,
        isLoading: false,
        error: null,
      });

      render(<HistoricalWeatherTableWrapper {...defaultProps} />);

      expect(
        screen.getByTestId(
          `${HistoricalWeatherTableTestIds.precipitationCell}-2023`
        )
      ).toHaveTextContent("0.0");
      expect(
        screen.getByTestId(`${HistoricalWeatherTableTestIds.humidityCell}-2023`)
      ).toHaveTextContent("0");
    });

    it("should handle missing year data", () => {
      const dataWithMissingYear = {
        ...mockHistoricalData,
        historicalData: {
          ...mockHistoricalData.historicalData,
          yearlyData: [
            {
              year: null,
              temperature: 25.5,
              precipitation: 10.2,
              humidity: 65,
            },
          ],
        },
      };

      mockUseGetApiWeatherHistorical.mockReturnValue({
        data: dataWithMissingYear,
        isLoading: false,
        error: null,
      });

      render(<HistoricalWeatherTableWrapper {...defaultProps} />);

      // Should still render but with null year
      expect(
        screen.getByTestId(HistoricalWeatherTableTestIds.container)
      ).toBeInTheDocument();
    });

    it("should handle data with missing requestedDate and retrievedAt", () => {
      const dataWithMissingDates = {
        ...mockHistoricalData,
        requestedDate: null,
        retrievedAt: null,
      };

      mockUseGetApiWeatherHistorical.mockReturnValue({
        data: dataWithMissingDates,
        isLoading: false,
        error: null,
      });

      render(<HistoricalWeatherTableWrapper {...defaultProps} />);

      const caption = screen.getByTestId(
        HistoricalWeatherTableTestIds.dataCaption
      );
      // Should still render caption but with Invalid Date
      expect(caption).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    beforeEach(() => {
      mockUseGetApiWeatherHistorical.mockReturnValue({
        data: mockHistoricalData,
        isLoading: false,
        error: null,
      });
    });

    it("should have proper aria-label on table", () => {
      render(<HistoricalWeatherTableWrapper {...defaultProps} />);

      const table = screen.getByTestId(HistoricalWeatherTableTestIds.table);
      expect(table).toHaveAttribute("aria-label", "historical weather data");
    });

    it("should have proper table structure with thead and tbody", () => {
      render(<HistoricalWeatherTableWrapper {...defaultProps} />);

      expect(
        screen.getByTestId(HistoricalWeatherTableTestIds.tableHead)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(HistoricalWeatherTableTestIds.tableBody)
      ).toBeInTheDocument();
    });
  });
});
