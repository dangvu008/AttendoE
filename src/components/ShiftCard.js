import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";

const ShiftCard = ({ shift, onEdit, onDelete }) => {
  const { theme } = useContext(ThemeContext);

  const formatTime = (time) => {
    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.mode === "dark" ? "#1E1E1E" : "#F5F5F5",
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: theme.text }]}>{shift.name}</Text>
        <View style={styles.timeContainer}>
          <Ionicons
            name="time-outline"
            size={16}
            color={theme.text}
            style={styles.timeIcon}
          />
          <Text style={[styles.time, { color: theme.text }]}>
            {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
          </Text>
        </View>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
          <Ionicons name="create-outline" size={20} color={theme.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
          <Ionicons name="trash-outline" size={20} color={theme.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  contentContainer: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeIcon: {
    marginRight: 4,
  },
  time: {
    fontSize: 14,
  },
  actionContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
  },
});

export default ShiftCard;
