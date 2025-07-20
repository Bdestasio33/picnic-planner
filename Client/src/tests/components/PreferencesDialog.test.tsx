import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  waitFor,
  cleanup,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import PreferencesDialog, {
  PreferencesDialogTestIds,
} from "../../components/PreferencesDialog";
import { PreferencesProvider } from "../../contexts/PreferencesContext";
import { DEFAULT_PREFERENCES } from "../../types/custom/preferences";

// Mock MUI Slider to prevent focus-related test errors
vi.mock("@mui/material", async () => {
  const actual = await vi.importActual("@mui/material");
  return {
    ...actual,
    Slider: ({ value, onChange, ...props }: any) => (
      <input
        role="slider"
        type="range"
        value={Array.isArray(value) ? value[0] : value}
        onChange={(e) => onChange?.(e, Number(e.target.value))}
        data-testid="mocked-slider"
        {...props}
      />
    ),
  };
});

// Mock localStorage for tests
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

const theme = createTheme();

const PreferencesDialogWrapper = (props: any) => (
  <PreferencesProvider>
    <ThemeProvider theme={theme}>
      <PreferencesDialog {...props} />
    </ThemeProvider>
  </PreferencesProvider>
);

describe("PreferencesDialog", () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(
      JSON.stringify(DEFAULT_PREFERENCES)
    );
  });

  afterEach(() => {
    cleanup();
  });

  describe("Rendering", () => {
    it("should render dialog when open is true", async () => {
      render(<PreferencesDialogWrapper {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByTestId(PreferencesDialogTestIds.dialog)
        ).toBeInTheDocument();
        expect(
          screen.getByTestId(PreferencesDialogTestIds.dialogTitle)
        ).toBeInTheDocument();
        expect(screen.getByText("Weather Preferences")).toBeInTheDocument();
      });
    });

    it("should not render dialog when open is false", async () => {
      render(<PreferencesDialogWrapper {...defaultProps} open={false} />);

      await waitFor(() => {
        expect(
          screen.queryByTestId(PreferencesDialogTestIds.dialog)
        ).not.toBeInTheDocument();
      });
    });

    it("should render all preference sections", async () => {
      render(<PreferencesDialogWrapper {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByTestId(PreferencesDialogTestIds.temperatureSection)
        ).toBeInTheDocument();
        expect(
          screen.getByTestId(PreferencesDialogTestIds.precipitationSection)
        ).toBeInTheDocument();
        expect(
          screen.getByTestId(PreferencesDialogTestIds.windSection)
        ).toBeInTheDocument();
        expect(
          screen.getByTestId(PreferencesDialogTestIds.humiditySection)
        ).toBeInTheDocument();
      });
    });

    it("should render action buttons", async () => {
      render(<PreferencesDialogWrapper {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByTestId(PreferencesDialogTestIds.saveButton)
        ).toBeInTheDocument();
        expect(
          screen.getByTestId(PreferencesDialogTestIds.cancelButton)
        ).toBeInTheDocument();
        expect(
          screen.getByTestId(PreferencesDialogTestIds.resetButton)
        ).toBeInTheDocument();
      });
    });
  });

  describe("User Interactions", () => {
    it("should call onClose when cancel button is clicked", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<PreferencesDialogWrapper {...defaultProps} onClose={onClose} />);

      await waitFor(() => {
        expect(
          screen.getByTestId(PreferencesDialogTestIds.cancelButton)
        ).toBeInTheDocument();
      });

      await user.click(
        screen.getByTestId(PreferencesDialogTestIds.cancelButton)
      );

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should call onClose when close icon is clicked", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<PreferencesDialogWrapper {...defaultProps} onClose={onClose} />);

      const closeIcon = screen.getByTestId("CloseIcon");
      const closeButton = closeIcon.closest("button");
      expect(closeButton).not.toBeNull();

      await user.click(closeButton!);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should save preferences and close when save button is clicked", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<PreferencesDialogWrapper {...defaultProps} onClose={onClose} />);

      await waitFor(() => {
        expect(
          screen.getByTestId(PreferencesDialogTestIds.saveButton)
        ).toBeInTheDocument();
      });

      await user.click(screen.getByTestId(PreferencesDialogTestIds.saveButton));

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it("should reset preferences and close when reset button is clicked", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<PreferencesDialogWrapper {...defaultProps} onClose={onClose} />);

      await waitFor(() => {
        expect(
          screen.getByTestId(PreferencesDialogTestIds.resetButton)
        ).toBeInTheDocument();
      });

      await user.click(
        screen.getByTestId(PreferencesDialogTestIds.resetButton)
      );

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "picnic-planner-preferences",
        JSON.stringify(DEFAULT_PREFERENCES)
      );
    });
  });

  describe("Preference Controls", () => {
    it("should display current temperature preferences", async () => {
      render(<PreferencesDialogWrapper {...defaultProps} />);

      await waitFor(() => {
        const temperatureSection = screen.getByTestId(
          PreferencesDialogTestIds.temperatureSection
        );
        expect(temperatureSection).toBeInTheDocument();

        // Check if default values are displayed - look for the range display specifically
        const sliders = within(temperatureSection).getAllByRole("slider");
        expect(sliders.length).toBeGreaterThan(0);

        // Check that the temperature section contains the expected range indicators
        expect(temperatureSection).toHaveTextContent("18");
        expect(temperatureSection).toHaveTextContent("26");
      });
    });

    it("should display temperature unit switch", async () => {
      render(<PreferencesDialogWrapper {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/Temperature in Celsius/)).toBeInTheDocument();
      });
    });

    it("should toggle temperature unit when switch is clicked", async () => {
      const user = userEvent.setup();
      render(<PreferencesDialogWrapper {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/Temperature in Celsius/)).toBeInTheDocument();
      });

      const switchElement = screen.getByRole("checkbox");

      await user.click(switchElement);

      await waitFor(() => {
        expect(
          screen.getByText(/Temperature in Fahrenheit/)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels and roles", async () => {
      render(<PreferencesDialogWrapper {...defaultProps} />);

      await waitFor(() => {
        // Check for the actual dialog content container which has the dialog role
        const dialogContent = screen.getByRole("dialog");
        expect(dialogContent).toBeInTheDocument();

        const buttons = screen.getAllByRole("button");
        expect(buttons.length).toBeGreaterThan(0);

        const sliders = screen.getAllByRole("slider");
        expect(sliders.length).toBeGreaterThan(0);
      });
    });

    it("should be keyboard navigable", async () => {
      const user = userEvent.setup();
      render(<PreferencesDialogWrapper {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByTestId(PreferencesDialogTestIds.dialog)
        ).toBeInTheDocument();
      });

      // Test tab navigation
      await user.tab();

      // Should focus on first interactive element
      expect(document.activeElement).not.toBe(document.body);
    });
  });

  describe("Form State Management", () => {
    it("should maintain local state changes until save", async () => {
      const user = userEvent.setup();

      // Clear any previous localStorage calls
      mockLocalStorage.setItem.mockClear();

      render(<PreferencesDialogWrapper {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByTestId(PreferencesDialogTestIds.temperatureSection)
        ).toBeInTheDocument();
      });

      // Find and interact with a slider
      const sliders = screen.getAllByRole("slider");
      expect(sliders.length).toBeGreaterThan(0);

      const firstSlider = sliders[0];

      await user.click(firstSlider);

      // Changes should be reflected in local state but not saved until save button is clicked
      // The only localStorage calls should be from the initial preferences loading/testing
      const savePreferencesCalls = mockLocalStorage.setItem.mock.calls.filter(
        (call) => call[0] === "picnic-planner-preferences"
      );
      expect(savePreferencesCalls).toHaveLength(0);
    });

    it("should discard changes when cancel is clicked", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      // Clear any previous localStorage calls
      mockLocalStorage.setItem.mockClear();

      render(<PreferencesDialogWrapper {...defaultProps} onClose={onClose} />);

      await waitFor(() => {
        expect(
          screen.getByTestId(PreferencesDialogTestIds.cancelButton)
        ).toBeInTheDocument();
      });

      // Make some changes, then cancel
      await user.click(
        screen.getByTestId(PreferencesDialogTestIds.cancelButton)
      );

      expect(onClose).toHaveBeenCalledTimes(1);
      // Should not save any actual preferences (only test localStorage calls allowed)
      const savePreferencesCalls = mockLocalStorage.setItem.mock.calls.filter(
        (call) => call[0] === "picnic-planner-preferences"
      );
      expect(savePreferencesCalls).toHaveLength(0);
    });
  });
});
