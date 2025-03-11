import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  ScrollView,
  Alert,
  Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

// Import contexts
import { ThemeContext } from "../context/ThemeContext";
import { LanguageContext } from "../context/LanguageContext";
import { WorkShiftContext } from "../context/WorkShiftContext";

const AddEditShiftScreen = ({ route, navigation }) => {
  const { theme } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);
  const { workShifts, addWorkShift, updateWorkShift, applyWorkShift } =
    useContext(WorkShiftContext);

  const editShift = route.params?.shift;

  const [shift, setShift] = useState({
    name: "",
    departureTime: "07:00",
    startTime: "08:00",
    endTime: "17:00",
    reminderBefore: 30, // minutes
    reminderAfter: 15, // minutes
    showSignButton: true,
    daysApplied: [1, 2, 3, 4, 5], // Monday to Friday
  });

  const [nameError, setNameError] = useState("");
  const [showDeparturePicker, setShowDeparturePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Load shift data if in edit mode
  useEffect(() => {
    if (editShift) {
      setShift({ ...editShift });
    }
  }, [editShift]);

  const validateShiftName = (name) => {
    if (!name.trim()) {
      setNameError(t("shift_name_required"));
      return false;
    }
    if (name.trim().length > 200) {
      setNameError(t("shift_name_length"));
      return false;
    }

    // Check for duplicates (only when creating a new shift or changing the name)
    if (!editShift || (editShift && editShift.name !== name)) {
      const nameExists = workShifts.some(
        (s) => s.name.toLowerCase() === name.trim().toLowerCase()
      );
      if (nameExists) {
        setNameError(t("shift_name_duplicate"));
        return false;
      }
    }

    setNameError("");
    return true;
  };

  const handleSaveShift = async () => {
    if (!validateShiftName(shift.name)) {
      return;
    }

    try {
      if (editShift) {
        const success = await updateWorkShift(shift);
        if (success) {
          navigation.goBack();
        }
      } else {
        const success = await addWorkShift(shift);
        if (success) {
          navigation.goBack();
        }
      }
    } catch (error) {
      Alert.alert(t("error"), t("save_error"), [{ text: t("ok") }]);
    }
  };

  const handleReset = () => {
    if (editShift) {
      setShift({ ...editShift });
    } else {
      setShift({
        name: "",
        departureTime: "07:00",
        startTime: "08:00",
        endTime: "17:00",
        reminderBefore: 30,
        reminderAfter: 15,
        showSignButton: true,
        daysApplied: [1, 2, 3, 4, 5],
      });
    }
    setNameError("");
  };

  const formatTimeDisplay = (timeString) => {
    return timeString;
  };

  const handleTimeChange = (event, selectedDate, timeField) => {
    if (timeField === "departure") {
      setShowDeparturePicker(false);
    } else if (timeField === "start") {
      setShowStartPicker(false);
    } else if (timeField === "end") {
      setShowEndPicker(false);
    }

    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, "0");
      const minutes = selectedDate.getMinutes().toString().padStart(2, "0");
      const timeString = `${hours}:${minutes}`;

      if (timeField === "departure") {
        setShift((prev) => ({ ...prev, departureTime: timeString }));
      } else if (timeField === "start") {
        setShift((prev) => ({ ...prev, startTime: timeString }));
      } else if (timeField === "end") {
        setShift((prev) => ({ ...prev, endTime: timeString }));
      }
    }
  };

  const toggleDaySelection = (day) => {
    setShift((prev) => {
      const daysApplied = [...prev.daysApplied];
      const index = daysApplied.indexOf(day);

      if (index !== -1) {
        daysApplied.splice(index, 1);
      } else {
        daysApplied.push(day);
        daysApplied.sort();
      }

      return { ...prev, daysApplied };
    });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Shift Name */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.text }]}>
          {t("shift_name")} *
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.surface,
              color: theme.text,
              borderColor: nameError ? theme.error : theme.border,
            },
          ]}
          value={shift.name}
          onChangeText={(text) => {
            setShift((prev) => ({ ...prev, name: text }));
            validateShiftName(text);
          }}
          placeholder={t("shift_name")}
          placeholderTextColor={theme.text + "80"}
          maxLength={200}
        />
        {nameError ? (
          <Text style={[styles.errorText, { color: theme.error }]}>
            {nameError}
          </Text>
        ) : (
          <Text style={[styles.characterCount, { color: theme.text + "80" }]}>
            {shift.name.length}/200
          </Text>
        )}
      </View>

      {/* Departure Time */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.text }]}>
          {t("departure_time")}
        </Text>
        <TouchableOpacity
          style={[
            styles.timeSelector,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
          onPress={() => setShowDeparturePicker(true)}
        >
          <Text style={[styles.timeText, { color: theme.text }]}>
            {formatTimeDisplay(shift.departureTime)}
          </Text>
          <Ionicons name="time-outline" size={24} color={theme.text} />
        </TouchableOpacity>
        {showDeparturePicker && (
          <DateTimePicker
            value={new Date(`2020-01-01T${shift.departureTime}:00`)}
            mode="time"
            is24Hour={true}
            onChange={(event, selectedDate) =>
              handleTimeChange(event, selectedDate, "departure")
            }
          />
        )}
      </View>

      {/* Start Time */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.text }]}>
          {t("start_time")}
        </Text>
        <TouchableOpacity
          style={[
            styles.timeSelector,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
          onPress={() => setShowStartPicker(true)}
        >
          <Text style={[styles.timeText, { color: theme.text }]}>
            {formatTimeDisplay(shift.startTime)}
          </Text>
          <Ionicons name="time-outline" size={24} color={theme.text} />
        </TouchableOpacity>
        {showStartPicker && (
          <DateTimePicker
            value={new Date(`2020-01-01T${shift.startTime}:00`)}
            mode="time"
            is24Hour={true}
            onChange={(event, selectedDate) =>
              handleTimeChange(event, selectedDate, "start")
            }
          />
        )}
      </View>

      {/* End Time */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.text }]}>
          {t("end_time")}
        </Text>
        <TouchableOpacity
          style={[
            styles.timeSelector,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
          onPress={() => setShowEndPicker(true)}
        >
          <Text style={[styles.timeText, { color: theme.text }]}>
            {formatTimeDisplay(shift.endTime)}
          </Text>
          <Ionicons name="time-outline" size={24} color={theme.text} />
        </TouchableOpacity>
        {showEndPicker && (
          <DateTimePicker
            value={new Date(`2020-01-01T${shift.endTime}:00`)}
            mode="time"
            is24Hour={true}
            onChange={(event, selectedDate) =>
              handleTimeChange(event, selectedDate, "end")
            }
          />
        )}
      </View>

      {/* Reminder Before */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.text }]}>
          {t("reminder_before")}
        </Text>
        <View
          style={[
            styles.pickerContainer,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Picker
            selectedValue={shift.reminderBefore}
            style={{ color: theme.text }}
            onValueChange={(value) =>
              setShift((prev) => ({ ...prev, reminderBefore: value }))
            }
            dropdownIconColor={theme.text}
          >
            <Picker.Item label={t("time_intervals.5_min")} value={5} />
            <Picker.Item label={t("time_intervals.10_min")} value={10} />
            <Picker.Item label={t("time_intervals.15_min")} value={15} />
            <Picker.Item label={t("time_intervals.30_min")} value={30} />
            <Picker.Item label={t("time_intervals.1_hour")} value={60} />
          </Picker>
        </View>
      </View>

      {/* Reminder After */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.text }]}>
          {t("reminder_after")}
        </Text>
        <View
          style={[
            styles.pickerContainer,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Picker
            selectedValue={shift.reminderAfter}
            style={{ color: theme.text }}
            onValueChange={(value) =>
              setShift((prev) => ({ ...prev, reminderAfter: value }))
            }
            dropdownIconColor={theme.text}
          >
            <Picker.Item label={t("time_intervals.5_min")} value={5} />
            <Picker.Item label={t("time_intervals.10_min")} value={10} />
            <Picker.Item label={t("time_intervals.15_min")} value={15} />
            <Picker.Item label={t("time_intervals.30_min")} value={30} />
            <Picker.Item label={t("time_intervals.1_hour")} value={60} />
          </Picker>
        </View>
      </View>

      {/* Show Sign Button */}
      <View style={styles.inputGroup}>
        <View style={styles.switchContainer}>
          <Text style={[styles.label, { color: theme.text }]}>
            {t("show_sign_button")}
          </Text>
          <Switch
            value={shift.showSignButton}
            onValueChange={(value) =>
              setShift((prev) => ({ ...prev, showSignButton: value }))
            }
            trackColor={{ false: "#767577", true: theme.primary + "80" }}
            thumbColor={shift.showSignButton ? theme.primary : "#f4f3f4"}
          />
        </View>
      </View>

      {/* Days Applied */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.text }]}>
          {t("days_applied")}
        </Text>
        <View style={styles.daysContainer}>
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayButton,
                {
                  backgroundColor: shift.daysApplied.includes(day)
                    ? theme.primary
                    : theme.background,
                  borderColor: theme.border,
                },
              ]}
              onPress={() => toggleDaySelection(day)}
            >
              <Text
                style={[
                  styles.dayText,
                  {
                    color: shift.daysApplied.includes(day)
                      ? "white"
                      : theme.text,
                  },
                ]}
              >
                {t(`weekdays.short.${day - 1}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.resetButton,
            { borderColor: theme.border },
          ]}
          onPress={handleReset}
        >
          <Text style={[styles.buttonText, { color: theme.text }]}>
            {t("reset")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.saveButton,
            { backgroundColor: theme.primary },
          ]}
          onPress={handleSaveShift}
        >
          <Text style={[styles.buttonText, { color: "white" }]}>
            {t("save")}
          </Text>
        </TouchableOpacity>

        {editShift && (
          <TouchableOpacity
            style={[styles.button, styles.applyButton]}
            onPress={() => {
              Alert.alert(t("apply_shift"), t("apply_shift_confirm"), [
                { text: t("cancel"), style: "cancel" },
                {
                  text: t("confirm"),
                  onPress: () => {
                    applyWorkShift(editShift.id);
                    Alert.alert(t("success"), t("shift_applied"));
                    navigation.goBack();
                  },
                },
              ]);
            }}
          >
            <Text style={[styles.buttonText, { color: "white" }]}>
              {t("apply")}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  applyButton: {
    backgroundColor: "#4CAF50",
    marginTop: 12,
  },
  contentContainer: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  characterCount: {
    fontSize: 12,
    textAlign: "right",
    marginTop: 4,
  },
  timeSelector: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeText: {
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  daysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dayText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  resetButton: {
    borderWidth: 1,
    marginRight: 8,
  },
  saveButton: {
    marginLeft: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AddEditShiftScreen;
