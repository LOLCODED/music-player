import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  PlayerPosition,
  MobilePlayerPosition,
  Skin,
  PLAYER_POSITIONS,
  MOBILE_PLAYER_POSITIONS,
  SKINS,
  ACCENT_HOVER_MAP,
} from '../types/settings';

export type { PlayerPosition, MobilePlayerPosition, Skin } from '../types/settings';

interface SettingsContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  playerPosition: PlayerPosition;
  setPlayerPosition: (pos: PlayerPosition) => void;
  mobilePlayerPosition: MobilePlayerPosition;
  setMobilePlayerPosition: (pos: MobilePlayerPosition) => void;
  skin: Skin;
  setSkin: (skin: Skin) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};

function readStoredSetting<T extends string>(
  key: string,
  allowed: readonly T[],
  fallback: T
): T {
  try {
    const value = localStorage.getItem(key);
    return allowed.includes(value as T) ? (value as T) : fallback;
  } catch {
    return fallback;
  }
}

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
    } catch {
      // fall through to media query
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [accentColor, setAccentColorState] = useState(() => {
    try {
      return localStorage.getItem('accentColor') || '#8b5cf6';
    } catch {
      return '#8b5cf6';
    }
  });

  const [playerPosition, setPlayerPositionState] = useState<PlayerPosition>(() =>
    readStoredSetting('playerPosition', PLAYER_POSITIONS, 'bottom')
  );

  const [mobilePlayerPosition, setMobilePlayerPositionState] =
    useState<MobilePlayerPosition>(() =>
      readStoredSetting('mobilePlayerPosition', MOBILE_PLAYER_POSITIONS, 'bottom')
    );

  const [skin, setSkinState] = useState<Skin>(() =>
    readStoredSetting('skin', SKINS, 'default')
  );

  useEffect(() => {
    document.body.dataset.skin = skin;
  }, [skin]);

  useEffect(() => {
    document.body.classList.toggle('light', !isDarkMode);
    try {
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    } catch {
      // Ignore storage failures (private mode / quota); theme still applies.
    }
  }, [isDarkMode]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accentColor);
    const hover = ACCENT_HOVER_MAP[accentColor] || accentColor;
    document.documentElement.style.setProperty('--accent-hover', hover);
    try {
      localStorage.setItem('accentColor', accentColor);
    } catch {
      // Ignore storage failures.
    }
  }, [accentColor]);

  const toggleTheme = useCallback(() => setIsDarkMode(prev => !prev), []);

  const setAccentColor = useCallback((color: string) => setAccentColorState(color), []);

  const setPlayerPosition = useCallback((pos: PlayerPosition) => {
    setPlayerPositionState(pos);
    try {
      localStorage.setItem('playerPosition', pos);
    } catch {
      // Ignore storage failures.
    }
  }, []);

  const setMobilePlayerPosition = useCallback((pos: MobilePlayerPosition) => {
    setMobilePlayerPositionState(pos);
    try {
      localStorage.setItem('mobilePlayerPosition', pos);
    } catch {
      // Ignore storage failures.
    }
  }, []);

  const setSkin = useCallback((next: Skin) => {
    setSkinState(next);
    try {
      localStorage.setItem('skin', next);
    } catch {
      // Ignore storage failures.
    }
  }, []);

  const value = useMemo(
    () => ({
      isDarkMode,
      toggleTheme,
      accentColor,
      setAccentColor,
      playerPosition,
      setPlayerPosition,
      mobilePlayerPosition,
      setMobilePlayerPosition,
      skin,
      setSkin,
    }),
    [
      isDarkMode,
      toggleTheme,
      accentColor,
      setAccentColor,
      playerPosition,
      setPlayerPosition,
      mobilePlayerPosition,
      setMobilePlayerPosition,
      skin,
      setSkin,
    ]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
