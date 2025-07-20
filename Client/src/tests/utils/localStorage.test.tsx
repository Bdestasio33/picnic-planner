import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  loadPreferences,
  savePreferences,
  clearPreferences,
} from "../../utils/localStorage";
import {
  DEFAULT_PREFERENCES,
  PREFERENCES_STORAGE_KEY,
} from "../../types/custom/preferences";

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

describe("localStorage utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default successful behavior for localStorage operations
    mockLocalStorage.setItem.mockImplementation(() => {});
    mockLocalStorage.removeItem.mockImplementation(() => {});
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe("loadPreferences", () => {
    it("should return default preferences when no stored data exists", () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = loadPreferences();

      expect(result).toEqual(DEFAULT_PREFERENCES);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
        PREFERENCES_STORAGE_KEY
      );
    });

    it("should merge stored preferences with defaults", () => {
      const storedPreferences = {
        temperature: {
          ideal: { min: 20, max: 28 },
        },
      };
      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify(storedPreferences)
      );

      const result = loadPreferences();

      expect(result.temperature.ideal).toEqual({ min: 20, max: 28 });
      expect(result.precipitation).toEqual(DEFAULT_PREFERENCES.precipitation);
    });

    it("should handle invalid JSON gracefully", () => {
      mockLocalStorage.getItem.mockReturnValue("invalid json");
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const result = loadPreferences();

      expect(result).toEqual(DEFAULT_PREFERENCES);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("savePreferences", () => {
    it("should save preferences to localStorage", () => {
      const preferences = {
        ...DEFAULT_PREFERENCES,
        temperature: { ideal: { min: 20, max: 28 }, poor: { min: 5, max: 35 } },
      };

      const result = savePreferences(preferences);

      expect(result).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        PREFERENCES_STORAGE_KEY,
        JSON.stringify(preferences)
      );
    });

    it("should handle localStorage errors", () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error("Storage full");
      });
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const result = savePreferences(DEFAULT_PREFERENCES);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("clearPreferences", () => {
    it("should remove preferences from localStorage", () => {
      const result = clearPreferences();

      expect(result).toBe(true);

      // The function calls removeItem twice:
      // 1. Once for the availability test key
      // 2. Once for the actual preferences key
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        "__localStorage_test__"
      );
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        PREFERENCES_STORAGE_KEY
      );
      expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(2);
    });

    it("should handle removal errors", () => {
      // Set up the mock to throw an error for the preferences key removal
      mockLocalStorage.removeItem.mockImplementation((key) => {
        if (key === PREFERENCES_STORAGE_KEY) {
          throw new Error("Access denied");
        }
        // Allow the test key removal to succeed for isLocalStorageAvailable check
      });

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const result = clearPreferences();

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to clear preferences from localStorage:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });
});
