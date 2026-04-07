import React, { createContext, useContext, useState, useEffect } from 'react';
import { PlayerPosition, MobilePlayerPosition, ACCENT_HOVER_MAP } from '../types/settings';

export type { PlayerPosition, MobilePlayerPosition } from '../types/settings';

interface SettingsContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  playerPosition: PlayerPosition;
  setPlayerPosition: (pos: PlayerPosition) => void;
  mobilePlayerPosition: MobilePlayerPosition;
  setMobilePlayerPosition: (pos: MobilePlayerPosition) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [accentColor, setAccentColorState] = useState(() => {
    return localStorage.getItem('accentColor') || '#8b5cf6';
  });

  const [playerPosition, setPlayerPositionState] = useState<PlayerPosition>(() => {
    return (localStorage.getItem('playerPosition') as PlayerPosition) || 'bottom';
  });

  const [mobilePlayerPosition, setMobilePlayerPositionState] = useState<MobilePlayerPosition>(() => {
    return (localStorage.getItem('mobilePlayerPosition') as MobilePlayerPosition) || 'bottom';
  });

  useEffect(() => {
    document.body.classList.toggle('light', !isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accentColor);
    const hover = ACCENT_HOVER_MAP[accentColor] || accentColor;
    document.documentElement.style.setProperty('--accent-hover', hover);
    localStorage.setItem('accentColor', accentColor);
  }, [accentColor]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const setAccentColor = (color: string) => setAccentColorState(color);

  const setPlayerPosition = (pos: PlayerPosition) => {
    setPlayerPositionState(pos);
    localStorage.setItem('playerPosition', pos);
  };

  const setMobilePlayerPosition = (pos: MobilePlayerPosition) => {
    setMobilePlayerPositionState(pos);
    localStorage.setItem('mobilePlayerPosition', pos);
  };

  return (
    <SettingsContext.Provider value={{ isDarkMode, toggleTheme, accentColor, setAccentColor, playerPosition, setPlayerPosition, mobilePlayerPosition, setMobilePlayerPosition }}>
      {children}
    </SettingsContext.Provider>
  );
};
