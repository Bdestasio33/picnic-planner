import {
  Box,
  Chip,
  Typography,
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import CancelIcon from "@mui/icons-material/Cancel";
import InfoIcon from "@mui/icons-material/Info";
import { getConditionColor } from "../utils/conditionColors";
import type { WeatherConditionDto } from "../types";

interface Props {
  condition: WeatherConditionDto;
  showDetails?: boolean;
}

const PicnicSuitabilityIndicator = ({
  condition,
  showDetails = false,
}: Props) => {
  const theme = useTheme();

  // Map API condition type to UI elements
  const getIcon = (type?: string | null) => {
    switch (type?.toLowerCase()) {
      case "ideal":
        return <CheckCircleIcon />;
      case "fair":
        return <WarningIcon />;
      case "poor":
        return <CancelIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getSuitabilityLabel = (type?: string | null) => {
    return type || "Unknown";
  };

  return (
    <Box sx={styles.container}>
      <Box sx={styles.indicatorRow}>
        <Chip
          icon={getIcon(condition.type)}
          label={getSuitabilityLabel(condition.type)}
          size="small"
          sx={{
            ...styles.chip,
            backgroundColor: getConditionColor(condition.type),
          }}
        />
        <Typography variant="caption" sx={styles.scoreText}>
          {condition.score || 0}/100
        </Typography>
      </Box>

      {showDetails && condition.reasons && condition.reasons.length > 0 && (
        <Accordion sx={styles.accordion}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={styles.accordionSummary}
          >
            <Typography variant="caption" color="text.secondary">
              View detailed conditions
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              {condition.reasons?.map((reason, index) => (
                <ListItem key={index} sx={styles.listItem}>
                  <ListItemIcon sx={styles.listItemIcon}>
                    <Box
                      sx={{
                        ...styles.bullet,
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText primary={reason} />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
};

export default PicnicSuitabilityIndicator;

const styles = {
  container: {
    width: "100%",
  },
  indicatorRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
  },
  chip: {
    color: "white",
    fontWeight: "bold",
    fontSize: "0.75rem",
    "& .MuiChip-icon": {
      color: "white",
    },
  },
  scoreText: {
    color: "text.secondary",
    fontWeight: "bold",
    fontSize: "0.75rem",
  },
  accordion: {
    borderRadius: "8px",
    mt: 2,
  },
  accordionSummary: {
    minHeight: "40px",
    "& .MuiAccordionSummary-content": {
      margin: "8px 0",
    },
  },
  listItem: {
    py: 0.5,
    px: 0,
  },
  listItemIcon: {
    minWidth: 24,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    backgroundColor: "white",
  },
};
