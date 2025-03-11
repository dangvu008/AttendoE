import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import { vi, en } from '../localization';

export const LanguageContext = createContext();

const translations = {
  en,
  vi
};

export const LanguageProvider = ({ children }) => {
  const [locale, setLocale] = useState(Localization.locale.split('-')[0] || 'en');
  const i18n = new I18n(translations);
  i18n.locale = locale;
  i18n.enableFallback = true;

  useEffect(() => {
    loadLanguagePreference();
  }, []);

  const loadLanguagePreference = async () => {
    try {
      const savedLocale = await AsyncStorage.getItem('locale');
      if (savedLocale !== null) {
        setLocale(savedLocale);
      }
    } catch (e) {
      console.error('Failed to load language preference', e);
    }
  };

  const changeLanguage = async (newLocale) => {
    try {
      setLocale(newLocale);
      await AsyncStorage.setItem('locale', newLocale);
    } catch (e) {
      console.error('Failed to save language preference', e);
    }
  };

  return (
    <LanguageContext.Provider value={{ locale, changeLanguage, t: (key, params) => i18n.t(key, params) }}>
      {children}
    </LanguageContext.Provider>
  );
};