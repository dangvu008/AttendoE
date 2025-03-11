import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

// Import contexts
import { ThemeContext } from "../context/ThemeContext";
import { LanguageContext } from "../context/LanguageContext";
import { NotesContext } from "../context/NotesContext";

const AddEditNoteScreen = ({ route, navigation }) => {
  const { theme } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);
  const { addNote, updateNote, deleteNote } = useContext(NotesContext);

  const editNote = route.params?.note;

  const [note, setNote] = useState({
    title: "",
    content: "",
    reminderTime: new Date().toISOString(),
    reminderDays: [1, 2, 3, 4, 5], // Monday to Friday
  });

  const [titleError, setTitleError] = useState("");
  const [contentError, setContentError] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Load note data if in edit mode
  useEffect(() => {
    if (editNote) {
      setNote({ ...editNote });
    }
  }, [editNote]);

  const validateTitle = (title) => {
    if (!title.trim()) {
      setTitleError(t("note_title_required"));
      return false;
    }
    if (title.trim().length > 100) {
      setTitleError(t("note_title_length"));
      return false;
    }
    setTitleError("");
    return true;
  };

  const validateContent = (content) => {
    if (!content.trim()) {
      setContentError(t("note_content_required"));
      return false;
    }
    if (content.trim().length > 300) {
      setContentError(t("note_content_length"));
      return false;
    }
    setContentError("");
    return true;
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setNote((prev) => ({
        ...prev,
        reminderTime: selectedTime.toISOString(),
      }));
    }
  };

  const handleSave = async () => {
    const isTitleValid = validateTitle(note.title);
    const isContentValid = validateContent(note.content);

    if (!isTitleValid || !isContentValid) {
      return;
    }

    try {
      if (editNote) {
        await updateNote(note);
      } else {
        await addNote(note);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert(t("error"), t("save_note_error"));
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.titleInput,
            { color: theme.text, borderColor: theme.border },
          ]}
          placeholder={t("note_title_placeholder")}
          placeholderTextColor={theme.textSecondary}
          value={note.title}
          onChangeText={(text) => {
            setNote((prev) => ({ ...prev, title: text }));
            validateTitle(text);
          }}
        />
        {titleError ? (
          <Text style={[styles.errorText, { color: theme.error }]}>
            {titleError}
          </Text>
        ) : null}

        <TextInput
          style={[
            styles.contentInput,
            { color: theme.text, borderColor: theme.border },
          ]}
          placeholder={t("note_content_placeholder")}
          placeholderTextColor={theme.textSecondary}
          multiline
          value={note.content}
          onChangeText={(text) => {
            setNote((prev) => ({ ...prev, content: text }));
            validateContent(text);
          }}
        />
        {contentError ? (
          <Text style={[styles.errorText, { color: theme.error }]}>
            {contentError}
          </Text>
        ) : null}

        <TouchableOpacity
          style={[styles.timeButton, { borderColor: theme.border }]}
          onPress={() => setShowTimePicker(true)}
        >
          <Ionicons name="time-outline" size={24} color={theme.text} />
          <Text style={[styles.timeText, { color: theme.text }]}>
            {new Date(note.reminderTime).toLocaleTimeString()}
          </Text>
        </TouchableOpacity>

        {showTimePicker && (
          <DateTimePicker
            value={new Date(note.reminderTime)}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={handleTimeChange}
          />
        )}
      </View>

      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: theme.primary }]}
        onPress={handleSave}
      >
        <Text style={styles.saveButtonText}>{t("save")}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: "bold",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  contentInput: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
    minHeight: 100,
    textAlignVertical: "top",
  },
  errorText: {
    fontSize: 12,
    marginBottom: 8,
  },
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  timeText: {
    marginLeft: 8,
    fontSize: 16,
  },
  saveButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AddEditNoteScreen;
