import React, { useContext, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

// Import contexts
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';
import { WorkShiftContext } from '../context/WorkShiftContext';
import { AttendanceContext, STATUS_TYPES } from '../context/AttendanceContext';
import { NotesContext } from '../context/NotesContext';

// Import components
import MultiPurposeButton from '../components/MultiPurposeButton';
import WeekStatusGrid from '../components/WeekStatusGrid';
import NoteCard from '../components/NoteCard';

const HomeScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);
  const { getCurrentShiftForToday } = useContext(WorkShiftContext);
  const { todayStatus, handleMultiPurposeButton, resetTodayStatus } = useContext(AttendanceContext);
  const { notes, getRecentNotes } = useContext(NotesContext);
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [buttonState, setButtonState] = useState(todayStatus.status);
  const [todayShift, setTodayShift] = useState(null);
  const [recentNotes, setRecentNotes] = useState([]);

  useEffect(() => {
    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    // Load today's shift
    setTodayShift(getCurrentShiftForToday());
    
    // Load recent notes
    setRecentNotes(getRecentNotes(3));
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setButtonState(todayStatus.status);
  }, [todayStatus]);

  useEffect(() => {
    setRecentNotes(getRecentNotes(3));
  }, [notes]);

  const handleButtonPress = async () => {
    // Check if we need to show confirmation for time constraints
    if (todayStatus.status === STATUS_TYPES.GO_WORK && 
        todayStatus.goWorkTime && 
        (new Date() - new Date(todayStatus.goWorkTime)) < 300000) { // 5 minutes
      Alert.alert(
        t('confirm'),
        t('time_constraint_warning'),
        [
          {
            text: t('cancel'),
            style: 'cancel',
          },
          { 
            text: t('confirm'), 
            onPress: async () => {
              const success = await handleMultiPurposeButton();
              if (success) {
                setButtonState(todayStatus.status);
              }
            }
          },
        ]
      );
    } else if (todayStatus.status === STATUS_TYPES.CHECK_IN && 
               todayStatus.checkInTime && 
               (new Date() - new Date(todayStatus.checkInTime)) < 7200000) { // 2 hours
      Alert.alert(
        t('confirm'),
        t('time_constraint_warning'),
        [
          {
            text: t('cancel'),
            style: 'cancel',
          },
          { 
            text: t('confirm'), 
            onPress: async () => {
              const success = await handleMultiPurposeButton();
              if (success) {
                setButtonState(todayStatus.status);
              }
            }
          },
        ]
      );
    } else {
      const success = await handleMultiPurposeButton();
      if (success) {
        setButtonState(todayStatus.status);
      }
    }
  };

  const handleResetPress = () => {
    Alert.alert(
      t('confirm'),
      t('reset_confirmation'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        { 
          text: t('confirm'), 
          onPress: async () => {
            const success = await resetTodayStatus();
            if (success) {
              setButtonState(STATUS_TYPES.NOT_STARTED);
            }
          }
        },
      ]
    );
  };

  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    return format(new Date(isoString), 'HH:mm');
  };

  const renderStatusTimeline = () => {
    return (
      <View style={styles.timelineContainer}>
        {todayStatus.goWorkTime && (
          <View style={styles.timelineItem}>
            <Ionicons name="walk-outline" size={20} color={theme.text} />
            <Text style={[styles.timelineText, { color: theme.text }]}>
              {t('status.go_work')}: {formatTime(todayStatus.goWorkTime)}
            </Text>
          </View>
        )}
        
        {todayStatus.checkInTime && (
          <View style={styles.timelineItem}>
            <Ionicons name="log-in-outline" size={20} color={theme.text} />
            <Text style={[styles.timelineText, { color: theme.text }]}>
              {t('status.check_in')}: {formatTime(todayStatus.checkInTime)}
            </Text>
          </View>
        )}
        
        {todayStatus.checkOutTime && (
          <View style={styles.timelineItem}>
            <Ionicons name="log-out-outline" size={20} color={theme.text} />
            <Text style={[styles.timelineText, { color: theme.text }]}>
              {t('status.check_out')}: {formatTime(todayStatus.checkOutTime)}
            </Text>
          </View>
        )}
        
        {todayStatus.completeTime && (
          <View style={styles.timelineItem}>
            <Ionicons name="checkmark-done-outline" size={20} color={theme.text} />
            <Text style={[styles.timelineText, { color: theme.text }]}>
              {t('status.complete')}: {formatTime(todayStatus.completeTime)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Current Date and Time */}
      <View style={styles.dateTimeContainer}>
        <Text style={[styles.date, { color: theme.text }]}>
          {format(currentTime, 'EEEE, dd/MM/yyyy')}
        </Text>
        <Text style={[styles.time, { color: theme.text }]}>
          {format(currentTime, 'HH:mm')}
        </Text>
      </View>

      {/* Current Shift Info */}
      <View style={[styles.shiftContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {t('current_shift')}
        </Text>
        {todayShift ? (
          <View>
            <Text style={[styles.shiftName, { color: theme.text }]}>
              {todayShift.name}
            </Text>
            <Text style={[styles.shiftTime, { color: theme.text }]}>
              {todayShift.startTime} - {todayShift.endTime}
            </Text>
          </View>
        ) : (
          <Text style={[styles.noShift, { color: theme.text }]}>
            No shift scheduled for today
          </Text>
        )}
      </View>

      {/* Multi-Purpose Button and Status Timeline */}
      <View style={styles.actionContainer}>
        <View style={styles.buttonContainer}>
          <MultiPurposeButton 
            status={buttonState} 
            onPress={handleButtonPress}
          />
          
          {buttonState !== STATUS_TYPES.NOT_STARTED && (
            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={handleResetPress}
            >
              <Ionicons name="refresh-outline" size={20} color={theme.error} />
            </TouchableOpacity>
          )}
        </View>
        
        {renderStatusTimeline()}
      </View>

      {/* Weekly Status Grid */}
      <View style={[styles.weekStatusContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {t('weekly_status')}
        </Text>
        <WeekStatusGrid />
      </View>

      {/* Work Notes */}
      <View style={[styles.notesContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.noteHeaderContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {t('notes')}
          </Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('AddEditNote')}
          >
            <Ionicons name="add-circle" size={24} color={theme.primary} />
            <Text style={[styles.addButtonText, { color: theme.primary }]}>
              {t('add_note')}
            </Text>
          </TouchableOpacity>
        </View>
        
        {recentNotes.length > 0 ? (
          <FlatList
            data={recentNotes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <NoteCard 
                note={item} 
                onEdit={() => navigation.navigate('AddEditNote', { note: item })}
              />
            )}
            scrollEnabled={false}
          />
        ) : (
          <Text style={[styles.noNotes, { color: theme.text }]}>
            {t('no_notes')}
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  dateTimeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  date: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  time: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  shiftContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  shiftName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  shiftTime: {
    fontSize: 16,
  },
  noShift: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  actionContainer: {
    marginBottom: 20,
  },
  buttonContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  resetButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 8,
  },
  timelineContainer: {
    marginTop: 10,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineText: {
    marginLeft: 8,
    fontSize: 14,
  },
  weekStatusContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
  },
  notesContainer: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  noteHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    marginLeft: 4,
    fontWeight: 'bold',
  },
  noNotes: {
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  }
});

export default HomeScreen;