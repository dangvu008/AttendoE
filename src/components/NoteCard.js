import React, { useContext, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';
import { NotesContext } from '../context/NotesContext';

const NoteCard = ({ note, onEdit }) => {
  const { theme } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);
  const { deleteNote } = useContext(NotesContext);
  
  const [expanded, setExpanded] = useState(false);
  
  const formatReminderTime = (isoString) => {
    return format(new Date(isoString), 'HH:mm');
  };
  
  const formatReminderDays = (days) => {
    if (!days || days.length === 0) return '';
    if (days.length === 7) return t('everyday');
    
    return days
      .sort((a, b) => a - b)
      .map(day => t(`weekdays.short.${day - 1}`))
      .join(', ');
  };
  
  const handleDelete = () => {
    Alert.alert(
      t('confirm'),
      t('delete_note_confirmation'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        { 
          text: t('delete'), 
          onPress: async () => {
            await deleteNote(note.id);
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.mode === 'dark' ? '#1E1E1E' : '#F5F5F5', borderColor: theme.border }]}>
      <TouchableOpacity 
        style={styles.contentContainer}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={expanded ? 0 : 1}>
            {note.title}
          </Text>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={16} color={theme.text} style={styles.timeIcon} />
            <Text style={[styles.time, { color: theme.text }]}>
              {formatReminderTime(note.reminderTime)}
            </Text>
          </View>
        </View>
        
        {note.reminderDays && note.reminderDays.length > 0 && (
          <Text style={[styles.days, { color: theme.text + '80' }]}>
            {formatReminderDays(note.reminderDays)}
          </Text>
        )}
        
        <Text 
          style={[styles.content, { color: theme.text }]} 
          numberOfLines={expanded ? 0 : 2}
        >
          {note.content}
        </Text>
      </TouchableOpacity>
      
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onEdit}
        >
          <Ionicons name="create-outline" size={20} color={theme.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleDelete}
        >
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
    overflow: 'hidden',
  },
  contentContainer: {
    padding: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIcon: {
    marginRight: 4,
  },
  time: {
    fontSize: 14,
  },
  days: {
    fontSize: 12,
    marginBottom: 4,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
});

export default NoteCard;