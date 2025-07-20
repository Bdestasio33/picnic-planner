import { Paper, Typography, Box, Stack, Skeleton, Button } from "@mui/material";
import {
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { useState } from "react";
import { useGetApiWeatherForecast } from "../hooks/weather/weather";
import PicnicCalendar from "./PicnicCalendar";
import CitySelectionDialog from "./CitySelectionDialog";
import PreferencesDialog from "./PreferencesDialog";

const WeatherDashboard = () => {
  // Location state management
  const [location, setLocation] = useState({
    city: "New York",
    state: "NY",
    country: "USA",
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  // API call with dynamic location
  const { data, isLoading, error } = useGetApiWeatherForecast({
    City: location.city,
    State: location.state || undefined,
    Country: location.country || undefined,
  });

  const handleLocationChange = (newLocation: {
    city: string;
    state?: string;
    country?: string;
  }) => {
    setLocation({
      city: newLocation.city,
      state: newLocation.state || "",
      country: newLocation.country || "",
    });
  };

  if (isLoading) {
    return (
      <Box
        sx={styles.mainContainer}
        data-testid={WeatherDashboardTestIds.mainContainer}
      >
        <Skeleton
          variant="rectangular"
          width="100%"
          height="400px"
          sx={styles.skeleton}
          data-testid={WeatherDashboardTestIds.loadingSkeleton}
        >
          <Typography
            variant="h6"
            data-testid={WeatherDashboardTestIds.loadingText}
          >
            Loading weather data...
          </Typography>
        </Skeleton>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={styles.mainContainer}
        data-testid={WeatherDashboardTestIds.mainContainer}
      >
        <Paper
          elevation={3}
          sx={styles.errorPaper}
          data-testid={WeatherDashboardTestIds.errorPaper}
        >
          <Typography
            variant="h6"
            color="error"
            gutterBottom
            data-testid={WeatherDashboardTestIds.errorTitle}
          >
            Error Loading Weather Data
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={styles.errorMessage}
            data-testid={WeatherDashboardTestIds.errorMessage}
          >
            Unable to fetch weather information for {location.city}
          </Typography>
          <Button
            variant="contained"
            onClick={() => setDialogOpen(true)}
            startIcon={<EditIcon />}
            data-testid={WeatherDashboardTestIds.tryDifferentLocationButton}
          >
            Try Different Location
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={styles.mainContainer}
      data-testid={WeatherDashboardTestIds.mainContainer}
    >
      <Stack spacing={3} sx={styles.cardContainer}>
        {/* Location Header with Change Button */}
        <Paper
          elevation={2}
          sx={styles.locationPaper}
          data-testid={WeatherDashboardTestIds.locationPaper}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <LocationIcon
                color="primary"
                data-testid={WeatherDashboardTestIds.locationIcon}
              />
              <Typography
                variant="h6"
                data-testid={WeatherDashboardTestIds.locationName}
              >
                {data?.location?.name}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<SettingsIcon />}
                onClick={() => setPreferencesOpen(true)}
                data-testid={WeatherDashboardTestIds.settingsButton}
              >
                Settings
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => setDialogOpen(true)}
                data-testid={WeatherDashboardTestIds.changeLocationButton}
              >
                Change Location
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Picnic Calendar */}
        <PicnicCalendar
          weatherData={data?.forecasts || []}
          location={location}
          data-testid={WeatherDashboardTestIds.picnicCalendar}
        />

        {/* Location Details Card */}
        <Paper
          elevation={2}
          sx={styles.detailsPaper}
          data-testid={WeatherDashboardTestIds.detailsPaper}
        >
          <Typography
            variant="h6"
            gutterBottom
            textAlign="center"
            data-testid={WeatherDashboardTestIds.detailsTitle}
          >
            Location Details
          </Typography>
          {data?.location ? (
            <Stack spacing={1} alignItems="center">
              <Typography
                variant="body2"
                color="text.secondary"
                data-testid={WeatherDashboardTestIds.latitudeText}
              >
                <strong>Latitude:</strong> {data.location.latitude?.toFixed(4)}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                data-testid={WeatherDashboardTestIds.longitudeText}
              >
                <strong>Longitude:</strong>{" "}
                {data.location.longitude?.toFixed(4)}
              </Typography>
            </Stack>
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              data-testid={WeatherDashboardTestIds.noLocationDataText}
            >
              No location data available
            </Typography>
          )}
        </Paper>
      </Stack>

      {/* City Selection Dialog */}
      <CitySelectionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleLocationChange}
        currentLocation={location}
        data-testid={WeatherDashboardTestIds.citySelectionDialog}
      />

      {/* Preferences Dialog */}
      <PreferencesDialog
        open={preferencesOpen}
        onClose={() => setPreferencesOpen(false)}
      />
    </Box>
  );
};

export default WeatherDashboard;

const styles = {
  mainContainer: {
    width: "100%",
    maxWidth: 1200,
    mx: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    p: 2,
  },
  cardContainer: {
    width: "100%",
    alignItems: "center",
  },
  skeleton: {
    borderRadius: "12px",
  },
  errorPaper: {
    p: 4,
    textAlign: "center",
    width: "100%",
    borderRadius: "12px",
  },
  errorMessage: {
    mb: 3,
  },
  locationPaper: {
    p: 3,
    width: "100%",
    borderRadius: "12px",
  },
  detailsPaper: {
    p: 3,
    width: "100%",
    borderRadius: "12px",
  },
};

export const WeatherDashboardTestIds = {
  mainContainer: "weather-dashboard-main-container",
  loadingSkeleton: "weather-dashboard-loading-skeleton",
  loadingText: "weather-dashboard-loading-text",
  errorPaper: "weather-dashboard-error-paper",
  errorTitle: "weather-dashboard-error-title",
  errorMessage: "weather-dashboard-error-message",
  tryDifferentLocationButton: "weather-dashboard-try-different-location-button",
  locationPaper: "weather-dashboard-location-paper",
  locationIcon: "weather-dashboard-location-icon",
  locationName: "weather-dashboard-location-name",
  settingsButton: "weather-dashboard-settings-button",
  changeLocationButton: "weather-dashboard-change-location-button",
  picnicCalendar: "weather-dashboard-picnic-calendar",
  detailsPaper: "weather-dashboard-details-paper",
  detailsTitle: "weather-dashboard-details-title",
  latitudeText: "weather-dashboard-latitude-text",
  longitudeText: "weather-dashboard-longitude-text",
  noLocationDataText: "weather-dashboard-no-location-data-text",
  citySelectionDialog: "weather-dashboard-city-selection-dialog",
};
