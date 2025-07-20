import { describe, it, expect } from "vitest";
import {
  calculateCondition,
  calculateDetailedCondition,
} from "../../utils/conditionCalculator";
import { DEFAULT_PREFERENCES } from "../../types/custom/preferences";
import type { WeatherForecastDto } from "../../types";

describe("conditionCalculator", () => {
  const createMockForecast = (
    overrides?: Partial<WeatherForecastDto>
  ): WeatherForecastDto => ({
    date: "2024-01-15",
    maxTemperature: 25,
    minTemperature: 18,
    precipitationChance: 10,
    precipitationAmount: 0.5,
    humidity: 55,
    windSpeed: 15,
    windDirection: 180,
    condition: {
      type: "ideal",
      description: "Perfect weather",
      score: 85,
      reasons: ["Great temperature", "Low rain chance"],
    },
    ...overrides,
  });

  describe("calculateCondition", () => {
    it('should return "ideal" for perfect weather conditions', () => {
      const forecast = createMockForecast({
        maxTemperature: 24,
        minTemperature: 20, // Average: 22°C (within ideal range)
        precipitationChance: 5, // Low rain chance
        precipitationAmount: 0.1, // Minimal precipitation
        humidity: 60, // Comfortable humidity
        windSpeed: 10, // Light wind
      });

      const result = calculateCondition(forecast, DEFAULT_PREFERENCES);
      expect(result).toBe("ideal");
    });

    it('should return "poor" for terrible weather conditions', () => {
      const forecast = createMockForecast({
        maxTemperature: 35,
        minTemperature: 32, // Average: 33.5°C (too hot)
        precipitationChance: 80, // High rain chance
        precipitationAmount: 15, // Heavy precipitation
        humidity: 90, // Too humid
        windSpeed: 40, // Strong wind
      });

      const result = calculateCondition(forecast, DEFAULT_PREFERENCES);
      expect(result).toBe("poor");
    });

    it('should return "fair" for moderate weather conditions', () => {
      const forecast = createMockForecast({
        maxTemperature: 28,
        minTemperature: 25, // Average: 26.5°C (slightly above ideal)
        precipitationChance: 30, // Moderate rain chance
        precipitationAmount: 4, // Light precipitation
        humidity: 75, // Slightly high humidity
        windSpeed: 25, // Moderate wind
      });

      const result = calculateCondition(forecast, DEFAULT_PREFERENCES);
      expect(result).toBe("fair");
    });

    it("should handle cold weather as poor", () => {
      const forecast = createMockForecast({
        maxTemperature: 8,
        minTemperature: 5, // Average: 6.5°C (too cold)
        precipitationChance: 10,
        precipitationAmount: 0.1,
        humidity: 50,
        windSpeed: 10,
      });

      const result = calculateCondition(forecast, DEFAULT_PREFERENCES);
      expect(result).toBe("poor");
    });

    it('should return "unknown" for missing forecast data', () => {
      const result = calculateCondition(null as any, DEFAULT_PREFERENCES);
      expect(result).toBe("unknown");
    });

    it("should handle missing weather data fields gracefully", () => {
      const forecast = createMockForecast({
        maxTemperature: undefined,
        minTemperature: undefined,
        precipitationChance: undefined,
        precipitationAmount: undefined,
        humidity: undefined,
        windSpeed: undefined,
      });

      const result = calculateCondition(forecast, DEFAULT_PREFERENCES);
      // Should use defaults and still return a valid condition
      expect(["ideal", "fair", "poor"]).toContain(result);
    });
  });

  describe("calculateDetailedCondition", () => {
    it("should return detailed condition with reasons and score", () => {
      const forecast = createMockForecast({
        maxTemperature: 24,
        minTemperature: 20,
        precipitationChance: 5,
        precipitationAmount: 0.1,
        humidity: 60,
        windSpeed: 10,
      });

      const result = calculateDetailedCondition(forecast, DEFAULT_PREFERENCES);

      expect(result.type).toBe("ideal");
      expect(result.description).toContain("Perfect");
      expect(result.score).toBeGreaterThanOrEqual(85);
      expect(result.reasons).toContain("Ideal temperature (22°C)");
      expect(result.reasons).toContain("Low rain chance (5%)");
      expect(result.reasons).toContain("Light breeze (10 km/h)");
    });

    it("should provide specific reasons for poor conditions", () => {
      const forecast = createMockForecast({
        maxTemperature: 5,
        minTemperature: 2, // Average: 3.5°C (poor temperature)
        precipitationChance: 75, // High rain chance
        precipitationAmount: 12, // Heavy rain
        windSpeed: 45, // Strong wind
      });

      const result = calculateDetailedCondition(forecast, DEFAULT_PREFERENCES);

      expect(result.type).toBe("poor");
      expect(result.score).toBeLessThan(60);
      expect(result.reasons).toContain("Poor temperature (4°C)");
      expect(result.reasons).toContain("High rain chance (75%)");
      expect(result.reasons).toContain("Heavy rain (12mm)");
      expect(result.reasons).toContain("Strong wind (45 km/h)");
    });

    it("should handle null forecast gracefully", () => {
      const result = calculateDetailedCondition(
        null as any,
        DEFAULT_PREFERENCES
      );

      expect(result.type).toBe("unknown");
      expect(result.description).toBe("No weather data available");
      expect(result.score).toBe(0);
      expect(result.reasons).toEqual(["No data"]);
    });

    it("should respect custom user preferences", () => {
      const customPreferences = {
        ...DEFAULT_PREFERENCES,
        temperature: {
          ideal: { min: 15, max: 20 }, // Cooler preference
          poor: { min: 5, max: 25 },
        },
      };

      const forecast = createMockForecast({
        maxTemperature: 19,
        minTemperature: 16, // Average: 17.5°C (ideal for custom prefs, fair for default)
      });

      const defaultResult = calculateDetailedCondition(
        forecast,
        DEFAULT_PREFERENCES
      );
      const customResult = calculateDetailedCondition(
        forecast,
        customPreferences
      );

      // With custom preferences, this should be ideal
      expect(customResult.reasons).toContain("Ideal temperature (18°C)");
      // With default preferences, this might not be ideal temperature
      expect(customResult.score).toBeGreaterThanOrEqual(defaultResult.score);
    });
  });
});
