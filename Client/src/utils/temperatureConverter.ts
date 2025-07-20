import { TEMPERATURE_UNIT, type TemperatureUnit } from "../types";

export const convertTemperature = (
  celsius: number | undefined,
  unit: TemperatureUnit
): string => {
  if (celsius === undefined) return "N/A";

  if (unit === "fahrenheit") {
    const fahrenheit = (celsius * 9) / 5 + 32;
    return `${fahrenheit.toFixed(1)}°F`;
  }
  return `${celsius}°C`;
}; 

/**
 * Display temperature with proper fallback for undefined values
 * Shows "--" instead of "N/A" for better UI appearance
 */
export const displayTemperature = (
  celsius: number | undefined | null,
  unit: TemperatureUnit
): string => {
  if (celsius === undefined || celsius === null) return "--";

  if (unit === "fahrenheit") {
    const fahrenheit = (celsius * 9) / 5 + 32;
    return `${fahrenheit.toFixed(1)}°F`;
  }
  return `${celsius.toFixed(1)}°C`;
};

/**
 * Display temperature range (high/low) with proper fallbacks
 */
export const displayTemperatureRange = (
  maxCelsius: number | undefined | null,
  minCelsius: number | undefined | null,
  unit: TemperatureUnit
): string => {
  const maxTemp = displayTemperature(maxCelsius, unit);
  const minTemp = displayTemperature(minCelsius, unit);
  return `${maxTemp} / ${minTemp}`;
};

/**
 * Convert Celsius to display unit
 */
export const celsiusToDisplayUnit = (
  celsius: number,
  unit: TemperatureUnit
): number => {
  if (unit === "fahrenheit") {
    return (celsius * 9) / 5 + 32;
  }
  return celsius;
};

/**
 * Convert from display unit back to Celsius for storage
 */
export const displayUnitToCelsius = (
  temperature: number,
  unit: TemperatureUnit
): number => {
  if (unit === "fahrenheit") {
    return ((temperature - 32) * 5) / 9;
  }
  return temperature;
};

/**
 * Get appropriate temperature ranges for sliders based on unit
 */
export const getTemperatureSliderConfig = (unit: TemperatureUnit) => {
  if (unit === "fahrenheit") {
    return {
      idealRange: { min: 14, max: 104 }, // -10°C to 40°C in Fahrenheit
      poorColdRange: { min: 14, max: 77 }, // -10°C to 25°C in Fahrenheit  
      poorHotRange: { min: 77, max: 113 }, // 25°C to 45°C in Fahrenheit
      marks: {
        ideal: [
          { value: 32, label: "32°F" }, // 0°C
          { value: 68, label: "68°F" }, // 20°C
          { value: 104, label: "104°F" }, // 40°C
        ],
        poorCold: [
          { value: 32, label: "32°F" }, // 0°C
          { value: 59, label: "59°F" }, // 15°C
        ],
        poorHot: [
          { value: 86, label: "86°F" }, // 30°C
          { value: 104, label: "104°F" }, // 40°C
        ],
      },
    };
  }
  
  return {
    idealRange: { min: -10, max: 40 },
    poorColdRange: { min: -10, max: 25 },
    poorHotRange: { min: 25, max: 45 },
    marks: {
      ideal: [
        { value: 0, label: "0°C" },
        { value: 20, label: "20°C" },
        { value: 40, label: "40°C" },
      ],
      poorCold: [
        { value: 0, label: "0°C" },
        { value: 15, label: "15°C" },
      ],
      poorHot: [
        { value: 30, label: "30°C" },
        { value: 40, label: "40°C" },
      ],
    },
  };
};

/**
 * Convert temperature value for calculations
 * @param {number | undefined | null} celsius - Temperature in Celsius
 * @param {TemperatureUnit} unit - Target temperature unit to convert to
 * @returns {number} Converted temperature value (returns 0 if input is undefined/null)
 */
export const convertTemperatureValue = (
  celsius: number | undefined | null,
  unit: TemperatureUnit
): number => {
  if (celsius === undefined || celsius === null) return 0;

  if (unit === TEMPERATURE_UNIT.FAHRENHEIT) {
    return (celsius * 9) / 5 + 32;
  }
  return celsius;
}; 