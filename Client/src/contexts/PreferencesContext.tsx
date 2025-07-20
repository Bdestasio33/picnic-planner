import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { UserPreferences } from "../types/custom/preferences";
import { DEFAULT_PREFERENCES } from "../types/custom/preferences";
import { loadPreferences, savePreferences } from "../utils/localStorage";

interface PreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (newPreferences: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
  isLoading: boolean;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(
  undefined
);

interface PreferencesProviderProps {
  children: ReactNode;
}

export const PreferencesProvider: React.FC<PreferencesProviderProps> = ({
  children,
}) => {
  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const loadedPreferences = loadPreferences();
    setPreferences(loadedPreferences);
    setIsLoading(false);
  }, []);

  const updatePreferences = (newPreferences: Partial<UserPreferences>) => {
    const updatedPreferences = {
      ...preferences,
      ...newPreferences,
      // Deep merge nested objects
      temperature: {
        ...preferences.temperature,
        ...newPreferences.temperature,
      },
      precipitation: {
        ...preferences.precipitation,
        ...newPreferences.precipitation,
      },
      wind: {
        ...preferences.wind,
        ...newPreferences.wind,
      },
      humidity: {
        ...preferences.humidity,
        ...newPreferences.humidity,
      },
    };

    setPreferences(updatedPreferences);
    savePreferences(updatedPreferences);
  };

  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
    savePreferences(DEFAULT_PREFERENCES);
  };

  const value: PreferencesContextType = {
    preferences,
    updatePreferences,
    resetPreferences,
    isLoading,
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};

/**
 * Hook to use preferences context
 */
export const usePreferences = (): PreferencesContextType => {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
};
