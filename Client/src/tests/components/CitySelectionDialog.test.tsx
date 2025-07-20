import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { act } from "react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CitySelectionDialog, {
  CitySelectionDialogTestIds,
} from "../../components/CitySelectionDialog";

// Mock theme for Material UI components
const theme = createTheme();

// Helper component to wrap CitySelectionDialog with theme
const CitySelectionDialogWrapper = (props: any) => (
  <ThemeProvider theme={theme}>
    <CitySelectionDialog {...props} />
  </ThemeProvider>
);

describe("CitySelectionDialog", () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onSave: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("Rendering", () => {
    it("should render dialog when open is true", async () => {
      render(<CitySelectionDialogWrapper {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByTestId(CitySelectionDialogTestIds.dialogTitle)
        ).toBeInTheDocument();
        expect(
          screen.getByTestId(CitySelectionDialogTestIds.dialogContent)
        ).toBeInTheDocument();
        expect(
          screen.getByTestId(CitySelectionDialogTestIds.dialogActions)
        ).toBeInTheDocument();
      });
    });

    it("should not render dialog when open is false", async () => {
      render(<CitySelectionDialogWrapper {...defaultProps} open={false} />);

      await waitFor(() => {
        expect(
          screen.queryByTestId(CitySelectionDialogTestIds.dialogTitle)
        ).not.toBeInTheDocument();
      });
    });

    it("should render dialog title correctly", async () => {
      render(<CitySelectionDialogWrapper {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Select Location")).toBeInTheDocument();
      });
    });

    it("should render form fields with correct labels", async () => {
      render(<CitySelectionDialogWrapper {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/state\/province/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
      });
    });

    it("should render action buttons", async () => {
      render(<CitySelectionDialogWrapper {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByTestId(CitySelectionDialogTestIds.dialogCancelButton)
        ).toBeInTheDocument();
        expect(
          screen.getByTestId(CitySelectionDialogTestIds.dialogSaveButton)
        ).toBeInTheDocument();
      });
    });

    it("should render close icon button", async () => {
      render(<CitySelectionDialogWrapper {...defaultProps} />);

      await waitFor(() => {
        // Find the close button by the CloseIcon test id
        expect(screen.getByTestId("CloseIcon")).toBeInTheDocument();
      });
    });

    it("should show descriptive text", async () => {
      render(<CitySelectionDialogWrapper {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText("Enter the location for weather information")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Form Pre-population", () => {
    it("should pre-populate fields with current location", async () => {
      const currentLocation = {
        city: "New York",
        state: "NY",
        country: "USA",
      };

      render(
        <CitySelectionDialogWrapper
          {...defaultProps}
          currentLocation={currentLocation}
        />
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue("New York")).toBeInTheDocument();
        expect(screen.getByDisplayValue("NY")).toBeInTheDocument();
        expect(screen.getByDisplayValue("USA")).toBeInTheDocument();
      });
    });

    it("should handle partial current location data", async () => {
      const currentLocation = {
        city: "Seattle",
      };

      render(
        <CitySelectionDialogWrapper
          {...defaultProps}
          currentLocation={currentLocation}
        />
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue("Seattle")).toBeInTheDocument();
        expect(screen.getByLabelText(/state\/province/i)).toHaveValue("");
        expect(screen.getByLabelText(/country/i)).toHaveValue("");
      });
    });

    it("should handle empty current location", async () => {
      render(
        <CitySelectionDialogWrapper
          {...defaultProps}
          currentLocation={{} as any}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/city/i)).toHaveValue("");
        expect(screen.getByLabelText(/state\/province/i)).toHaveValue("");
        expect(screen.getByLabelText(/country/i)).toHaveValue("");
      });
    });
  });

  describe("Form Validation", () => {
    it("should disable save button when city is empty", async () => {
      render(<CitySelectionDialogWrapper {...defaultProps} />);

      await waitFor(() => {
        const saveButton = screen.getByTestId(
          CitySelectionDialogTestIds.dialogSaveButton
        );
        expect(saveButton).toBeDisabled();
      });
    });

    it("should enable save button when city is valid", async () => {
      const user = userEvent.setup();
      render(<CitySelectionDialogWrapper {...defaultProps} />);

      const cityInput = screen.getByLabelText(/city/i);
      await user.type(cityInput, "Boston");

      await waitFor(() => {
        const saveButton = screen.getByTestId(
          CitySelectionDialogTestIds.dialogSaveButton
        );
        expect(saveButton).toBeEnabled();
      });
    });

    it("should show city required error when field is touched and empty", async () => {
      const user = userEvent.setup();
      render(<CitySelectionDialogWrapper {...defaultProps} />);

      const cityInput = screen.getByLabelText(/city/i);
      await user.type(cityInput, "A");
      await user.clear(cityInput);

      await waitFor(
        () => {
          expect(screen.getByText("City is required")).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it("should show city minimum length error", async () => {
      const user = userEvent.setup();
      render(<CitySelectionDialogWrapper {...defaultProps} />);

      const cityInput = screen.getByLabelText(/city/i);
      await user.type(cityInput, "A");

      await waitFor(
        () => {
          expect(
            screen.getByText("City name must be at least 2 characters")
          ).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it("should show state minimum length error", async () => {
      const user = userEvent.setup();
      render(<CitySelectionDialogWrapper {...defaultProps} />);

      const stateInput = screen.getByLabelText(/state\/province/i);
      await user.type(stateInput, "A");

      await waitFor(
        () => {
          expect(
            screen.getByText("State must be at least 2 characters")
          ).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it("should show country minimum length error", async () => {
      const user = userEvent.setup();
      render(<CitySelectionDialogWrapper {...defaultProps} />);

      const countryInput = screen.getByLabelText(/country/i);
      await user.type(countryInput, "A");

      await waitFor(
        () => {
          expect(
            screen.getByText("Country must be at least 2 characters")
          ).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it("should allow empty state and country fields", async () => {
      const user = userEvent.setup();
      render(<CitySelectionDialogWrapper {...defaultProps} />);

      const cityInput = screen.getByLabelText(/city/i);
      await user.type(cityInput, "Miami");

      await waitFor(() => {
        const saveButton = screen.getByTestId(
          CitySelectionDialogTestIds.dialogSaveButton
        );
        expect(saveButton).toBeEnabled();
      });
    });
  });

  describe("User Interactions", () => {
    it("should call onClose when cancel button is clicked", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <CitySelectionDialogWrapper {...defaultProps} onClose={onClose} />
      );

      const cancelButton = screen.getByTestId(
        CitySelectionDialogTestIds.dialogCancelButton
      );
      await user.click(cancelButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should call onClose when close icon is clicked", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <CitySelectionDialogWrapper {...defaultProps} onClose={onClose} />
      );

      // Find the close button by finding the button that contains the CloseIcon
      const closeIcon = screen.getByTestId("CloseIcon");
      const closeButton = closeIcon.closest("button");
      expect(closeButton).not.toBeNull();

      await user.click(closeButton!);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should call onSave with form data when save button is clicked", async () => {
      const user = userEvent.setup();
      const onSave = vi.fn();

      render(<CitySelectionDialogWrapper {...defaultProps} onSave={onSave} />);

      const cityInput = screen.getByLabelText(/city/i);
      const stateInput = screen.getByLabelText(/state\/province/i);
      const countryInput = screen.getByLabelText(/country/i);

      await user.type(cityInput, "San Francisco");
      await user.type(stateInput, "CA");
      await user.type(countryInput, "USA");

      const saveButton = screen.getByTestId(
        CitySelectionDialogTestIds.dialogSaveButton
      );
      await user.click(saveButton);

      expect(onSave).toHaveBeenCalledWith({
        city: "San Francisco",
        state: "CA",
        country: "USA",
      });
    });

    it("should call onSave with trimmed values", async () => {
      const user = userEvent.setup();
      const onSave = vi.fn();

      render(<CitySelectionDialogWrapper {...defaultProps} onSave={onSave} />);

      const cityInput = screen.getByLabelText(/city/i);
      const stateInput = screen.getByLabelText(/state\/province/i);

      await user.type(cityInput, "  Denver  ");
      await user.type(stateInput, "  CO  ");

      const saveButton = screen.getByTestId(
        CitySelectionDialogTestIds.dialogSaveButton
      );
      await user.click(saveButton);

      expect(onSave).toHaveBeenCalledWith({
        city: "Denver",
        state: "CO",
        country: undefined,
      });
    });

    it("should call onSave with undefined for empty optional fields", async () => {
      const user = userEvent.setup();
      const onSave = vi.fn();

      render(<CitySelectionDialogWrapper {...defaultProps} onSave={onSave} />);

      const cityInput = screen.getByLabelText(/city/i);
      await user.type(cityInput, "Austin");

      const saveButton = screen.getByTestId(
        CitySelectionDialogTestIds.dialogSaveButton
      );
      await user.click(saveButton);

      expect(onSave).toHaveBeenCalledWith({
        city: "Austin",
        state: undefined,
        country: undefined,
      });
    });
  });

  describe("Form Reset Behavior", () => {
    it("should reset form to current location when dialog is canceled", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const currentLocation = { city: "Chicago", state: "IL", country: "USA" };

      const { rerender } = render(
        <CitySelectionDialogWrapper
          {...defaultProps}
          onClose={onClose}
          currentLocation={currentLocation}
        />
      );

      // Modify the form
      const cityInput = screen.getByLabelText(/city/i);
      await user.clear(cityInput);
      await user.type(cityInput, "Modified City");

      // Cancel the dialog
      const cancelButton = screen.getByTestId(
        CitySelectionDialogTestIds.dialogCancelButton
      );
      await user.click(cancelButton);

      expect(onClose).toHaveBeenCalled();

      // Reopen the dialog and verify form is reset
      rerender(
        <CitySelectionDialogWrapper
          {...defaultProps}
          onClose={onClose}
          currentLocation={currentLocation}
          open={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue("Chicago")).toBeInTheDocument();
      });
    });

    it("should reset form when dialog reopens", async () => {
      const currentLocation = { city: "Portland", state: "OR" };

      const { rerender } = render(
        <CitySelectionDialogWrapper
          {...defaultProps}
          currentLocation={currentLocation}
          open={false}
        />
      );

      // Open dialog
      rerender(
        <CitySelectionDialogWrapper
          {...defaultProps}
          currentLocation={currentLocation}
          open={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue("Portland")).toBeInTheDocument();
        expect(screen.getByDisplayValue("OR")).toBeInTheDocument();
      });
    });
  });

  describe("Keyboard Navigation", () => {
    it("should focus city input when dialog opens", async () => {
      render(<CitySelectionDialogWrapper {...defaultProps} />);

      await waitFor(() => {
        const cityInput = screen.getByLabelText(/city/i);
        expect(cityInput).toHaveFocus();
      });
    });

    it("should allow tab navigation between fields", async () => {
      const user = userEvent.setup();
      render(<CitySelectionDialogWrapper {...defaultProps} />);

      const cityInput = screen.getByLabelText(/city/i);
      const stateInput = screen.getByLabelText(/state\/province/i);
      const countryInput = screen.getByLabelText(/country/i);

      expect(cityInput).toHaveFocus();

      await user.tab();
      expect(stateInput).toHaveFocus();

      await user.tab();
      expect(countryInput).toHaveFocus();
    });
  });

  describe("Helper Text", () => {
    it("should show helper text for optional fields", async () => {
      render(<CitySelectionDialogWrapper {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText("Optional - helps with location accuracy")
        ).toBeInTheDocument();
        expect(
          screen.getByText("Optional - defaults to your region")
        ).toBeInTheDocument();
      });
    });

    it("should show placeholders", async () => {
      render(<CitySelectionDialogWrapper {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText("e.g., New York")
        ).toBeInTheDocument();
        expect(
          screen.getByPlaceholderText("e.g., NY (optional)")
        ).toBeInTheDocument();
        expect(
          screen.getByPlaceholderText("e.g., USA (optional)")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Button Labels", () => {
    it("should have correct button labels", async () => {
      render(<CitySelectionDialogWrapper {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Cancel")).toBeInTheDocument();
        expect(screen.getByText("Get Weather")).toBeInTheDocument();
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined currentLocation gracefully", async () => {
      render(
        <CitySelectionDialogWrapper
          {...defaultProps}
          currentLocation={undefined}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/city/i)).toHaveValue("");
        expect(screen.getByLabelText(/state\/province/i)).toHaveValue("");
        expect(screen.getByLabelText(/country/i)).toHaveValue("");
      });
    });

    it("should handle very long input values", async () => {
      const user = userEvent.setup();
      const onSave = vi.fn();

      render(<CitySelectionDialogWrapper {...defaultProps} onSave={onSave} />);

      const longCityName = "A".repeat(100);
      const cityInput = screen.getByLabelText(/city/i);

      await user.type(cityInput, longCityName);

      const saveButton = screen.getByTestId(
        CitySelectionDialogTestIds.dialogSaveButton
      );
      await user.click(saveButton);

      expect(onSave).toHaveBeenCalledWith({
        city: longCityName,
        state: undefined,
        country: undefined,
      });
    });

    it("should handle special characters in input", async () => {
      const user = userEvent.setup();
      const onSave = vi.fn();

      render(<CitySelectionDialogWrapper {...defaultProps} onSave={onSave} />);

      const specialCity = "Saint-Jean-sur-Richelieu";
      const cityInput = screen.getByLabelText(/city/i);

      await user.type(cityInput, specialCity);

      const saveButton = screen.getByTestId(
        CitySelectionDialogTestIds.dialogSaveButton
      );
      await user.click(saveButton);

      expect(onSave).toHaveBeenCalledWith({
        city: specialCity,
        state: undefined,
        country: undefined,
      });
    });

    it("should handle form submission with only required field", async () => {
      const user = userEvent.setup();
      const onSave = vi.fn();

      render(<CitySelectionDialogWrapper {...defaultProps} onSave={onSave} />);

      const cityInput = screen.getByLabelText(/city/i);
      await user.type(cityInput, "Paris");

      const saveButton = screen.getByTestId(
        CitySelectionDialogTestIds.dialogSaveButton
      );
      await user.click(saveButton);

      expect(onSave).toHaveBeenCalledWith({
        city: "Paris",
        state: undefined,
        country: undefined,
      });
    });
  });
});
