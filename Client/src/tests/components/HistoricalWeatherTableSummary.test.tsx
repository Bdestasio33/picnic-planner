import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import HistoricalWeatherTableSummary, {
  HistoricalWeatherTableSummaryTestIds,
} from "../../components/HistoricalWeatherTableSummary";
import { TEMPERATURE_UNIT } from "../../types";
import type { HistoricalWeatherDataDto } from "../../types";

// Mock the temperature converter utility
vi.mock("../../utils/temperatureConverter", () => ({
  displayTemperature: vi.fn((temp: number, unit: any) => {
    if (unit === TEMPERATURE_UNIT.FAHRENHEIT || unit === "FAHRENHEIT") {
      return `${((temp * 9) / 5 + 32).toFixed(1)}°F`;
    }
    return `${temp.toFixed(1)}°C`;
  }),
}));

import { displayTemperature } from "../../utils/temperatureConverter";

// Mock theme for Material UI components
const theme = createTheme();

// Helper component to wrap with theme
const HistoricalWeatherTableSummaryWrapper = (props: any) => (
  <ThemeProvider theme={theme}>
    <HistoricalWeatherTableSummary {...props} />
  </ThemeProvider>
);

describe("HistoricalWeatherTableSummary", () => {
  const mockHistoricalData: HistoricalWeatherDataDto = {
    yearlyData: [], // Not used in summary component
    averageTemperature: 22.5,
    averagePrecipitation: 45.8,
    averageHumidity: 68.3,
    yearsOfData: 10,
  };

  const defaultProps = {
    historicalData: mockHistoricalData,
    temperatureUnit: TEMPERATURE_UNIT.FAHRENHEIT,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("Rendering", () => {
    it("should render all main components", () => {
      render(<HistoricalWeatherTableSummaryWrapper {...defaultProps} />);

      expect(
        screen.getByTestId(HistoricalWeatherTableSummaryTestIds.summaryBox)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(HistoricalWeatherTableSummaryTestIds.summaryTitle)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(HistoricalWeatherTableSummaryTestIds.summaryStats)
      ).toBeInTheDocument();
    });

    it("should render temperature stat item with all elements", () => {
      render(<HistoricalWeatherTableSummaryWrapper {...defaultProps} />);

      expect(
        screen.getByTestId(
          HistoricalWeatherTableSummaryTestIds.temperatureStatItem
        )
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(HistoricalWeatherTableSummaryTestIds.temperatureIcon)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(
          HistoricalWeatherTableSummaryTestIds.temperatureLabel
        )
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(
          HistoricalWeatherTableSummaryTestIds.temperatureValue
        )
      ).toBeInTheDocument();
    });

    it("should render precipitation stat item with all elements", () => {
      render(<HistoricalWeatherTableSummaryWrapper {...defaultProps} />);

      expect(
        screen.getByTestId(
          HistoricalWeatherTableSummaryTestIds.precipitationStatItem
        )
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(
          HistoricalWeatherTableSummaryTestIds.precipitationIcon
        )
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(
          HistoricalWeatherTableSummaryTestIds.precipitationLabel
        )
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(
          HistoricalWeatherTableSummaryTestIds.precipitationValue
        )
      ).toBeInTheDocument();
    });

    it("should render humidity stat item with all elements", () => {
      render(<HistoricalWeatherTableSummaryWrapper {...defaultProps} />);

      expect(
        screen.getByTestId(
          HistoricalWeatherTableSummaryTestIds.humidityStatItem
        )
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(HistoricalWeatherTableSummaryTestIds.humidityIcon)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(HistoricalWeatherTableSummaryTestIds.humidityLabel)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(HistoricalWeatherTableSummaryTestIds.humidityValue)
      ).toBeInTheDocument();
    });
  });

  describe("Title Display", () => {
    it("should display correct title with years of data", () => {
      render(<HistoricalWeatherTableSummaryWrapper {...defaultProps} />);

      const title = screen.getByTestId(
        HistoricalWeatherTableSummaryTestIds.summaryTitle
      );
      expect(title).toHaveTextContent("Historical Weather Summary (10 years)");
    });

    it("should handle different years of data", () => {
      const dataWithDifferentYears = {
        ...mockHistoricalData,
        yearsOfData: 5,
      };

      render(
        <HistoricalWeatherTableSummaryWrapper
          {...defaultProps}
          historicalData={dataWithDifferentYears}
        />
      );

      const title = screen.getByTestId(
        HistoricalWeatherTableSummaryTestIds.summaryTitle
      );
      expect(title).toHaveTextContent("Historical Weather Summary (5 years)");
    });
  });

  describe("Labels", () => {
    it("should display correct stat labels", () => {
      render(<HistoricalWeatherTableSummaryWrapper {...defaultProps} />);

      expect(
        screen.getByTestId(
          HistoricalWeatherTableSummaryTestIds.temperatureLabel
        )
      ).toHaveTextContent("Avg Temperature");
      expect(
        screen.getByTestId(
          HistoricalWeatherTableSummaryTestIds.precipitationLabel
        )
      ).toHaveTextContent("Avg Precipitation");
      expect(
        screen.getByTestId(HistoricalWeatherTableSummaryTestIds.humidityLabel)
      ).toHaveTextContent("Avg Humidity");
    });
  });

  describe("Temperature Display", () => {
    it("should call displayTemperature with correct parameters for Fahrenheit", () => {
      render(<HistoricalWeatherTableSummaryWrapper {...defaultProps} />);

      expect(displayTemperature).toHaveBeenCalledWith(
        22.5,
        TEMPERATURE_UNIT.FAHRENHEIT
      );

      const temperatureValue = screen.getByTestId(
        HistoricalWeatherTableSummaryTestIds.temperatureValue
      );
      expect(temperatureValue).toHaveTextContent("72.5°F"); // Mocked conversion
    });

    it("should call displayTemperature with correct parameters for Celsius", () => {
      render(
        <HistoricalWeatherTableSummaryWrapper
          {...defaultProps}
          temperatureUnit={TEMPERATURE_UNIT.CELSIUS}
        />
      );

      expect(displayTemperature).toHaveBeenCalledWith(
        22.5,
        TEMPERATURE_UNIT.CELSIUS
      );

      const temperatureValue = screen.getByTestId(
        HistoricalWeatherTableSummaryTestIds.temperatureValue
      );
      expect(temperatureValue).toHaveTextContent("22.5°C"); // Mocked display
    });

    it("should handle different temperature values", () => {
      const dataWithDifferentTemp = {
        ...mockHistoricalData,
        averageTemperature: 15.8,
      };

      render(
        <HistoricalWeatherTableSummaryWrapper
          {...defaultProps}
          historicalData={dataWithDifferentTemp}
        />
      );

      expect(displayTemperature).toHaveBeenCalledWith(
        15.8,
        TEMPERATURE_UNIT.FAHRENHEIT
      );
    });
  });

  describe("Precipitation Display", () => {
    it("should format precipitation to 1 decimal place with mm unit", () => {
      render(<HistoricalWeatherTableSummaryWrapper {...defaultProps} />);

      const precipitationValue = screen.getByTestId(
        HistoricalWeatherTableSummaryTestIds.precipitationValue
      );
      expect(precipitationValue).toHaveTextContent("45.8mm");
    });

    it("should handle different precipitation values", () => {
      const dataWithDifferentPrecip = {
        ...mockHistoricalData,
        averagePrecipitation: 120.25,
      };

      render(
        <HistoricalWeatherTableSummaryWrapper
          {...defaultProps}
          historicalData={dataWithDifferentPrecip}
        />
      );

      const precipitationValue = screen.getByTestId(
        HistoricalWeatherTableSummaryTestIds.precipitationValue
      );
      expect(precipitationValue).toHaveTextContent("120.3mm"); // Should round to 1 decimal
    });

    it("should handle zero precipitation", () => {
      const dataWithZeroPrecip = {
        ...mockHistoricalData,
        averagePrecipitation: 0,
      };

      render(
        <HistoricalWeatherTableSummaryWrapper
          {...defaultProps}
          historicalData={dataWithZeroPrecip}
        />
      );

      const precipitationValue = screen.getByTestId(
        HistoricalWeatherTableSummaryTestIds.precipitationValue
      );
      expect(precipitationValue).toHaveTextContent("0.0mm");
    });
  });

  describe("Humidity Display", () => {
    it("should format humidity to 0 decimal places with % unit", () => {
      render(<HistoricalWeatherTableSummaryWrapper {...defaultProps} />);

      const humidityValue = screen.getByTestId(
        HistoricalWeatherTableSummaryTestIds.humidityValue
      );
      expect(humidityValue).toHaveTextContent("68%");
    });

    it("should handle different humidity values", () => {
      const dataWithDifferentHumidity = {
        ...mockHistoricalData,
        averageHumidity: 83.7,
      };

      render(
        <HistoricalWeatherTableSummaryWrapper
          {...defaultProps}
          historicalData={dataWithDifferentHumidity}
        />
      );

      const humidityValue = screen.getByTestId(
        HistoricalWeatherTableSummaryTestIds.humidityValue
      );
      expect(humidityValue).toHaveTextContent("84%"); // Should round to 0 decimal
    });

    it("should handle zero humidity", () => {
      const dataWithZeroHumidity = {
        ...mockHistoricalData,
        averageHumidity: 0,
      };

      render(
        <HistoricalWeatherTableSummaryWrapper
          {...defaultProps}
          historicalData={dataWithZeroHumidity}
        />
      );

      const humidityValue = screen.getByTestId(
        HistoricalWeatherTableSummaryTestIds.humidityValue
      );
      expect(humidityValue).toHaveTextContent("0%");
    });
  });

  describe("Edge Cases", () => {
    it("should handle null precipitation gracefully", () => {
      const dataWithNullPrecip = {
        ...mockHistoricalData,
        averagePrecipitation: null as any,
      };

      render(
        <HistoricalWeatherTableSummaryWrapper
          {...defaultProps}
          historicalData={dataWithNullPrecip}
        />
      );

      const precipitationValue = screen.getByTestId(
        HistoricalWeatherTableSummaryTestIds.precipitationValue
      );
      expect(precipitationValue).toHaveTextContent("0.0mm");
    });

    it("should handle undefined precipitation gracefully", () => {
      const dataWithUndefinedPrecip = {
        ...mockHistoricalData,
        averagePrecipitation: undefined as any,
      };

      render(
        <HistoricalWeatherTableSummaryWrapper
          {...defaultProps}
          historicalData={dataWithUndefinedPrecip}
        />
      );

      const precipitationValue = screen.getByTestId(
        HistoricalWeatherTableSummaryTestIds.precipitationValue
      );
      expect(precipitationValue).toHaveTextContent("0.0mm");
    });

    it("should handle null humidity gracefully", () => {
      const dataWithNullHumidity = {
        ...mockHistoricalData,
        averageHumidity: null as any,
      };

      render(
        <HistoricalWeatherTableSummaryWrapper
          {...defaultProps}
          historicalData={dataWithNullHumidity}
        />
      );

      const humidityValue = screen.getByTestId(
        HistoricalWeatherTableSummaryTestIds.humidityValue
      );
      expect(humidityValue).toHaveTextContent("0%");
    });

    it("should handle undefined humidity gracefully", () => {
      const dataWithUndefinedHumidity = {
        ...mockHistoricalData,
        averageHumidity: undefined as any,
      };

      render(
        <HistoricalWeatherTableSummaryWrapper
          {...defaultProps}
          historicalData={dataWithUndefinedHumidity}
        />
      );

      const humidityValue = screen.getByTestId(
        HistoricalWeatherTableSummaryTestIds.humidityValue
      );
      expect(humidityValue).toHaveTextContent("0%");
    });

    it("should handle zero years of data", () => {
      const dataWithZeroYears = {
        ...mockHistoricalData,
        yearsOfData: 0,
      };

      render(
        <HistoricalWeatherTableSummaryWrapper
          {...defaultProps}
          historicalData={dataWithZeroYears}
        />
      );

      const title = screen.getByTestId(
        HistoricalWeatherTableSummaryTestIds.summaryTitle
      );
      expect(title).toHaveTextContent("Historical Weather Summary (0 years)");
    });
  });

  describe("Icon Rendering", () => {
    it("should render thermometer icon for temperature", () => {
      render(<HistoricalWeatherTableSummaryWrapper {...defaultProps} />);

      const temperatureIcon = screen.getByTestId(
        HistoricalWeatherTableSummaryTestIds.temperatureIcon
      );
      expect(temperatureIcon).toBeInTheDocument();
      // Check if it's the correct icon (ThermostatIcon)
      expect(temperatureIcon.tagName.toLowerCase()).toBe("svg");
    });

    it("should render water drop icon for precipitation", () => {
      render(<HistoricalWeatherTableSummaryWrapper {...defaultProps} />);

      const precipitationIcon = screen.getByTestId(
        HistoricalWeatherTableSummaryTestIds.precipitationIcon
      );
      expect(precipitationIcon).toBeInTheDocument();
      expect(precipitationIcon.tagName.toLowerCase()).toBe("svg");
    });

    it("should render opacity icon for humidity", () => {
      render(<HistoricalWeatherTableSummaryWrapper {...defaultProps} />);

      const humidityIcon = screen.getByTestId(
        HistoricalWeatherTableSummaryTestIds.humidityIcon
      );
      expect(humidityIcon).toBeInTheDocument();
      expect(humidityIcon.tagName.toLowerCase()).toBe("svg");
    });
  });

  describe("Data Integration", () => {
    it("should display all data correctly for a complete dataset", () => {
      const completeData = {
        yearlyData: [],
        averageTemperature: 18.5,
        averagePrecipitation: 75.2,
        averageHumidity: 62.8,
        yearsOfData: 15,
      };

      render(
        <HistoricalWeatherTableSummaryWrapper
          {...defaultProps}
          historicalData={completeData}
          temperatureUnit={TEMPERATURE_UNIT.CELSIUS}
        />
      );

      // Check title
      expect(
        screen.getByTestId(HistoricalWeatherTableSummaryTestIds.summaryTitle)
      ).toHaveTextContent("Historical Weather Summary (15 years)");

      // Check temperature
      expect(displayTemperature).toHaveBeenCalledWith(
        18.5,
        TEMPERATURE_UNIT.CELSIUS
      );

      // Check precipitation
      expect(
        screen.getByTestId(
          HistoricalWeatherTableSummaryTestIds.precipitationValue
        )
      ).toHaveTextContent("75.2mm");

      // Check humidity
      expect(
        screen.getByTestId(HistoricalWeatherTableSummaryTestIds.humidityValue)
      ).toHaveTextContent("63%"); // Rounded from 62.8
    });

    it("should handle extreme values correctly", () => {
      const extremeData = {
        yearlyData: [],
        averageTemperature: -15.3,
        averagePrecipitation: 999.99,
        averageHumidity: 100,
        yearsOfData: 1,
      };

      render(
        <HistoricalWeatherTableSummaryWrapper
          {...defaultProps}
          historicalData={extremeData}
        />
      );

      expect(displayTemperature).toHaveBeenCalledWith(
        -15.3,
        TEMPERATURE_UNIT.FAHRENHEIT
      );
      expect(
        screen.getByTestId(
          HistoricalWeatherTableSummaryTestIds.precipitationValue
        )
      ).toHaveTextContent("1000.0mm");
      expect(
        screen.getByTestId(HistoricalWeatherTableSummaryTestIds.humidityValue)
      ).toHaveTextContent("100%");
    });
  });

  describe("Accessibility", () => {
    it("should render with proper semantic structure", () => {
      render(<HistoricalWeatherTableSummaryWrapper {...defaultProps} />);

      // Main container should be present
      expect(
        screen.getByTestId(HistoricalWeatherTableSummaryTestIds.summaryBox)
      ).toBeInTheDocument();

      // Title should be an h6 heading
      const title = screen.getByTestId(
        HistoricalWeatherTableSummaryTestIds.summaryTitle
      );
      expect(title.tagName.toLowerCase()).toBe("h6");
    });

    it("should have all required test ids for automation", () => {
      render(<HistoricalWeatherTableSummaryWrapper {...defaultProps} />);

      // Verify all test IDs are present
      Object.values(HistoricalWeatherTableSummaryTestIds).forEach((testId) => {
        expect(screen.getByTestId(testId)).toBeInTheDocument();
      });
    });
  });
});
