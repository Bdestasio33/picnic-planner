import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Stack,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import { RestoreOutlined as RestoreIcon } from "@mui/icons-material";

interface WeatherSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  onSettingsChange: (settings: WeatherScoringSettings | null) => void;
  currentSettings?: WeatherScoringSettings | null;
}

export interface WeatherScoringSettings {
  minTemperature: number;
  maxTemperature: number;
  maxWindSpeed: number;
  maxPrecipitationChance: number;
}

const defaultSettings: WeatherScoringSettings = {
  minTemperature: 15,
  maxTemperature: 30,
  maxWindSpeed: 25,
  maxPrecipitationChance: 30,
};

const WeatherSettingsDialog: React.FC<WeatherSettingsDialogProps> = ({
  open,
  onClose,
  onSettingsChange,
  currentSettings,
}) => {
  const [settings, setSettings] = useState<WeatherScoringSettings>(
    currentSettings || defaultSettings
  );

  useEffect(() => {
    if (currentSettings) {
      setSettings(currentSettings);
    } else {
      setSettings(defaultSettings);
    }
  }, [currentSettings]);

  const handleApply = () => {
    onSettingsChange(settings);
    onClose();
  };

  const handleReset = () => {
    onSettingsChange(null);
    onClose();
  };

  const handleFieldChange = (
    field: keyof WeatherScoringSettings,
    value: string
  ) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setSettings((prev) => ({ ...prev, [field]: numValue }));
    }
  };

  const isUsingCustomSettings = currentSettings !== null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      data-testid="weather-settings-dialog"
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Weather Preferences</Typography>
          <Tooltip title="Reset to defaults">
            <IconButton onClick={handleReset} size="small">
              <RestoreIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {isUsingCustomSettings && (
            <Alert severity="info">
              Custom weather preferences are active. Reset to use default
              scoring.
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary">
            Set your ideal weather conditions for picnic planning. Leave
            defaults if unsure.
          </Typography>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Temperature Range
            </Typography>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Min Temperature (°C)"
                type="number"
                value={settings.minTemperature}
                onChange={(e) =>
                  handleFieldChange("minTemperature", e.target.value)
                }
                size="small"
                fullWidth
                data-testid="min-temperature-input"
              />
              <TextField
                label="Max Temperature (°C)"
                type="number"
                value={settings.maxTemperature}
                onChange={(e) =>
                  handleFieldChange("maxTemperature", e.target.value)
                }
                size="small"
                fullWidth
                data-testid="max-temperature-input"
              />
            </Stack>
          </Box>

          <TextField
            label="Max Wind Speed (km/h)"
            type="number"
            value={settings.maxWindSpeed}
            onChange={(e) => handleFieldChange("maxWindSpeed", e.target.value)}
            size="small"
            helperText="Wind speeds above this will be marked as poor conditions"
            data-testid="max-wind-speed-input"
          />

          <TextField
            label="Max Precipitation Chance (%)"
            type="number"
            value={settings.maxPrecipitationChance}
            onChange={(e) =>
              handleFieldChange("maxPrecipitationChance", e.target.value)
            }
            size="small"
            helperText="Rain chances above this will be marked as poor conditions"
            inputProps={{ min: 0, max: 100 }}
            data-testid="max-precipitation-input"
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleReset}
          color="secondary"
          data-testid="reset-to-defaults-button"
        >
          Reset to Defaults
        </Button>
        <Button
          onClick={handleApply}
          variant="contained"
          data-testid="apply-settings-button"
        >
          Apply Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WeatherSettingsDialog;
