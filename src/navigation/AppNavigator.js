import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useContext } from "react";

// Import screens
import HomeScreen from "../screens/HomeScreen";
import SettingsScreen from "../screens/SettingsScreen";
import AddEditShiftScreen from "../screens/AddEditShiftScreen";
import AddEditNoteScreen from "../screens/AddEditNoteScreen";

// Import context
import { ThemeContext } from "../context/ThemeContext";
import { LanguageContext } from "../context/LanguageContext";

const Stack = createStackNavigator();

// Main stack navigator
const AppNavigator = () => {
  const { theme } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.primary,
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: t("app_name") }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: t("settings") }}
      />
      <Stack.Screen
        name="AddEditNote"
        component={AddEditNoteScreen}
        options={({ route }) => ({
          title: route.params?.note
            ? t("edit") + " " + t("note_title")
            : t("add_note"),
        })}
      />
      <Stack.Screen
        name="AddEditShift"
        component={AddEditShiftScreen}
        options={({ route }) => ({
          title: route.params?.shift ? t("edit_shift") : t("add_shift"),
        })}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
