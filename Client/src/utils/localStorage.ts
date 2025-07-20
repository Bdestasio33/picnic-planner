import type { UserPreferences } from '../types/custom/preferences';
import { DEFAULT_PREFERENCES, PREFERENCES_STORAGE_KEY } from '../types/custom/preferences';

/**
 * Safely parse JSON from localStorage
 */
const safeParseJSON = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn('Failed to parse JSON from localStorage:', error);
    return fallback;
  }
};

/**
 * Safely write JSON to localStorage
 */
const safeStringifyJSON = <T>(value: T): string | null => {
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.warn('Failed to stringify JSON for localStorage:', error);
    return null;
  }
};

/**
 * Check if localStorage is available
 */
const isLocalStorageAvailable = (): boolean => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * Load user preferences from localStorage with fallback to defaults
 */
export const loadPreferences = (): UserPreferences => {
  if (!isLocalStorageAvailable()) {
    return DEFAULT_PREFERENCES;
  }

  const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY);
  const parsed = safeParseJSON(stored, DEFAULT_PREFERENCES);
  
  // Merge with defaults to ensure all properties exist (for backward compatibility)
  return {
    ...DEFAULT_PREFERENCES,
    ...parsed,
    temperature: { ...DEFAULT_PREFERENCES.temperature, ...parsed.temperature },
    precipitation: { ...DEFAULT_PREFERENCES.precipitation, ...parsed.precipitation },
    wind: { ...DEFAULT_PREFERENCES.wind, ...parsed.wind },
    humidity: { ...DEFAULT_PREFERENCES.humidity, ...parsed.humidity },
  };
};

/**
 * Save user preferences to localStorage
 */
export const savePreferences = (preferences: UserPreferences): boolean => {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage not available, preferences not saved');
    return false;
  }

  const serialized = safeStringifyJSON(preferences);
  if (!serialized) {
    return false;
  }

  try {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, serialized);
    return true;
  } catch (error) {
    console.warn('Failed to save preferences to localStorage:', error);
    return false;
  }
};

/**
 * Clear user preferences from localStorage
 */
export const clearPreferences = (): boolean => {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    localStorage.removeItem(PREFERENCES_STORAGE_KEY);
    return true;
  } catch (error) {
    console.warn('Failed to clear preferences from localStorage:', error);
    return false;
  }
}; 