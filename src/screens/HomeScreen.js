import React, { useContext, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  FlatList,
  Modal
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
  const [buttonHistory, setButtonHistory] = useState([]);

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
    
    // Update button history when status changes
    if (todayStatus.goWorkTime && !buttonHistory.find(h => h.type === 'go_work')) {
      setButtonHistory(prev => [...prev, {
        type: 'go_work',
        time: todayStatus.goWorkTime,
        label: t('status.go_work')
      }]);
    }
    
    if (todayStatus.checkInTime && !buttonHistory.find(h => h.type === 'check_in')) {
      setButtonHistory(prev => [...prev, {
        type: 'check_in',
        time: todayStatus.checkInTime,
        label: t('status.check_in')
      }]);
    }
    
    if (todayStatus.checkOutTime && !buttonHistory.find(h => h.type === 'check_out')) {
      setButtonHistory(prev => [...prev, {
        type: 'check_out',
        time: todayStatus.checkOutTime,
        label: t('status.check_out')
      }]);
    }
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
              setButtonHistory([]);
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

  const formatDate = (date) => {
    const day = format(date, 'EEEE');
    const dayOfMonth = format(date, 'dd/MM');
    return { day, dayOfMonth };
  };

  const renderStatusTimeline = () => {
    if (buttonHistory.length === 0) {
      return (
        <View style={styles.timelineContainer}>
          <Text style={[styles.noStatusText, { color: theme.text }]}>
            {t('status.not_started')}
          </Text>
        </View>
      );
    }
    
    return (
      <View style={styles.timelineContainer}>
        {buttonHistory.map((item, index) => (
          <View key={index} style={styles.timelineItem}>
            <Ionicons 
              name={getIconForStatus(item.type)} 
              size={20} 
              color={theme.text} 
            />
            <Text style={[styles.timelineText, { color: theme.text }]}>
              {item.label}: {formatTime(item.time)}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const getIconForStatus = (status) => {
    switch (status) {
      case 'go_work':
        return 'walk-outline';
      case 'check_in':
        return 'log-in-outline';
      case 'check_out':
        return 'log-out-outline';
      case 'complete':
        return 'checkmark-done-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const { day, dayOfMonth } = formatDate(currentTime);

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Time Manager</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.statsIcon}>
            <Ionicons name="stats-chart-outline" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Current Date and Time */}
      <View style={styles.mainContent}>
        <View style={styles.dateTimeContainer}>
          <Text style={[styles.time, { color: theme.text }]}>
            {format(currentTime, 'HH:mm')}
          </Text>
          <Text style={[styles.date, { color: theme.text }]}>
            {t(`weekdays.${format(currentTime, 'EEEE').toLowerCase()}`)} {format(currentTime, 'dd/MM')}
          </Text>
        </View>

        {/* Current Shift Info */}
        <View style={[styles.shiftContainer, { backgroundColor: theme.mode === 'dark' ? '#1E1E1E' : '#F5F5F5', borderColor: theme.border }]}>
          <Ionicons name="calendar-outline" size={24} color={theme.primary} />
          <Text style={[styles.shiftLabel, { color: theme.text }]}>
            {t('current_shift')}
          </Text>
          <Text style={[styles.shiftTime, { color: theme.text }]}>
            {todayShift ? `${todayShift.startTime} → ${todayShift.endTime}` : '--:-- → --:--'}
          </Text>
        </View>
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
      <View style={[styles.weekStatusContainer, { backgroundColor: theme.mode === 'dark' ? '#1E1E1E' : '#F5F5F5', borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {t('weekly_status')}
        </Text>
        <WeekStatusGrid />
      </View>

      {/* Work Notes */}
      <View style={styles.notesSection}>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsIcon: {
    marginLeft: 16,
  },
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  dateTimeContainer: {
    alignItems: 'flex-start',
  },
  date: {
    fontSize: 16,
  },
  time: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  shiftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  shiftLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  shiftTime: {
    fontSize: 16,
  },
  actionContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  buttonContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  resetButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 20,
    padding: 8,
  },
  timelineContainer: {
    marginTop: 10,
    alignItems: 'center',
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
  noStatusText: {
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
  weekStatusContainer: {
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
  notesSection: {
    marginBottom: 20,
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