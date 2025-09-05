import { CONDITION_COLORS, type WeatherConditionType } from "../types/custom/weather";

export const getConditionColor = (type?: string | null): string => {
  const conditionType = type?.toLowerCase() as WeatherConditionType;
  
  switch (conditionType) {
    case "ideal":
      return CONDITION_COLORS.ideal;
    case "fair":
      return CONDITION_COLORS.fair;
    case "poor":
      return CONDITION_COLORS.poor;
    default:
      return CONDITION_COLORS.default;
  }
};

 