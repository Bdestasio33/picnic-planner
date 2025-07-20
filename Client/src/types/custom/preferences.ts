/**
 * User preferences for weather condition thresholds
 */

export interface TemperatureThresholds {
  ideal: {
    min: number; // Minimum ideal temperature (°C)
    max: number; // Maximum ideal temperature (°C)
  };
  poor: {
    min: number; // Below this is poor (too cold)
    max: number; // Above this is poor (too hot)
  };
}

export interface PrecipitationThresholds {
  ideal: {
    chanceMax: number; // Maximum rain chance for ideal (%)
    amountMax: number; // Maximum precipitation amount for ideal (mm)
  };
  poor: {
    chanceMin: number; // Above this chance is poor (%)
    amountMin: number; // Above this amount is poor (mm)
  };
}

export interface WindThresholds {
  ideal: {
    max: number; // Maximum wind speed for ideal (km/h)
  };
  poor: {
    min: number; // Above this speed is poor (km/h)
  };
}

export interface HumidityThresholds {
  ideal: {
    min: number; // Minimum humidity for ideal (%)
    max: number; // Maximum humidity for ideal (%)
  };
  poor: {
    min: number; // Below this is poor (too dry)
    max: number; // Above this is poor (too humid)
  };
}

/**
 * Complete user preferences for weather conditions
 */
export interface UserPreferences {
  temperature: TemperatureThresholds;
  precipitation: PrecipitationThresholds;
  wind: WindThresholds;
  humidity: HumidityThresholds;
  temperatureUnit: 'celsius' | 'fahrenheit';
}

/**
 * Default preferences matching current hardcoded logic
 * Ideal: 18-26°C, <20% rain, <2mm precipitation, <20 km/h wind, 40-70% humidity
 * Poor: <10°C or >30°C, >60% rain, >10mm precipitation, >35 km/h wind, <30% or >80% humidity
 */
export const DEFAULT_PREFERENCES: UserPreferences = {
  temperature: {
    ideal: { min: 18, max: 26 },
    poor: { min: 10, max: 30 }
  },
  precipitation: {
    ideal: { chanceMax: 20, amountMax: 2 },
    poor: { chanceMin: 60, amountMin: 10 }
  },
  wind: {
    ideal: { max: 20 },
    poor: { min: 35 }
  },
  humidity: {
    ideal: { min: 40, max: 70 },
    poor: { min: 30, max: 80 }
  },
  temperatureUnit: 'celsius'
};

/**
 * Storage key for user preferences in localStorage
 */
export const PREFERENCES_STORAGE_KEY = 'picnic-planner-preferences'; 