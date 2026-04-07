import React, { createContext, useState, useEffect, useContext } from "react";
import { SubsonicConfig } from "../config/subsonic";
import { type SubsonicService, createSubsonicService } from "../services/SubsonicService";

interface AuthContextType {
  isAuthenticated: boolean;
  subsonicConfig: SubsonicConfig | null;
  subsonicService: SubsonicService | null;
  login: (config: SubsonicConfig, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [subsonicConfig, setSubsonicConfig] = useState<SubsonicConfig | null>(
    null
  );
  const [subsonicService, setSubsonicService] =
    useState<SubsonicService | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);

      // Try to get config from localStorage first (for remembered credentials)
      const localConfig = localStorage.getItem("subsonicConfig");

      // Then try sessionStorage (for session-only credentials)
      const sessionConfig = sessionStorage.getItem("subsonicConfig");

      let config: SubsonicConfig | null = null;

      if (localConfig) {
        try {
          config = JSON.parse(localConfig) as SubsonicConfig;
        } catch (error) {
          console.error("Error parsing local config:", error);
          localStorage.removeItem("subsonicConfig");
        }
      } else if (sessionConfig) {
        try {
          config = JSON.parse(sessionConfig) as SubsonicConfig;
        } catch (error) {
          console.error("Error parsing session config:", error);
          sessionStorage.removeItem("subsonicConfig");
        }
      }

      if (config) {
        try {
          const service = createSubsonicService(config);

          // Verify connection is still valid
          const success = await service.ping();

          if (success) {
            setSubsonicConfig(config);
            setSubsonicService(service);
            setIsAuthenticated(true);
          } else {
            // If ping fails, clear storage
            localStorage.removeItem("subsonicConfig");
            sessionStorage.removeItem("subsonicConfig");
          }
        } catch (error) {
          console.error("Error initializing auth:", error);
          localStorage.removeItem("subsonicConfig");
          sessionStorage.removeItem("subsonicConfig");
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (
    config: SubsonicConfig,
    rememberMe: boolean = false
  ): Promise<boolean> => {
    try {
      const service = createSubsonicService(config);
      const success = await service.ping();

      if (success) {
        if (rememberMe) {
          // Save full config to localStorage if remember me is checked
          localStorage.setItem("subsonicConfig", JSON.stringify(config));
        } else {
          // Save config without password to localStorage
          const savedConfig = { ...config };
          delete savedConfig.password;
          localStorage.setItem("subsonicConfig", JSON.stringify(savedConfig));

          // Save full config to sessionStorage
          sessionStorage.setItem("subsonicConfig", JSON.stringify(config));
        }

        setSubsonicConfig(config);
        setSubsonicService(service);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("subsonicConfig");
    sessionStorage.removeItem("subsonicConfig");
    setIsAuthenticated(false);
    setSubsonicConfig(null);
    setSubsonicService(null);
  };

  const value = {
    isAuthenticated,
    subsonicConfig,
    subsonicService,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
