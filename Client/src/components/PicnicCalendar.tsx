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

interface DayData {
  forecast: WeatherForecastDto;
  color: string;
}

interface PicnicCalendarProps {
  weatherData: WeatherForecastDto[];
  location: LocationInfo;
}

interface CalendarDayProps extends PickersDayProps {
  weatherData?: DayData;
  picnicColor?: string;
}

/**
 * A component that displays a day in the calendar with custom colors for picnic outlook.
 *
 * @param {CalendarDayProps} props
 */
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

  // Display color of the condition of a picnic day (red, yellow, green)
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

/**
 * A component that displays a calendar of weather data.
 *
 * @param {PicnicCalendarProps} props
 */
const PicnicCalendar = ({ weatherData, location }: PicnicCalendarProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedDate, setSelectedDate] = React.useState<Dayjs | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // Create a map of date string to weather data for fast lookup
  const weatherMap = useMemo(() => {
    const map: { [key: string]: DayData } = {};
    weatherData.forEach((forecast) => {
      const dateKey = dayjs(forecast.date).format("YYYY-MM-DD");
      map[dateKey] = {
        forecast,
        // Use API-provided condition colors
        color: getConditionColor(forecast.condition?.type),
      };
    });
    return map;
  }, [weatherData]);

  // Find the selected forecast data
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

  // Calculate date range (today + 13 days = 14 days total)
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

      {/* Weather Detail Dialog */}
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
