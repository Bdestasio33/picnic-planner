import { displayTemperature } from "../utils/temperatureConverter";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import OpacityIcon from "@mui/icons-material/Opacity";
import { Typography, Box } from "@mui/material";
import type { HistoricalWeatherDataDto } from "../types";
import type { TemperatureUnit } from "../types";

interface HistoricalWeatherTableSummaryProps {
  historicalData: HistoricalWeatherDataDto;
  temperatureUnit: TemperatureUnit;
}

/**
 * A component that displays summary statistics for historical weather data.
 * Shows average temperature, precipitation, and humidity.
 *
 * @param {HistoricalWeatherTableSummaryProps} props
 */
export const HistoricalWeatherTableSummary = ({
  historicalData,
  temperatureUnit: tempUnit,
}: HistoricalWeatherTableSummaryProps) => {
  return (
    <Box
      sx={styles.summaryBox}
      data-testid={HistoricalWeatherTableSummaryTestIds.summaryBox}
    >
      <Typography
        variant="h6"
        gutterBottom
        data-testid={HistoricalWeatherTableSummaryTestIds.summaryTitle}
      >
        Historical Weather Summary ({historicalData.yearsOfData} years)
      </Typography>
      <Box
        sx={styles.summaryStats}
        data-testid={HistoricalWeatherTableSummaryTestIds.summaryStats}
      >
        <Box
          sx={styles.statItem}
          data-testid={HistoricalWeatherTableSummaryTestIds.temperatureStatItem}
        >
          <ThermostatIcon
            color="primary"
            fontSize="small"
            data-testid={HistoricalWeatherTableSummaryTestIds.temperatureIcon}
          />
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              data-testid={
                HistoricalWeatherTableSummaryTestIds.temperatureLabel
              }
            >
              Avg Temperature
            </Typography>
            <Typography
              variant="body1"
              fontWeight="bold"
              data-testid={
                HistoricalWeatherTableSummaryTestIds.temperatureValue
              }
            >
              {displayTemperature(historicalData.averageTemperature, tempUnit)}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={styles.statItem}
          data-testid={
            HistoricalWeatherTableSummaryTestIds.precipitationStatItem
          }
        >
          <WaterDropIcon
            color="primary"
            fontSize="small"
            data-testid={HistoricalWeatherTableSummaryTestIds.precipitationIcon}
          />
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              data-testid={
                HistoricalWeatherTableSummaryTestIds.precipitationLabel
              }
            >
              Avg Precipitation
            </Typography>
            <Typography
              variant="body1"
              fontWeight="bold"
              data-testid={
                HistoricalWeatherTableSummaryTestIds.precipitationValue
              }
            >
              {(historicalData.averagePrecipitation || 0).toFixed(1)}mm
            </Typography>
          </Box>
        </Box>
        <Box
          sx={styles.statItem}
          data-testid={HistoricalWeatherTableSummaryTestIds.humidityStatItem}
        >
          <OpacityIcon
            color="primary"
            fontSize="small"
            data-testid={HistoricalWeatherTableSummaryTestIds.humidityIcon}
          />
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              data-testid={HistoricalWeatherTableSummaryTestIds.humidityLabel}
            >
              Avg Humidity
            </Typography>
            <Typography
              variant="body1"
              fontWeight="bold"
              data-testid={HistoricalWeatherTableSummaryTestIds.humidityValue}
            >
              {(historicalData.averageHumidity || 0).toFixed(0)}%
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default HistoricalWeatherTableSummary;

const styles = {
  summaryBox: {
    mb: 3,
    p: 2,
    backgroundColor: "background.paper",
    borderRadius: 2,
    border: "1px solid",
    borderColor: "divider",
  },
  summaryStats: {
    display: "flex",
    gap: 3,
    flexWrap: "wrap" as const,
  },
  statItem: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    minWidth: 120,
  },
};

export const HistoricalWeatherTableSummaryTestIds = {
  summaryBox: "historical-weather-table-summary-box",
  summaryTitle: "historical-weather-table-summary-title",
  summaryStats: "historical-weather-table-summary-stats",
  temperatureStatItem: "historical-weather-table-summary-temperature-stat",
  temperatureIcon: "historical-weather-table-summary-temperature-icon",
  temperatureLabel: "historical-weather-table-summary-temperature-label",
  temperatureValue: "historical-weather-table-summary-temperature-value",
  precipitationStatItem: "historical-weather-table-summary-precipitation-stat",
  precipitationIcon: "historical-weather-table-summary-precipitation-icon",
  precipitationLabel: "historical-weather-table-summary-precipitation-label",
  precipitationValue: "historical-weather-table-summary-precipitation-value",
  humidityStatItem: "historical-weather-table-summary-humidity-stat",
  humidityIcon: "historical-weather-table-summary-humidity-icon",
  humidityLabel: "historical-weather-table-summary-humidity-label",
  humidityValue: "historical-weather-table-summary-humidity-value",
};
