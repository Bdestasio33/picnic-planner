import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Skeleton,
  Alert,
} from "@mui/material";
import { TEMPERATURE_UNIT, type LocationInfo } from "../types";
import { convertTemperatureValue } from "../utils/temperatureConverter";
import { useGetApiWeatherHistorical } from "../hooks/weather/weather";
import HistoricalWeatherTableSummary from "./HistoricalWeatherTableSummary";

interface HistoricalWeatherTableProps {
  location: LocationInfo;
  date: string; // Format: YYYY-MM-DD
  temperatureUnit: TEMPERATURE_UNIT;
  yearsBack?: number;
}

/**
 * A component that displays historical weather data in a table format.
 * Shows yearly weather data for a specific date and location, including temperature, precipitation,
 * and humidity. Also displays summary statistics.
 *
 * @param {HistoricalWeatherTableProps} props
 */

const HistoricalWeatherTable = ({
  location,
  date,
  temperatureUnit,
  yearsBack = 10,
}: HistoricalWeatherTableProps) => {
  const { data, isLoading, error } = useGetApiWeatherHistorical({
    City: location.city,
    State: location.state,
    Country: location.country,
    Date: date,
    YearsBack: yearsBack,
  });

  if (error) {
    return (
      <Alert
        severity="error"
        sx={{ mt: 2 }}
        data-testid={HistoricalWeatherTableTestIds.errorAlert}
      >
        Failed to load historical weather data. Please try again later.
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Box
        sx={{ mt: 2 }}
        data-testid={HistoricalWeatherTableTestIds.loadingSkeleton}
      >
        <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={300} />
      </Box>
    );
  }

  if (!data?.historicalData?.yearlyData?.length) {
    return (
      <Alert
        severity="info"
        sx={{ mt: 2 }}
        data-testid={HistoricalWeatherTableTestIds.noDataAlert}
      >
        No historical weather data available for this date and location.
      </Alert>
    );
  }

  const historicalData = data.historicalData;

  return (
    <Box sx={{ mt: 2 }} data-testid={HistoricalWeatherTableTestIds.container}>
      {/* Summary Statistics */}
      <HistoricalWeatherTableSummary
        historicalData={historicalData}
        temperatureUnit={temperatureUnit}
        data-testid={HistoricalWeatherTableTestIds.summaryComponent}
      />
      {/* Yearly Data Table */}
      <TableContainer
        component={Paper}
        elevation={1}
        data-testid={HistoricalWeatherTableTestIds.tableContainer}
      >
        <Table
          size="small"
          aria-label="historical weather data"
          data-testid={HistoricalWeatherTableTestIds.table}
        >
          <TableHead data-testid={HistoricalWeatherTableTestIds.tableHead}>
            <TableRow>
              <TableCell data-testid={HistoricalWeatherTableTestIds.yearHeader}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Year
                </Typography>
              </TableCell>
              <TableCell
                align="right"
                data-testid={HistoricalWeatherTableTestIds.temperatureHeader}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  Temperature (
                  {temperatureUnit === TEMPERATURE_UNIT.FAHRENHEIT
                    ? "°F"
                    : "°C"}
                  )
                </Typography>
              </TableCell>
              <TableCell
                align="right"
                data-testid={HistoricalWeatherTableTestIds.precipitationHeader}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  Precipitation (mm)
                </Typography>
              </TableCell>
              <TableCell
                align="right"
                data-testid={HistoricalWeatherTableTestIds.humidityHeader}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  Humidity (%)
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody data-testid={HistoricalWeatherTableTestIds.tableBody}>
            {(historicalData.yearlyData || [])
              .sort((a, b) => (b.year || 0) - (a.year || 0)) // Sort by year descending
              .map((yearData) => {
                const temperature = convertTemperatureValue(
                  yearData.temperature,
                  temperatureUnit
                );
                const precipitation = yearData.precipitation || 0;
                const humidity = yearData.humidity || 0;

                return (
                  <TableRow
                    key={yearData.year}
                    hover
                    data-testid={`${HistoricalWeatherTableTestIds.tableRow}-${yearData.year}`}
                  >
                    <TableCell
                      data-testid={`${HistoricalWeatherTableTestIds.yearCell}-${yearData.year}`}
                    >
                      <Typography variant="body2" fontWeight="medium">
                        {yearData.year}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="right"
                      data-testid={`${HistoricalWeatherTableTestIds.temperatureCell}-${yearData.year}`}
                    >
                      <Typography
                        variant="body2"
                        color={
                          temperature >
                          convertTemperatureValue(
                            historicalData.averageTemperature,
                            temperatureUnit
                          )
                            ? "error.main"
                            : "primary.main"
                        }
                      >
                        {temperature.toFixed(1)}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="right"
                      data-testid={`${HistoricalWeatherTableTestIds.precipitationCell}-${yearData.year}`}
                    >
                      <Typography
                        variant="body2"
                        color={
                          precipitation >
                          (historicalData.averagePrecipitation || 0)
                            ? "error.main"
                            : "primary.main"
                        }
                      >
                        {precipitation.toFixed(1)}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="right"
                      data-testid={`${HistoricalWeatherTableTestIds.humidityCell}-${yearData.year}`}
                    >
                      <Typography variant="body2">
                        {humidity.toFixed(0)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 1, display: "block" }}
        data-testid={HistoricalWeatherTableTestIds.dataCaption}
      >
        {`Data from ${new Date(data.requestedDate || "").toLocaleDateString(
          "en-US",
          {
            month: "long",
            day: "numeric",
          }
        )} across ${historicalData.yearsOfData} years. Retrieved on ${new Date(data.retrievedAt || "").toLocaleDateString()}.`}
      </Typography>
    </Box>
  );
};

export default HistoricalWeatherTable;

export const HistoricalWeatherTableTestIds = {
  container: "historical-weather-table-container",
  errorAlert: "historical-weather-table-error",
  loadingSkeleton: "historical-weather-table-loading",
  noDataAlert: "historical-weather-table-no-data",
  summaryComponent: "historical-weather-table-summary",
  tableContainer: "historical-weather-table-container-table",
  table: "historical-weather-table",
  tableHead: "historical-weather-table-head",
  tableBody: "historical-weather-table-body",
  yearHeader: "historical-weather-table-year-header",
  temperatureHeader: "historical-weather-table-temperature-header",
  precipitationHeader: "historical-weather-table-precipitation-header",
  humidityHeader: "historical-weather-table-humidity-header",
  dataCaption: "historical-weather-table-caption",
  tableRow: "historical-weather-table-row",
  yearCell: "historical-weather-table-year-cell",
  temperatureCell: "historical-weather-table-temperature-cell",
  precipitationCell: "historical-weather-table-precipitation-cell",
  humidityCell: "historical-weather-table-humidity-cell",
};
