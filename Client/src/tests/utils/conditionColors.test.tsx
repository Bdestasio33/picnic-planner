import { describe, it, expect } from "vitest";
import { getConditionColor } from "../../utils/conditionColors";
import { CONDITION_COLORS } from "../../types/custom/weather";

describe("getConditionColor", () => {
  describe("valid condition types", () => {
    it("should return correct color for ideal condition", () => {
      expect(getConditionColor("ideal")).toBe(CONDITION_COLORS.ideal);
    });

    it("should return correct color for fair condition", () => {
      expect(getConditionColor("fair")).toBe(CONDITION_COLORS.fair);
    });

    it("should return correct color for poor condition", () => {
      expect(getConditionColor("poor")).toBe(CONDITION_COLORS.poor);
    });
  });

  describe("case insensitivity", () => {
    it("should handle uppercase condition types", () => {
      expect(getConditionColor("IDEAL")).toBe(CONDITION_COLORS.ideal);
      expect(getConditionColor("FAIR")).toBe(CONDITION_COLORS.fair);
      expect(getConditionColor("POOR")).toBe(CONDITION_COLORS.poor);
    });

    it("should handle mixed case condition types", () => {
      expect(getConditionColor("IdEaL")).toBe(CONDITION_COLORS.ideal);
      expect(getConditionColor("FaIr")).toBe(CONDITION_COLORS.fair);
      expect(getConditionColor("PoOr")).toBe(CONDITION_COLORS.poor);
    });
  });

  describe("fallback behavior", () => {
    it("should return default color for unknown condition type", () => {
      expect(getConditionColor("unknown")).toBe(CONDITION_COLORS.default);
      expect(getConditionColor("invalid")).toBe(CONDITION_COLORS.default);
      expect(getConditionColor("random")).toBe(CONDITION_COLORS.default);
    });

    it("should return default color for undefined input", () => {
      expect(getConditionColor(undefined)).toBe(CONDITION_COLORS.default);
    });

    it("should return default color for null input", () => {
      expect(getConditionColor(null)).toBe(CONDITION_COLORS.default);
    });

    it("should return default color for empty string", () => {
      expect(getConditionColor("")).toBe(CONDITION_COLORS.default);
    });
  });

  describe("exact color values", () => {
    it("should return exact hex color values", () => {
      expect(getConditionColor("ideal")).toBe("#4caf50");
      expect(getConditionColor("fair")).toBe("#ff9800");
      expect(getConditionColor("poor")).toBe("#f44336");
      expect(getConditionColor("invalid")).toBe("#2196f3");
    });
  });
});
