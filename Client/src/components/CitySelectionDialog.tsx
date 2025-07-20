import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Typography,
  IconButton,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

interface CitySelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (location: {
    city: string;
    state?: string;
    country?: string;
  }) => void;
  currentLocation?: {
    city: string;
    state?: string;
    country?: string;
  };
}

interface FormData {
  city: string;
  state: string;
  country: string;
}

/**
 * A dialog component for selecting a city and location.
 *
 * @param {CitySelectionDialogProps} props
 */
const CitySelectionDialog = ({
  open,
  onClose,
  onSave,
  currentLocation,
}: CitySelectionDialogProps) => {
  const {
    control,
    reset,
    formState: { errors, isValid },
    getValues,
  } = useForm<FormData>({
    mode: "onChange",
    defaultValues: {
      city: currentLocation?.city || "",
      state: currentLocation?.state || "",
      country: currentLocation?.country || "",
    },
  });

  // Reset form when dialog opens or currentLocation changes
  useEffect(() => {
    if (open) {
      reset({
        city: currentLocation?.city || "",
        state: currentLocation?.state || "",
        country: currentLocation?.country || "",
      });
    }
  }, [open, currentLocation, reset]);

  const handleSave = () => {
    const data = getValues();
    // Save the location
    onSave({
      city: data.city.trim(),
      state: data.state.trim() || undefined,
      country: data.country.trim() || undefined,
    });

    handleClose();
  };

  const handleClose = () => {
    // Reset form to current values
    reset({
      city: currentLocation?.city || "",
      state: currentLocation?.state || "",
      country: currentLocation?.country || "",
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={styles.dialogTitle}
        data-testid={CitySelectionDialogTestIds.dialogTitle}
      >
        Select Location
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        data-testid={CitySelectionDialogTestIds.dialogContent}
      >
        <Stack spacing={3} sx={styles.formStack}>
          <Typography variant="body2" color="text.secondary">
            Enter the location for weather information
          </Typography>

          <Controller
            name="city"
            control={control}
            rules={{
              required: "City is required",
              minLength: {
                value: 2,
                message: "City name must be at least 2 characters",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="City"
                error={!!errors.city}
                helperText={errors.city?.message}
                required
                fullWidth
                autoFocus
                placeholder="e.g., New York"
              />
            )}
          />

          <Controller
            name="state"
            control={control}
            rules={{
              minLength: {
                value: 2,
                message: "State must be at least 2 characters",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="State/Province"
                error={!!errors.state}
                helperText={
                  errors.state?.message ||
                  "Optional - helps with location accuracy"
                }
                fullWidth
                placeholder="e.g., NY (optional)"
              />
            )}
          />

          <Controller
            name="country"
            control={control}
            rules={{
              minLength: {
                value: 2,
                message: "Country must be at least 2 characters",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Country"
                error={!!errors.country}
                helperText={
                  errors.country?.message ||
                  "Optional - defaults to your region"
                }
                fullWidth
                placeholder="e.g., USA (optional)"
              />
            )}
          />
        </Stack>
      </DialogContent>

      <DialogActions
        sx={styles.dialogActions}
        data-testid={CitySelectionDialogTestIds.dialogActions}
      >
        <Button
          onClick={handleClose}
          variant="outlined"
          data-testid={CitySelectionDialogTestIds.dialogCancelButton}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!isValid}
          data-testid={CitySelectionDialogTestIds.dialogSaveButton}
        >
          Get Weather
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CitySelectionDialog;

const styles = {
  dialogPaper: {
    borderRadius: "12px",
  },
  dialogTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    pb: 1,
  },
  formStack: {
    py: 1,
  },
  dialogActions: {
    px: 3,
    py: 2,
  },
};

export const CitySelectionDialogTestIds = {
  dialogTitle: "city-selection-dialog-title",
  dialogContent: "city-selection-dialog-content",
  dialogActions: "city-selection-dialog-actions",
  dialogCancelButton: "city-selection-dialog-cancel-button",
  dialogSaveButton: "city-selection-dialog-save-button",
};
