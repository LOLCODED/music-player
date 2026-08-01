import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
import { SubsonicConfig } from "../config/subsonic";
import {
  type SubsonicService,
  createSubsonicService,
} from "../services/SubsonicService";
import { generateSalt, deriveAuthToken } from "../services/SubsonicBase";

const CONFIG_STORAGE_KEY = "subsonicConfig";

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

// Replace the raw password with a derived token+salt pair so nothing we
// persist to storage ever contains the password itself.
function withTokenAuth(config: SubsonicConfig): SubsonicConfig {
  if (config.token && config.salt) return config;
  const { token, salt } = deriveAuthToken(config, generateSalt());
  const { password: _password, ...rest } = config;
  return { ...rest, token, salt };
}

function clearStoredConfig(): void {
  localStorage.removeItem(CONFIG_STORAGE_KEY);
  sessionStorage.removeItem(CONFIG_STORAGE_KEY);
}

// sessionStorage first: it holds the current tab's session when the user
// opted out of "remember me".
function readStoredConfig(): { config: SubsonicConfig; storage: Storage } | null {
  for (const storage of [sessionStorage, localStorage]) {
    const raw = storage.getItem(CONFIG_STORAGE_KEY);
    if (!raw) continue;
    try {
      return { config: JSON.parse(raw) as SubsonicConfig, storage };
    } catch {
      storage.removeItem(CONFIG_STORAGE_KEY);
    }
  }
  return null;
}

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

  useEffect(() => {
    let cancelled = false;

    const initAuth = async () => {
      const stored = readStoredConfig();
      if (!stored) return;

      let config: SubsonicConfig;
      try {
        config = withTokenAuth(stored.config);
      } catch {
        // Stored config has no usable credentials (legacy format) — discard it.
        stored.storage.removeItem(CONFIG_STORAGE_KEY);
        return;
      }

      const service = createSubsonicService(config);
      try {
        const valid = await service.ping();
        if (cancelled) return;
        if (valid) {
          // Rewrite storage so legacy password-bearing configs get migrated
          // to the token+salt format.
          stored.storage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
          setSubsonicConfig(config);
          setSubsonicService(service);
          setIsAuthenticated(true);
        } else {
          clearStoredConfig();
        }
      } catch (error) {
        // Network/timeout failure: keep stored credentials so a later reload
        // can retry, but stay logged out for now.
        console.error("Could not reach server during auth init:", error);
      }
    };

    initAuth().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (config: SubsonicConfig, rememberMe: boolean = false): Promise<boolean> => {
      try {
        const authConfig = withTokenAuth(config);
        const service = createSubsonicService(authConfig);
        const success = await service.ping();
        if (!success) return false;

        clearStoredConfig();
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(authConfig));

        setSubsonicConfig(authConfig);
        setSubsonicService(service);
        setIsAuthenticated(true);
        return true;
      } catch (error) {
        console.error("Login error:", error);
        return false;
      }
    },
    []
  );

  const logout = useCallback(() => {
    clearStoredConfig();
    setIsAuthenticated(false);
    setSubsonicConfig(null);
    setSubsonicService(null);
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      subsonicConfig,
      subsonicService,
      login,
      logout,
      loading,
    }),
    [isAuthenticated, subsonicConfig, subsonicService, login, logout, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
