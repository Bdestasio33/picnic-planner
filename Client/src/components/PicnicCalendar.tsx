import React, { useMemo } from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import type { PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import dayjs, { Dayjs } from "dayjs";
import type { LocationInfo, WeatherForecastDto } from "../types";
import { getConditionColor } from "../utils/conditionColors";
import { WeatherDetailDialog } from "./WeatherDetailDialog";
import type { WeatherScoringSettings } from "./WeatherSettingsDialog";

interface DayData {
  forecast: WeatherForecastDto;
  color: string;
}

interface PicnicCalendarProps {
  weatherData: WeatherForecastDto[];
  location: LocationInfo;
  weatherSettings?: WeatherScoringSettings | null;
}

interface CalendarDayProps extends PickersDayProps {
  weatherData?: DayData;
  picnicColor?: string;
}

const CalendarDay = (props: CalendarDayProps) => {
  const {
    weatherData,
    picnicColor,
    day,
    onDaySelect,
    outsideCurrentMonth,
    isFirstVisibleCell,
    isLastVisibleCell,
    ...other
  } = props;
  const theme = useTheme();

  const dayStyle = picnicColor
    ? {
        backgroundColor: picnicColor,
        "&:hover": {
          backgroundColor: picnicColor,
        },
      }
    : {};

  return (
    <PickersDay
      {...other}
      day={day}
      onDaySelect={onDaySelect}
      outsideCurrentMonth={outsideCurrentMonth}
      isFirstVisibleCell={isFirstVisibleCell}
      isLastVisibleCell={isLastVisibleCell}
      data-testid={`${PicnicCalendarTestIds.calendarDay}-${day.format("YYYY-MM-DD")}`}
      sx={{
        borderRadius: "50%",
        border: `2px solid ${picnicColor || theme.palette.primary.main}`,
        color: "white",
        fontWeight: "bold",
        fontSize: "0.875rem",
        ...dayStyle,
      }}
    />
  );
};

const PicnicCalendar = ({
  weatherData,
  location,
  weatherSettings,
}: PicnicCalendarProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedDate, setSelectedDate] = React.useState<Dayjs | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // Function to recalculate weather condition based on custom settings
  const recalculateCondition = (
    forecast: WeatherForecastDto
  ): WeatherForecastDto => {
    // Use default reasonable limits if no custom settings
    const limits = weatherSettings || {
      minTemperature: 10,
      maxTemperature: 35,
      maxWindSpeed: 30,
      maxPrecipitationChance: 40,
    };

    // Simple client-side scoring using limits
    const maxTemp = forecast.maxTemperature ?? 20;
    const minTemp = forecast.minTemperature ?? 15;
    const avgTemp = (maxTemp + minTemp) / 2;

    const tempOk =
      avgTemp >= limits.minTemperature && avgTemp <= limits.maxTemperature;
    const windOk = (forecast.windSpeed || 0) <= limits.maxWindSpeed;
    const precipOk =
      (forecast.precipitationChance ?? 0) <= limits.maxPrecipitationChance;

    let conditionType = "poor";
    let description = "Poor picnic conditions";
    let score = 35;

    if (tempOk && windOk && precipOk) {
      conditionType = "ideal";
      description = "Excellent picnic conditions!";
      score = 85;
    } else if (tempOk && (windOk || precipOk)) {
      conditionType = "fair";
      description = "Good picnic conditions with minor concerns";
      score = 65;
    } else if (tempOk || windOk || precipOk) {
      conditionType = "fair";
      description = "Acceptable picnic conditions";
      score = 55;
    }

    return {
      ...forecast,
      condition: {
        ...forecast.condition,
        type: conditionType,
        description,
        score,
      },
    };
  };

  const weatherMap = useMemo(() => {
    const map: { [key: string]: DayData } = {};
    weatherData.forEach((forecast) => {
      const recalculatedForecast = recalculateCondition(forecast);
      const dateKey = dayjs(forecast.date).format("YYYY-MM-DD");
      map[dateKey] = {
        forecast: recalculatedForecast,
        color: getConditionColor(recalculatedForecast.condition?.type),
      };
    });
    return map;
  }, [weatherData, weatherSettings]);

  const selectedForecast = useMemo(() => {
    if (!selectedDate) return null;
    const dateKey = selectedDate.format("YYYY-MM-DD");
    return weatherMap[dateKey];
  }, [selectedDate, weatherMap]);

  const handleDateClick = (date: Dayjs) => {
    const dateKey = date.format("YYYY-MM-DD");
    const dayData = weatherMap[dateKey];
    if (dayData) {
      setSelectedDate(date);
      setDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedDate(null);
  };

  const today = dayjs();
  const maxDate = today.add(13, "day");

  return (
    <Box sx={styles.container} data-testid={PicnicCalendarTestIds.container}>
      <LocalizationProvider
        dateAdapter={AdapterDayjs}
        data-testid={PicnicCalendarTestIds.localizationProvider}
      >
        <DateCalendar
          value={selectedDate}
          onChange={(newDate) => newDate && handleDateClick(newDate)}
          minDate={today}
          maxDate={maxDate}
          slots={{
            day: CalendarDay,
          }}
          slotProps={{
            day: (ownerState) => {
              const dateKey = ownerState.day.format("YYYY-MM-DD");
              const dayData = weatherMap[dateKey];
              return {
                weatherData: dayData,
                picnicColor: dayData?.color,
              } as any;
            },
          }}
          sx={styles.calendar}
          data-testid={PicnicCalendarTestIds.dateCalendar}
        />
      </LocalizationProvider>

      <WeatherDetailDialog
        dialogOpen={dialogOpen}
        handleCloseDialog={handleCloseDialog}
        isMobile={isMobile}
        selectedDate={selectedDate}
        selectedForecast={selectedForecast?.forecast || null}
        location={location}
        data-testid={PicnicCalendarTestIds.weatherDetailDialog}
      />
    </Box>
  );
};

export default PicnicCalendar;

const styles = {
  container: {
    width: "100%",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
  },
  calendar: {
    width: "100%",
    maxWidth: "400px",
  },
};

export const PicnicCalendarTestIds = {
  container: "picnic-calendar-container",
  localizationProvider: "picnic-calendar-localization-provider",
  dateCalendar: "picnic-calendar-date-calendar",
  calendarDay: "picnic-calendar-day",
  weatherDetailDialog: "picnic-calendar-weather-detail-dialog",
};
