import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

// Import contexts
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';
import { NotesContext } from '../context/NotesContext';

const AddEditNoteScreen = ({ route, navigation }) => {
  const { theme } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);
  const { addNote, updateNote, deleteNote } = useContext(NotesContext);
  
  const editNote = route.params?.note;
  
  const [note, setNote] = useState({
    title: '',
    content: '',
    reminderTime: new Date().toISOString(),
    reminderDays: [1, 2, 3, 4, 5], // Monday to Friday by default
  });
  
  const [titleError, setTitleError] = useState('');
  const [contentError, setContentError] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Load note data if in edit mode
  useEffect(() => {
    if (editNote) {
      setNote({...editNote});
    }
  }, [editNote]);

  const validateTitle = (title) => {
    if (!title.trim()) {
      setTitleError(t('note_title_required'));
      return false;
    }
    if (title.trim().length > 100) {
      setTitleError(t('note_title_length'));
      return false;
    }
    setTitleError('');
    return true;
  };

  const validateContent = (content) => {
    if (!content.trim()) {
      setContentError(t('note_content_required'));
      return false;
    }
    if (content.trim().length > 300) {
      setContentError(t('note_content_length'));
      return false;
    }
    setContentError('');
    return true;
  };

  const handleSaveNote = async () => {
    const isTitleValid = validateTitle(note.title);
    const isContentValid = validateContent(note.content);
    
    if (!isTitleValid || !isContentValid) {
      return;
    }
    
    try {
      if (editNote) {
        const success = await updateNote(note);
        if (success) {
          navigation.go