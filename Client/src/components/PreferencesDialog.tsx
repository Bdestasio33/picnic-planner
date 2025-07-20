import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Slider,
  FormLabel,
  IconButton,
  Stack,
  Paper,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { usePreferences } from "../contexts/PreferencesContext";
import type { UserPreferences } from "../types/custom/preferences";
import {
  celsiusToDisplayUnit,
  displayUnitToCelsius,
  getTemperatureSliderConfig,
} from "../utils/temperatureConverter";
import type { TemperatureUnit } from "../types";

interface PreferencesDialogProps {
  open: boolean;
  onClose: () => void;
}

export const PreferencesDialogTestIds = {
  dialog: "preferences-dialog",
  dialogTitle: "preferences-dialog-title",
  dialogContent: "preferences-dialog-content",
  saveButton: "preferences-save-button",
  cancelButton: "preferences-cancel-button",
  resetButton: "preferences-reset-button",
  temperatureSection: "temperature-section",
  precipitationSection: "precipitation-section",
  windSection: "wind-section",
  humiditySection: "humidity-section",
} as const;

const PreferencesDialog: React.FC<PreferencesDialogProps> = ({
  open,
  onClose,
}) => {
  const { preferences, updatePreferences, resetPreferences } = usePreferences();
  const [localPreferences, setLocalPreferences] =
    useState<UserPreferences>(preferences);

  // Update local state when preferences change
  useEffect(() => {
    setLocalPreferences(preferences);
  }, [preferences]);

  const handleSave = () => {
    updatePreferences(localPreferences);
    onClose();
  };

  const handleCancel = () => {
    setLocalPreferences(preferences); // Reset to original
    onClose();
  };

  const handleReset = () => {
    resetPreferences();
    onClose();
  };

  const updateLocalPreference = (path: keyof UserPreferences, value: any) => {
    setLocalPreferences((prev) => ({
      ...prev,
      [path]: value,
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
      data-testid={PreferencesDialogTestIds.dialog}
    >
      <DialogTitle data-testid={PreferencesDialogTestIds.dialogTitle}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6">Weather Preferences</Typography>
          <IconButton onClick={handleCancel} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent data-testid={PreferencesDialogTestIds.dialogContent}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Customize what you consider ideal, fair, and poor weather conditions
          for your picnics.
        </Typography>

        <Stack spacing={4}>
          {/* Temperature Unit - Moved to top */}
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              ⚙️ Units
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={localPreferences.temperatureUnit === "fahrenheit"}
                  onChange={(e) => {
                    updateLocalPreference(
                      "temperatureUnit",
                      e.target.checked ? "fahrenheit" : "celsius"
                    );
                  }}
                />
              }
              label={`Temperature in ${localPreferences.temperatureUnit === "celsius" ? "Celsius" : "Fahrenheit"}`}
            />
          </Paper>

          {/* Temperature Settings */}
          <Paper
            elevation={1}
            sx={{ p: 3 }}
            data-testid={PreferencesDialogTestIds.temperatureSection}
          >
            <Typography variant="h6" gutterBottom>
              🌡️ Temperature (
              {localPreferences.temperatureUnit === "celsius" ? "°C" : "°F"})
            </Typography>

            <Box sx={{ mt: 2 }}>
              <FormLabel>Ideal Temperature Range</FormLabel>
              <Slider
                value={[
                  celsiusToDisplayUnit(
                    localPreferences.temperature.ideal.min,
                    localPreferences.temperatureUnit as TemperatureUnit
                  ),
                  celsiusToDisplayUnit(
                    localPreferences.temperature.ideal.max,
                    localPreferences.temperatureUnit as TemperatureUnit
                  ),
                ]}
                onChange={(_, value) => {
                  const [min, max] = value as number[];
                  updateLocalPreference("temperature", {
                    ...localPreferences.temperature,
                    ideal: {
                      min: displayUnitToCelsius(
                        min,
                        localPreferences.temperatureUnit as TemperatureUnit
                      ),
                      max: displayUnitToCelsius(
                        max,
                        localPreferences.temperatureUnit as TemperatureUnit
                      ),
                    },
                  });
                }}
                valueLabelDisplay="auto"
                min={
                  getTemperatureSliderConfig(
                    localPreferences.temperatureUnit as TemperatureUnit
                  ).idealRange.min
                }
                max={
                  getTemperatureSliderConfig(
                    localPreferences.temperatureUnit as TemperatureUnit
                  ).idealRange.max
                }
                marks={
                  getTemperatureSliderConfig(
                    localPreferences.temperatureUnit as TemperatureUnit
                  ).marks.ideal
                }
                sx={{ mt: 2 }}
              />
              <Typography variant="caption" color="text.secondary">
                {Math.round(
                  celsiusToDisplayUnit(
                    localPreferences.temperature.ideal.min,
                    localPreferences.temperatureUnit as TemperatureUnit
                  )
                )}
                ° -{" "}
                {Math.round(
                  celsiusToDisplayUnit(
                    localPreferences.temperature.ideal.max,
                    localPreferences.temperatureUnit as TemperatureUnit
                  )
                )}
                °
              </Typography>
            </Box>

            <Box sx={{ mt: 3 }}>
              <FormLabel>
                Poor Temperature Range (too cold or too hot)
              </FormLabel>
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption">Too Cold (below)</Typography>
                  <Slider
                    value={celsiusToDisplayUnit(
                      localPreferences.temperature.poor.min,
                      localPreferences.temperatureUnit as TemperatureUnit
                    )}
                    onChange={(_, value) => {
                      updateLocalPreference("temperature", {
                        ...localPreferences.temperature,
                        poor: {
                          ...localPreferences.temperature.poor,
                          min: displayUnitToCelsius(
                            value as number,
                            localPreferences.temperatureUnit as TemperatureUnit
                          ),
                        },
                      });
                    }}
                    valueLabelDisplay="auto"
                    min={
                      getTemperatureSliderConfig(
                        localPreferences.temperatureUnit as TemperatureUnit
                      ).poorColdRange.min
                    }
                    max={
                      getTemperatureSliderConfig(
                        localPreferences.temperatureUnit as TemperatureUnit
                      ).poorColdRange.max
                    }
                    marks={
                      getTemperatureSliderConfig(
                        localPreferences.temperatureUnit as TemperatureUnit
                      ).marks.poorCold
                    }
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption">Too Hot (above)</Typography>
                  <Slider
                    value={celsiusToDisplayUnit(
                      localPreferences.temperature.poor.max,
                      localPreferences.temperatureUnit as TemperatureUnit
                    )}
                    onChange={(_, value) => {
                      updateLocalPreference("temperature", {
                        ...localPreferences.temperature,
                        poor: {
                          ...localPreferences.temperature.poor,
                          max: displayUnitToCelsius(
                            value as number,
                            localPreferences.temperatureUnit as TemperatureUnit
                          ),
                        },
                      });
                    }}
                    valueLabelDisplay="auto"
                    min={
                      getTemperatureSliderConfig(
                        localPreferences.temperatureUnit as TemperatureUnit
                      ).poorHotRange.min
                    }
                    max={
                      getTemperatureSliderConfig(
                        localPreferences.temperatureUnit as TemperatureUnit
                      ).poorHotRange.max
                    }
                    marks={
                      getTemperatureSliderConfig(
                        localPreferences.temperatureUnit as TemperatureUnit
                      ).marks.poorHot
                    }
                  />
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Precipitation Settings */}
          <Paper
            elevation={1}
            sx={{ p: 3 }}
            data-testid={PreferencesDialogTestIds.precipitationSection}
          >
            <Typography variant="h6" gutterBottom>
              🌧️ Precipitation
            </Typography>

            <Box sx={{ mt: 2 }}>
              <FormLabel>Ideal Rain Chance (max %)</FormLabel>
              <Slider
                value={localPreferences.precipitation.ideal.chanceMax}
                onChange={(_, value) => {
                  updateLocalPreference("precipitation", {
                    ...localPreferences.precipitation,
                    ideal: {
                      ...localPreferences.precipitation.ideal,
                      chanceMax: value as number,
                    },
                  });
                }}
                valueLabelDisplay="auto"
                min={0}
                max={50}
                marks={[
                  { value: 0, label: "0%" },
                  { value: 25, label: "25%" },
                  { value: 50, label: "50%" },
                ]}
              />
            </Box>

            <Box sx={{ mt: 3 }}>
              <FormLabel>Poor Rain Chance (min %)</FormLabel>
              <Slider
                value={localPreferences.precipitation.poor.chanceMin}
                onChange={(_, value) => {
                  updateLocalPreference("precipitation", {
                    ...localPreferences.precipitation,
                    poor: {
                      ...localPreferences.precipitation.poor,
                      chanceMin: value as number,
                    },
                  });
                }}
                valueLabelDisplay="auto"
                min={30}
                max={100}
                marks={[
                  { value: 50, label: "50%" },
                  { value: 75, label: "75%" },
                  { value: 100, label: "100%" },
                ]}
              />
            </Box>
          </Paper>

          {/* Wind Settings */}
          <Paper
            elevation={1}
            sx={{ p: 3 }}
            data-testid={PreferencesDialogTestIds.windSection}
          >
            <Typography variant="h6" gutterBottom>
              💨 Wind Speed (km/h)
            </Typography>

            <Box sx={{ mt: 2 }}>
              <FormLabel>Ideal Wind Speed (max)</FormLabel>
              <Slider
                value={localPreferences.wind.ideal.max}
                onChange={(_, value) => {
                  updateLocalPreference("wind", {
                    ...localPreferences.wind,
                    ideal: { max: value as number },
                  });
                }}
                valueLabelDisplay="auto"
                min={0}
                max={40}
                marks={[
                  { value: 0, label: "0" },
                  { value: 20, label: "20" },
                  { value: 40, label: "40" },
                ]}
              />
            </Box>

            <Box sx={{ mt: 3 }}>
              <FormLabel>Poor Wind Speed (min)</FormLabel>
              <Slider
                value={localPreferences.wind.poor.min}
                onChange={(_, value) => {
                  updateLocalPreference("wind", {
                    ...localPreferences.wind,
                    poor: { min: value as number },
                  });
                }}
                valueLabelDisplay="auto"
                min={20}
                max={80}
                marks={[
                  { value: 30, label: "30" },
                  { value: 50, label: "50" },
                  { value: 80, label: "80" },
                ]}
              />
            </Box>
          </Paper>

          {/* Humidity Settings */}
          <Paper
            elevation={1}
            sx={{ p: 3 }}
            data-testid={PreferencesDialogTestIds.humiditySection}
          >
            <Typography variant="h6" gutterBottom>
              💧 Humidity (%)
            </Typography>

            <Box sx={{ mt: 2 }}>
              <FormLabel>Ideal Humidity Range</FormLabel>
              <Slider
                value={[
                  localPreferences.humidity.ideal.min,
                  localPreferences.humidity.ideal.max,
                ]}
                onChange={(_, value) => {
                  const [min, max] = value as number[];
                  updateLocalPreference("humidity", {
                    ...localPreferences.humidity,
                    ideal: { min, max },
                  });
                }}
                valueLabelDisplay="auto"
                min={0}
                max={100}
                marks={[
                  { value: 0, label: "0%" },
                  { value: 50, label: "50%" },
                  { value: 100, label: "100%" },
                ]}
              />
            </Box>
          </Paper>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleReset}
          color="warning"
          data-testid={PreferencesDialogTestIds.resetButton}
        >
          Reset to Defaults
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          onClick={handleCancel}
          data-testid={PreferencesDialogTestIds.cancelButton}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          data-testid={PreferencesDialogTestIds.saveButton}
        >
          Save Preferences
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PreferencesDialog;
