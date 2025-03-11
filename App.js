import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/context/ThemeContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { WorkShiftProvider } from './src/context/WorkShiftContext';
import { AttendanceProvider } from './src/context/AttendanceContext';
import { NotesProvider } from './src/context/NotesContext';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <WorkShiftProvider>
          <AttendanceProvider>
            <NotesProvider>
              <PaperProvider>
                <NavigationContainer>
                  <StatusBar style="auto" />
                  <AppNavigator />
                </NavigationContainer>
              </PaperProvider>
            </NotesProvider>
          </AttendanceProvider>
        </WorkShiftProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}