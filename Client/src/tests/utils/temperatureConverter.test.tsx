import { describe, it, expect } from "vitest";
import {
  convertTemperature,
  displayTemperature,
  displayTemperatureRange,
  convertTemperatureValue,
} from "../../utils/temperatureConverter";
import { TEMPERATURE_UNIT } from "../../types/custom/weather";

describe("convertTemperature", () => {
  describe("celsius conversion", () => {
    it("should return temperature in celsius format", () => {
      expect(convertTemperature(20, TEMPERATURE_UNIT.CELSIUS)).toBe("20°C");
      expect(convertTemperature(0, TEMPERATURE_UNIT.CELSIUS)).toBe("0°C");
      expect(convertTemperature(-10, TEMPERATURE_UNIT.CELSIUS)).toBe("-10°C");
    });
  });

  describe("fahrenheit conversion", () => {
    it("should convert celsius to fahrenheit correctly", () => {
      expect(convertTemperature(0, TEMPERATURE_UNIT.FAHRENHEIT)).toBe("32.0°F");
      expect(convertTemperature(20, TEMPERATURE_UNIT.FAHRENHEIT)).toBe(
        "68.0°F"
      );
      expect(convertTemperature(100, TEMPERATURE_UNIT.FAHRENHEIT)).toBe(
        "212.0°F"
      );
      expect(convertTemperature(-10, TEMPERATURE_UNIT.FAHRENHEIT)).toBe(
        "14.0°F"
      );
    });

    it("should handle decimal temperatures", () => {
      expect(convertTemperature(25.5, TEMPERATURE_UNIT.FAHRENHEIT)).toBe(
        "77.9°F"
      );
      expect(convertTemperature(10.3, TEMPERATURE_UNIT.FAHRENHEIT)).toBe(
        "50.5°F"
      );
    });
  });

  describe("undefined temperature handling", () => {
    it('should return "N/A" for undefined celsius temperature', () => {
      expect(convertTemperature(undefined, TEMPERATURE_UNIT.CELSIUS)).toBe(
        "N/A"
      );
      expect(convertTemperature(undefined, TEMPERATURE_UNIT.FAHRENHEIT)).toBe(
        "N/A"
      );
    });
  });
});

describe("displayTemperature", () => {
  describe("celsius display", () => {
    it("should display temperature in celsius with one decimal place", () => {
      expect(displayTemperature(20, TEMPERATURE_UNIT.CELSIUS)).toBe("20.0°C");
      expect(displayTemperature(25.5, TEMPERATURE_UNIT.CELSIUS)).toBe("25.5°C");
      expect(displayTemperature(0, TEMPERATURE_UNIT.CELSIUS)).toBe("0.0°C");
    });
  });

  describe("fahrenheit display", () => {
    it("should display temperature in fahrenheit with one decimal place", () => {
      expect(displayTemperature(0, TEMPERATURE_UNIT.FAHRENHEIT)).toBe("32.0°F");
      expect(displayTemperature(20, TEMPERATURE_UNIT.FAHRENHEIT)).toBe(
        "68.0°F"
      );
      expect(displayTemperature(25.5, TEMPERATURE_UNIT.FAHRENHEIT)).toBe(
        "77.9°F"
      );
    });
  });

  describe("fallback behavior", () => {
    it('should return "--" for undefined temperature', () => {
      expect(displayTemperature(undefined, TEMPERATURE_UNIT.CELSIUS)).toBe(
        "--"
      );
      expect(displayTemperature(undefined, TEMPERATURE_UNIT.FAHRENHEIT)).toBe(
        "--"
      );
    });

    it('should return "--" for null temperature', () => {
      expect(displayTemperature(null, TEMPERATURE_UNIT.CELSIUS)).toBe("--");
      expect(displayTemperature(null, TEMPERATURE_UNIT.FAHRENHEIT)).toBe("--");
    });
  });
});

describe("displayTemperatureRange", () => {
  describe("celsius range display", () => {
    it("should display temperature range in celsius", () => {
      expect(displayTemperatureRange(25, 15, TEMPERATURE_UNIT.CELSIUS)).toBe(
        "25.0°C / 15.0°C"
      );
      expect(displayTemperatureRange(0, -5, TEMPERATURE_UNIT.CELSIUS)).toBe(
        "0.0°C / -5.0°C"
      );
    });
  });

  describe("fahrenheit range display", () => {
    it("should display temperature range in fahrenheit", () => {
      expect(displayTemperatureRange(25, 15, TEMPERATURE_UNIT.FAHRENHEIT)).toBe(
        "77.0°F / 59.0°F"
      );
      expect(displayTemperatureRange(0, -10, TEMPERATURE_UNIT.FAHRENHEIT)).toBe(
        "32.0°F / 14.0°F"
      );
    });
  });

  describe("fallback behavior with undefined/null values", () => {
    it("should handle undefined max temperature", () => {
      expect(
        displayTemperatureRange(undefined, 15, TEMPERATURE_UNIT.CELSIUS)
      ).toBe("-- / 15.0°C");
      expect(
        displayTemperatureRange(undefined, 15, TEMPERATURE_UNIT.FAHRENHEIT)
      ).toBe("-- / 59.0°F");
    });

    it("should handle undefined min temperature", () => {
      expect(
        displayTemperatureRange(25, undefined, TEMPERATURE_UNIT.CELSIUS)
      ).toBe("25.0°C / --");
      expect(
        displayTemperatureRange(25, undefined, TEMPERATURE_UNIT.FAHRENHEIT)
      ).toBe("77.0°F / --");
    });

    it("should handle both temperatures undefined", () => {
      expect(
        displayTemperatureRange(undefined, undefined, TEMPERATURE_UNIT.CELSIUS)
      ).toBe("-- / --");
      expect(
        displayTemperatureRange(
          undefined,
          undefined,
          TEMPERATURE_UNIT.FAHRENHEIT
        )
      ).toBe("-- / --");
    });

    it("should handle null values", () => {
      expect(displayTemperatureRange(null, 15, TEMPERATURE_UNIT.CELSIUS)).toBe(
        "-- / 15.0°C"
      );
      expect(
        displayTemperatureRange(25, null, TEMPERATURE_UNIT.FAHRENHEIT)
      ).toBe("77.0°F / --");
      expect(
        displayTemperatureRange(null, null, TEMPERATURE_UNIT.CELSIUS)
      ).toBe("-- / --");
    });
  });
});

describe("convertTemperatureValue", () => {
  describe("celsius conversion", () => {
    it("should return same value for celsius", () => {
      expect(convertTemperatureValue(20, TEMPERATURE_UNIT.CELSIUS)).toBe(20);
      expect(convertTemperatureValue(0, TEMPERATURE_UNIT.CELSIUS)).toBe(0);
      expect(convertTemperatureValue(-10, TEMPERATURE_UNIT.CELSIUS)).toBe(-10);
      expect(convertTemperatureValue(25.5, TEMPERATURE_UNIT.CELSIUS)).toBe(
        25.5
      );
    });
  });

  describe("fahrenheit conversion", () => {
    it("should convert celsius to fahrenheit value", () => {
      expect(convertTemperatureValue(0, TEMPERATURE_UNIT.FAHRENHEIT)).toBe(32);
      expect(convertTemperatureValue(20, TEMPERATURE_UNIT.FAHRENHEIT)).toBe(68);
      expect(convertTemperatureValue(100, TEMPERATURE_UNIT.FAHRENHEIT)).toBe(
        212
      );
      expect(convertTemperatureValue(-10, TEMPERATURE_UNIT.FAHRENHEIT)).toBe(
        14
      );
    });

    it("should handle decimal temperatures", () => {
      expect(
        convertTemperatureValue(25.5, TEMPERATURE_UNIT.FAHRENHEIT)
      ).toBeCloseTo(77.9);
      expect(
        convertTemperatureValue(10.3, TEMPERATURE_UNIT.FAHRENHEIT)
      ).toBeCloseTo(50.54);
    });
  });

  describe("fallback behavior", () => {
    it("should return 0 for undefined temperature", () => {
      expect(convertTemperatureValue(undefined, TEMPERATURE_UNIT.CELSIUS)).toBe(
        0
      );
      expect(
        convertTemperatureValue(undefined, TEMPERATURE_UNIT.FAHRENHEIT)
      ).toBe(0);
    });

    it("should return 0 for null temperature", () => {
      expect(convertTemperatureValue(null, TEMPERATURE_UNIT.CELSIUS)).toBe(0);
      expect(convertTemperatureValue(null, TEMPERATURE_UNIT.FAHRENHEIT)).toBe(
        0
      );
    });
  });
});
