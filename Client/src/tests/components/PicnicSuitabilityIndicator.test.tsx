import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import PicnicSuitabilityIndicator from "../../components/PicnicSuitabilityIndicator";
import { PreferencesProvider } from "../../contexts/PreferencesContext";
import type { WeatherConditionDto } from "../../types";

// Mock localStorage for PreferencesProvider
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

// Mock the getConditionColor utility
vi.mock("../../utils/conditionColors", () => ({
  getConditionColor: (type?: string | null): string => {
    switch (type?.toLowerCase()) {
      case "ideal":
        return "#4caf50";
      case "fair":
        return "#ff9800";
      case "poor":
        return "#f44336";
      default:
        return "#2196f3";
    }
  },
}));

// Mock theme for Material UI components
const theme = createTheme();

// Helper component to wrap PicnicSuitabilityIndicator with theme and preferences
const PicnicSuitabilityIndicatorWrapper = (props: any) => (
  <PreferencesProvider>
    <ThemeProvider theme={theme}>
      <PicnicSuitabilityIndicator {...props} />
    </ThemeProvider>
  </PreferencesProvider>
);

describe("PicnicSuitabilityIndicator", () => {
  const createMockCondition = (
    type: string = "ideal",
    score: number = 85,
    description: string = "Great weather",
    reasons: string[] = ["Good temperature", "Low precipitation"]
  ): WeatherConditionDto => ({
    type,
    description,
    score,
    reasons,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    cleanup();
  });

  describe("Rendering", () => {
    it("should render the component with basic props", () => {
      const condition = createMockCondition();
      render(<PicnicSuitabilityIndicatorWrapper condition={condition} />);

      expect(screen.getByText("ideal")).toBeInTheDocument();
      expect(screen.getByText("85/100")).toBeInTheDocument();
    });

    it("should render with minimal condition data", () => {
      const condition: WeatherConditionDto = {
        type: "fair",
        score: 60,
      };

      render(<PicnicSuitabilityIndicatorWrapper condition={condition} />);

      expect(screen.getByText("fair")).toBeInTheDocument();
      expect(screen.getByText("60/100")).toBeInTheDocument();
    });

    it("should handle condition with null/undefined values", () => {
      const condition: WeatherConditionDto = {
        type: null,
        score: undefined,
        description: null,
        reasons: null,
      };

      render(<PicnicSuitabilityIndicatorWrapper condition={condition} />);

      expect(screen.getByText("Unknown")).toBeInTheDocument();
      expect(screen.getByText("0/100")).toBeInTheDocument();
    });

    it("should render without details accordion by default", () => {
      const condition = createMockCondition();
      render(<PicnicSuitabilityIndicatorWrapper condition={condition} />);

      expect(
        screen.queryByText("View detailed conditions")
      ).not.toBeInTheDocument();
    });
  });

  describe("Condition Types", () => {
    it("should display ideal condition correctly", () => {
      const condition = createMockCondition("ideal", 95);
      render(<PicnicSuitabilityIndicatorWrapper condition={condition} />);

      const chip = screen.getByText("ideal");
      expect(chip).toBeInTheDocument();

      // Check for CheckCircle icon (ideal condition)
      const checkIcon = screen.getByTestId("CheckCircleIcon");
      expect(checkIcon).toBeInTheDocument();
    });

    it("should display fair condition correctly", () => {
      const condition = createMockCondition("fair", 70);
      render(<PicnicSuitabilityIndicatorWrapper condition={condition} />);

      const chip = screen.getByText("fair");
      expect(chip).toBeInTheDocument();

      // Check for Warning icon (fair condition)
      const warningIcon = screen.getByTestId("WarningIcon");
      expect(warningIcon).toBeInTheDocument();
    });

    it("should display poor condition correctly", () => {
      const condition = createMockCondition("poor", 30);
      render(<PicnicSuitabilityIndicatorWrapper condition={condition} />);

      const chip = screen.getByText("poor");
      expect(chip).toBeInTheDocument();

      // Check for Cancel icon (poor condition)
      const cancelIcon = screen.getByTestId("CancelIcon");
      expect(cancelIcon).toBeInTheDocument();
    });

    it("should display unknown condition correctly", () => {
      const condition = createMockCondition("unknown", 50);
      render(<PicnicSuitabilityIndicatorWrapper condition={condition} />);

      const chip = screen.getByText("unknown");
      expect(chip).toBeInTheDocument();

      // Check for Info icon (unknown condition)
      const infoIcon = screen.getByTestId("InfoIcon");
      expect(infoIcon).toBeInTheDocument();
    });

    it("should handle case-insensitive condition types", () => {
      const condition = createMockCondition("IDEAL", 90);
      render(<PicnicSuitabilityIndicatorWrapper condition={condition} />);

      expect(screen.getByText("IDEAL")).toBeInTheDocument();
      const checkIcon = screen.getByTestId("CheckCircleIcon");
      expect(checkIcon).toBeInTheDocument();
    });
  });

  describe("Score Display", () => {
    it("should display score correctly", () => {
      const condition = createMockCondition("ideal", 87);
      render(<PicnicSuitabilityIndicatorWrapper condition={condition} />);

      expect(screen.getByText("87/100")).toBeInTheDocument();
    });

    it("should display zero score when score is not provided", () => {
      const condition: WeatherConditionDto = {
        type: "ideal",
        score: undefined,
        description: "Great weather",
        reasons: ["Good temperature"],
      };
      render(<PicnicSuitabilityIndicatorWrapper condition={condition} />);

      // Use a flexible text matcher since the text might be split across elements
      expect(
        screen.getByText((content, element) => {
          return element?.textContent === "0/100";
        })
      ).toBeInTheDocument();
    });

    it("should handle edge case scores", () => {
      const condition = createMockCondition("ideal", 0);
      render(<PicnicSuitabilityIndicatorWrapper condition={condition} />);

      expect(screen.getByText("0/100")).toBeInTheDocument();
    });
  });

  describe("Details Accordion", () => {
    it("should show accordion when showDetails is true and reasons exist", () => {
      const condition = createMockCondition();
      render(
        <PicnicSuitabilityIndicatorWrapper
          condition={condition}
          showDetails={true}
        />
      );

      expect(screen.getByText("View detailed conditions")).toBeInTheDocument();
    });

    it("should not show accordion when showDetails is false", () => {
      const condition = createMockCondition();
      render(
        <PicnicSuitabilityIndicatorWrapper
          condition={condition}
          showDetails={false}
        />
      );

      expect(
        screen.queryByText("View detailed conditions")
      ).not.toBeInTheDocument();
    });

    it("should not show accordion when reasons are empty", () => {
      const condition = createMockCondition("ideal", 85, "Great weather", []);
      render(
        <PicnicSuitabilityIndicatorWrapper
          condition={condition}
          showDetails={true}
        />
      );

      expect(
        screen.queryByText("View detailed conditions")
      ).not.toBeInTheDocument();
    });

    it("should not show accordion when reasons are null", () => {
      const condition: WeatherConditionDto = {
        type: "ideal",
        score: 85,
        description: "Great weather",
        reasons: null,
      };

      render(
        <PicnicSuitabilityIndicatorWrapper
          condition={condition}
          showDetails={true}
        />
      );

      expect(
        screen.queryByText("View detailed conditions")
      ).not.toBeInTheDocument();
    });

    it("should expand accordion and show reasons when clicked", async () => {
      const user = userEvent.setup();
      const reasons = [
        "Perfect temperature",
        "No precipitation",
        "Light winds",
      ];
      const condition = createMockCondition(
        "ideal",
        95,
        "Perfect weather",
        reasons
      );

      render(
        <PicnicSuitabilityIndicatorWrapper
          condition={condition}
          showDetails={true}
        />
      );

      const accordionButton = screen.getByText("View detailed conditions");
      await user.click(accordionButton);

      await waitFor(() => {
        reasons.forEach((reason) => {
          expect(screen.getByText(reason)).toBeInTheDocument();
        });
      });
    });

    it("should collapse accordion when clicked again", async () => {
      const user = userEvent.setup();
      const reasons = ["Good conditions"];
      const condition = createMockCondition(
        "ideal",
        90,
        "Good weather",
        reasons
      );

      render(
        <PicnicSuitabilityIndicatorWrapper
          condition={condition}
          showDetails={true}
        />
      );

      const accordionButton = screen.getByText("View detailed conditions");

      // Expand
      await user.click(accordionButton);
      await waitFor(() => {
        expect(screen.getByText("Good conditions")).toBeInTheDocument();
      });

      // Collapse
      await user.click(accordionButton);
      await waitFor(() => {
        // Query for the button element by role, not by text content
        const updatedButton = screen.getByRole("button", {
          name: /view detailed conditions/i,
        });
        expect(updatedButton).toHaveAttribute("aria-expanded", "false");
      });
    });

    it("should display multiple reasons correctly", async () => {
      const user = userEvent.setup();
      const reasons = [
        "Temperature in ideal range",
        "Low chance of precipitation",
        "Gentle breeze",
        "Clear skies",
      ];
      const condition = createMockCondition(
        "ideal",
        98,
        "Excellent weather",
        reasons
      );

      render(
        <PicnicSuitabilityIndicatorWrapper
          condition={condition}
          showDetails={true}
        />
      );

      const accordionButton = screen.getByText("View detailed conditions");
      await user.click(accordionButton);

      await waitFor(() => {
        reasons.forEach((reason) => {
          expect(screen.getByText(reason)).toBeInTheDocument();
        });
      });
    });
  });

  describe("Props Handling", () => {
    it("should handle showDetails prop correctly", () => {
      const condition = createMockCondition();
      const { rerender } = render(
        <PicnicSuitabilityIndicatorWrapper
          condition={condition}
          showDetails={false}
        />
      );

      expect(
        screen.queryByText("View detailed conditions")
      ).not.toBeInTheDocument();

      rerender(
        <PicnicSuitabilityIndicatorWrapper
          condition={condition}
          showDetails={true}
        />
      );

      expect(screen.getByText("View detailed conditions")).toBeInTheDocument();
    });

    it("should update when condition changes", () => {
      const initialCondition = createMockCondition("ideal", 90);
      const { rerender } = render(
        <PicnicSuitabilityIndicatorWrapper condition={initialCondition} />
      );

      expect(screen.getByText("ideal")).toBeInTheDocument();
      expect(screen.getByText("90/100")).toBeInTheDocument();

      const newCondition = createMockCondition("poor", 25);
      rerender(<PicnicSuitabilityIndicatorWrapper condition={newCondition} />);

      expect(screen.getByText("poor")).toBeInTheDocument();
      expect(screen.getByText("25/100")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper semantic structure", () => {
      const condition = createMockCondition();
      render(
        <PicnicSuitabilityIndicatorWrapper
          condition={condition}
          showDetails={true}
        />
      );

      // Check for list structure in accordion
      const accordionButton = screen.getByRole("button", {
        name: /view detailed conditions/i,
      });
      expect(accordionButton).toBeInTheDocument();
    });

    it("should handle keyboard navigation for accordion", async () => {
      const user = userEvent.setup();
      const condition = createMockCondition();
      render(
        <PicnicSuitabilityIndicatorWrapper
          condition={condition}
          showDetails={true}
        />
      );

      const accordionButton = screen.getByRole("button", {
        name: /view detailed conditions/i,
      });

      // Focus and activate with keyboard
      await waitFor(async () => {
        accordionButton.focus();
        await user.keyboard("{Enter}");
      });

      await waitFor(() => {
        expect(screen.getByText("Good temperature")).toBeInTheDocument();
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty string type", async () => {
      const condition = createMockCondition("", 50);
      render(<PicnicSuitabilityIndicatorWrapper condition={condition} />);

      await waitFor(() => {
        expect(screen.getByText("Unknown")).toBeInTheDocument();
        const infoIcon = screen.getByTestId("InfoIcon");
        expect(infoIcon).toBeInTheDocument();
      });
    });

    it("should handle negative scores", async () => {
      const condition = createMockCondition("poor", -10);
      render(<PicnicSuitabilityIndicatorWrapper condition={condition} />);

      await waitFor(() => {
        expect(screen.getByText("-10/100")).toBeInTheDocument();
      });
    });

    it("should handle scores over 100", () => {
      const condition = createMockCondition("ideal", 150);
      render(<PicnicSuitabilityIndicatorWrapper condition={condition} />);

      expect(screen.getByText("150/100")).toBeInTheDocument();
    });

    it("should handle reasons with special characters", async () => {
      const user = userEvent.setup();
      const reasons = [
        "Temperature: 22°C",
        "Humidity < 50%",
        "Wind: 5-10 km/h",
      ];
      const condition = createMockCondition(
        "ideal",
        90,
        "Good weather",
        reasons
      );

      render(
        <PicnicSuitabilityIndicatorWrapper
          condition={condition}
          showDetails={true}
        />
      );

      const accordionButton = screen.getByText("View detailed conditions");
      await user.click(accordionButton);

      await waitFor(() => {
        reasons.forEach((reason) => {
          expect(screen.getByText(reason)).toBeInTheDocument();
        });
      });
    });
  });
});
