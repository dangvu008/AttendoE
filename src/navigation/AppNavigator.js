import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useContext } from 'react';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AddEditShiftScreen from '../screens/AddEditShiftScreen';
import AddEditNoteScreen from '../screens/AddEditNoteScreen';

// Import context
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigators for each tab
const HomeStack = () => {
  const { theme } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen} 
        options={{ title: t('app_name') }} 
      />
      <Stack.Screen 
        name="AddEditNote" 
        component={AddEditNoteScreen} 
        options={({ route }) => ({ 
          title: route.params?.note ? t('edit') + ' ' + t('note_title') : t('add_note')
        })} 
      />
    </Stack.Navigator>
  );
};

const SettingsStack = () => {
  const { theme } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="SettingsMain" 
        component={SettingsScreen} 
        options={{ title: t('settings') }} 
      />
      <Stack.Screen 
        name="AddEditShift" 
        component={AddEditShiftScreen} 
        options={({ route }) => ({ 
          title: route.params?.shift ? t('edit_shift') : t('add_shift')
        })} 
      />
    </Stack.Navigator>
  );
};

// Main tab navigator
const AppNavigator = () => {
  const { theme } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          // You can return any component here!
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { 
          backgroundColor: theme.background,
          borderTopColor: theme.border,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack} 
        options={{ tabBarLabel: t('today') }} 
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsStack} 
        options={{ tabBarLabel: t('settings') }} 
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;