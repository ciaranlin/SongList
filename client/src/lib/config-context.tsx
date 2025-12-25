import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { type SiteConfig, defaultConfig } from "@shared/schema";

interface ConfigContextType {
  config: SiteConfig;
  setConfig: (config: SiteConfig) => void;
  updateConfig: (updates: Partial<SiteConfig>) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children, initialConfig }: { children: ReactNode; initialConfig?: SiteConfig }) {
  const [config, setConfigState] = useState<SiteConfig>(initialConfig || defaultConfig);
  const [isLoading, setIsLoading] = useState(false);

  const setConfig = useCallback((newConfig: SiteConfig) => {
    setConfigState(newConfig);
  }, []);

  const updateConfig = useCallback((updates: Partial<SiteConfig>) => {
    setConfigState(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);

  return (
    <ConfigContext.Provider value={{ config, setConfig, updateConfig, isLoading, setIsLoading }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
}

// Utility to calculate text color based on background
export function getAutoTextColor(bgColor: string): string {
  // Parse hex color
  let r = 0, g = 0, b = 0;
  
  if (bgColor.startsWith("#")) {
    const hex = bgColor.slice(1);
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    }
  } else if (bgColor.startsWith("rgb")) {
    const match = bgColor.match(/\d+/g);
    if (match && match.length >= 3) {
      r = parseInt(match[0]);
      g = parseInt(match[1]);
      b = parseInt(match[2]);
    }
  }
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return dark text for light backgrounds, light text for dark backgrounds
  return luminance > 0.5 ? "#1B1B1B" : "#FFFFFF";
}
