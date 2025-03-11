import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export const ThemeContext = createContext();

const lightTheme = {
  mode: 'light',
  background: '#FFFFFF',
  text: '#000000',
  primary: '#4285F4',
  secondary: '#34A853',
  accent: '#FBBC05',
  error: '#EA4335',
  surface: '#F5F5F5',
  border: '#E0E0E0'
};

const darkTheme = {
  mode: 'dark',
  background: '#121212',
  text: '#FFFFFF',
  primary: '#4285F4',
  secondary: '#34A853',
  accent: '#FBBC05',
  error: '#EA4335',
  surface: '#1E1E1E',
  border: '#333333'
};

export const ThemeProvider = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(deviceTheme === 'dark');
  const [theme, setTheme] = useState(isDarkMode ? darkTheme : lightTheme);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const value = await AsyncStorage.getItem('isDarkMode');
      if (value !== null) {
        const parsed = JSON.parse(value);
        setIsDarkMode(parsed);
        setTheme(parsed ? darkTheme : lightTheme);
      }
    } catch (e) {
      console.error('Failed to load theme preference', e);
    }
  };

  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      setTheme(newMode ? darkTheme : lightTheme);
      await AsyncStorage.setItem('isDarkMode', JSON.stringify(newMode));
    } catch (e) {
      console.error('Failed to save theme preference', e);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};