import { CONDITION_COLORS, type WeatherConditionType } from "../types/custom/weather";
import type { WeatherForecastDto, UserPreferences } from "../types";
import { calculateCondition } from "./conditionCalculator";

/**
 * Maps weather condition types to their corresponding colors
 * @param type - The condition type (ideal, fair, poor, etc.)
 * @returns The hex color code for the condition
 */
export const getConditionColor = (type?: string | null): string => {
  const conditionType = type?.toLowerCase() as WeatherConditionType;
  
  switch (conditionType) {
    case "ideal":
      return CONDITION_COLORS.ideal;
    case "fair":
      return CONDITION_COLORS.fair;
    case "poor":
      return CONDITION_COLORS.poor;
    default:
      return CONDITION_COLORS.default;
  }
};

/**
 * Gets condition color based on user preferences calculation
 * @param forecast - Weather forecast data
 * @param preferences - User preferences for condition calculation
 * @returns The hex color code for the calculated condition
 */
export const getConditionColorFromPreferences = (
  forecast: WeatherForecastDto,
  preferences: UserPreferences
): string => {
  const calculatedCondition = calculateCondition(forecast, preferences);
  return getConditionColor(calculatedCondition);
}; 