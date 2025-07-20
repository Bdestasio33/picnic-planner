import {
  Box,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
} from "@mui/material";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import AirIcon from "@mui/icons-material/Air";
import OpacityIcon from "@mui/icons-material/Opacity";
import PicnicSuitabilityIndicator from "./PicnicSuitabilityIndicator";
import HistoricalWeatherTable from "./HistoricalWeatherTable";
import { Close as CloseIcon } from "@mui/icons-material";
import type { LocationInfo, WeatherForecastDto } from "../types";
import { TEMPERATURE_UNIT, type TemperatureUnit } from "../types";
import type { Dayjs } from "dayjs";
import { displayTemperatureRange } from "../utils/temperatureConverter";
import { useState } from "react";

interface WeatherDetailDialogProps {
  dialogOpen: boolean;
  handleCloseDialog: () => void;
  isMobile: boolean;
  selectedDate: Dayjs | null;
  selectedForecast: WeatherForecastDto | null;
  location: LocationInfo;
}

/**
 * A dialog component that displays weather details for a selected date.
 *
 * @param {WeatherDetailDialogProps} props
 */
export const WeatherDetailDialog = ({
  dialogOpen,
  handleCloseDialog,
  isMobile,
  selectedDate,
  selectedForecast,
  location,
}: WeatherDetailDialogProps) => {
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>(
    TEMPERATURE_UNIT.CELSIUS
  );

  const handleTemperatureUnitChange = (
    _event: React.MouseEvent<HTMLElement>,
    newUnit: TemperatureUnit | null
  ) => {
    if (newUnit !== null) {
      setTemperatureUnit(newUnit);
    }
  };

  return (
    <Dialog
      open={dialogOpen}
      onClose={handleCloseDialog}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      data-testid={WeatherDetailDialogTestIds.dialog}
    >
      <DialogTitle
        sx={styles.dialogTitle}
        data-testid={WeatherDetailDialogTestIds.dialogTitle}
      >
        <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1 }}>
          <Typography variant="h6" component="span">
            {selectedDate?.format("dddd, MMMM D, YYYY")}
          </Typography>

          {/* Temperature Unit Toggle */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <ThermostatIcon color="primary" fontSize="small" />
            <ToggleButtonGroup
              value={temperatureUnit}
              exclusive
              onChange={handleTemperatureUnitChange}
              aria-label="temperature unit"
              size="small"
              data-testid={WeatherDetailDialogTestIds.temperatureToggle}
            >
              <ToggleButton
                value={TEMPERATURE_UNIT.CELSIUS}
                aria-label="celsius"
                data-testid={WeatherDetailDialogTestIds.celsiusButton}
              >
                °C
              </ToggleButton>
              <ToggleButton
                value={TEMPERATURE_UNIT.FAHRENHEIT}
                aria-label="fahrenheit"
                data-testid={WeatherDetailDialogTestIds.fahrenheitButton}
              >
                °F
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Stack>

        <IconButton
          onClick={handleCloseDialog}
          size="small"
          data-testid={WeatherDetailDialogTestIds.closeButton}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {selectedForecast && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Picnic Suitability */}
            <Paper
              elevation={1}
              sx={styles.suitabilityCard}
              data-testid={WeatherDetailDialogTestIds.suitabilityCard}
            >
              <Typography variant="h6" gutterBottom>
                Picnic Suitability
              </Typography>
              <PicnicSuitabilityIndicator
                condition={selectedForecast.condition!}
                showDetails={true}
              />
            </Paper>

            {/* Weather Details */}
            <Paper
              elevation={1}
              sx={styles.weatherCard}
              data-testid={WeatherDetailDialogTestIds.weatherCard}
            >
              <Typography variant="h6" gutterBottom>
                Weather Details
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 2,
                }}
              >
                <Box
                  sx={styles.weatherItem}
                  data-testid={WeatherDetailDialogTestIds.temperatureItem}
                >
                  <ThermostatIcon color="primary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Temperature
                    </Typography>
                    <Typography variant="body1">
                      {displayTemperatureRange(
                        selectedForecast.maxTemperature,
                        selectedForecast.minTemperature,
                        temperatureUnit
                      )}
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={styles.weatherItem}
                  data-testid={WeatherDetailDialogTestIds.precipitationItem}
                >
                  <WaterDropIcon color="primary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Precipitation
                    </Typography>
                    <Typography variant="body1">
                      {selectedForecast.precipitationChance || 0}%
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={styles.weatherItem}
                  data-testid={WeatherDetailDialogTestIds.windSpeedItem}
                >
                  <AirIcon color="primary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Wind Speed
                    </Typography>
                    <Typography variant="body1">
                      {selectedForecast.windSpeed || 0} km/h
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={styles.weatherItem}
                  data-testid={WeatherDetailDialogTestIds.humidityItem}
                >
                  <OpacityIcon color="primary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Humidity
                    </Typography>
                    <Typography variant="body1">
                      {selectedForecast.humidity || 0}%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* Historical Weather Data */}
            <Paper
              elevation={1}
              sx={styles.historicalCard}
              data-testid={WeatherDetailDialogTestIds.historicalCard}
            >
              <Typography variant="h6" gutterBottom>
                Historical Weather Data
              </Typography>
              <HistoricalWeatherTable
                location={location}
                date={selectedForecast.date || ""}
                temperatureUnit={temperatureUnit}
                yearsBack={10}
              />
            </Paper>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleCloseDialog}
          color="primary"
          data-testid={WeatherDetailDialogTestIds.closeActionButton}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const styles = {
  dialogTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    pb: 1,
  },
  suitabilityCard: {
    p: 2,
    borderRadius: 2,
  },
  weatherCard: {
    p: 2,
    borderRadius: 2,
  },
  historicalCard: {
    p: 2,
    borderRadius: 2,
  },
  weatherItem: {
    display: "flex",
    alignItems: "center",
    gap: 1,
  },
};

export const WeatherDetailDialogTestIds = {
  dialog: "weather-detail-dialog",
  dialogTitle: "weather-detail-dialog-title",
  temperatureToggle: "weather-detail-temperature-toggle",
  celsiusButton: "weather-detail-celsius-button",
  fahrenheitButton: "weather-detail-fahrenheit-button",
  closeButton: "weather-detail-close-button",
  suitabilityCard: "weather-detail-suitability-card",
  weatherCard: "weather-detail-weather-card",
  historicalCard: "weather-detail-historical-card",
  temperatureItem: "weather-detail-temperature-item",
  precipitationItem: "weather-detail-precipitation-item",
  windSpeedItem: "weather-detail-wind-speed-item",
  humidityItem: "weather-detail-humidity-item",
  closeActionButton: "weather-detail-close-action-button",
};
