/**
 * Custom weather-related types for the application
 * These types are separate from auto-generated API types to avoid conflicts
 */

export enum TEMPERATURE_UNIT {
  CELSIUS = "celsius",
  FAHRENHEIT = "fahrenheit",
}

export type TemperatureUnit = (typeof TEMPERATURE_UNIT)[keyof typeof TEMPERATURE_UNIT];

/**
 * Temperature display format for UI components
 */
export type TemperatureDisplayUnit = "C" | "F";

/**
 * Weather condition types for UI display
 */
export type WeatherConditionType = "ideal" | "fair" | "poor" | "unknown";

/**
 * Location information for weather queries
 */
export interface LocationInfo {
  city: string;
  state?: string;
  country?: string;
}

/**
 * Condition chip configuration for UI components
 */
export interface ConditionChip {
  label: string;
  color: "error" | "warning" | "success" | "default";
}

/**
 * Weather condition color mapping
 */
export const CONDITION_COLORS = {
  ideal: "#4caf50",   // Green
  fair: "#ff9800",    // Orange  
  poor: "#f44336",    // Red
  default: "#2196f3", // Blue
} as const;

export type ConditionColorKey = keyof typeof CONDITION_COLORS; 