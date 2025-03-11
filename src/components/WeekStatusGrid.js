import React, { useContext, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal 
} from 'react-native';
import { format, startOfWeek, addDays } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';
import { AttendanceContext, STATUS_TYPES } from '../context/AttendanceContext';

const WeekStatusGrid = () => {
  const { theme } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);
  const { getWeeklyAttendance, updateDateStatus } = useContext(AttendanceContext);
  
  const [selectedDay, setSelectedDay] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  
  const weeklyData = getWeeklyAttendance();
  const today = new Date();
  
  const getStatusIcon = (status) => {
    switch (status) {
      case STATUS_TYPES.COMPLETE:
        return { icon: '✅', color: '#4CAF50' };
      case STATUS_TYPES.GO_WORK:
      case STATUS_TYPES.CHECK_IN:
      case STATUS_TYPES.CHECK_OUT:
        return { icon: '❗', color: '#FF9800' };
      case STATUS_TYPES.ABSENT:
        return { icon: '❌', color: '#F44336' };
      case STATUS_TYPES.LEAVE:
        return { icon: '📩', color: '#2196F3' };
      case STATUS_TYPES.SICK:
        return { icon: '🛌', color: '#9C27B0' };
      case STATUS_TYPES.HOLIDAY:
        return { icon: '🎌', color: '#E91E63' };
      case STATUS_TYPES.LATE_OR_EARLY:
        return { icon: 'RV', color: '#FF5722' };
      default:
        return { icon: '--', color: '#9E9E9E' };
    }
  };
  
  const handleDayPress = (day) => {
    // Don't allow selection of future dates
    if (new Date(day.date) > today) {
      return;
    }
    
    setSelectedDay(day);
    setDetailModalVisible(true);
  };
  
  const handleStatusPress = () => {
    setDetailModalVisible(false);
    setStatusModalVisible(true);
  };
  
  const handleStatusSelection = async (status) => {
    if (selectedDay) {
      await updateDateStatus(selectedDay.date, { status });
      setStatusModalVisible(false);
    }
  };
  
  const renderWeekGrid = () => {
    // Start from Monday (1) to Sunday (7)
    const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const currentDate = new Date();
    const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
    
    return (
      <View style={styles.weekContainer}>
        {/* Day headers */}
        <View style={styles.dayHeaderRow}>
          {days.map((day, index) => (
            <View key={`header-${index}`} style={styles.dayHeaderCell}>
              <Text style={[styles.dayHeaderText, { color: index === 6 ? theme.error : theme.text }]}>
                {day}
              </Text>
            </View>
          ))}
        </View>
        
        {/* Date numbers */}
        <View style={styles.dateRow}>
          {days.map((_, index) => {
            const date = addDays(startOfCurrentWeek, index);
            const dateStr = format(date, 'dd');
            const isToday = format(date, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');
            
            return (
              <View key={`date-${index}`} style={styles.dateCell}>
                <Text 
                  style={[
                    styles.dateText, 
                    { color: theme.text },
                    isToday && styles.todayText
                  ]}
                >
                  {dateStr}
                </Text>
              </View>
            );
          })}
        </View>
        
        {/* Status icons */}
        <View style={styles.statusRow}>
          {days.map((_, index) => {
            const date = addDays(startOfCurrentWeek, index);
            const dateStr = format(date, 'yyyy-MM-dd');
            const dayData = weeklyData[dateStr] || { status: null };
            const isFutureDate = date > currentDate;
            
            // Don't show status for future dates
            const statusInfo = isFutureDate 
              ? { icon: '?', color: '#9E9E9E' }
              : getStatusIcon(dayData.status);
            
            return (
              <TouchableOpacity 
                key={`status-${index}`} 
                style={[
                  styles.statusCell,
                  { borderColor: statusInfo.color + '80' }
                ]}
                onPress={() => handleDayPress({ date: dateStr, status: dayData })}
                disabled={isFutureDate}
              >
                <Text style={[styles.statusIcon, { color: statusInfo.color }]}>
                  {statusInfo.icon}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        
        {/* Time row */}
        <View style={styles.timeRow}>
          {days.map((_, index) => {
            const date = addDays(startOfCurrentWeek, index);
            const dateStr = format(date, 'yyyy-MM-dd');
            const dayData = weeklyData[dateStr] || {};
            const isFutureDate = date > currentDate;
            
            // Don't show times for future dates
            const timeText = isFutureDate 
              ? '-\n-'
              : `${dayData.startTime || '08:00'}\n${dayData.endTime || '20:00'}`;
            
            return (
              <View key={`time-${index}`} style={styles.timeCell}>
                <Text style={[styles.timeText, { color: theme.text }]}>
                  {timeText}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };
  
  const renderDetailModal = () => {
    if (!selectedDay) return null;
    
    const { date, status } = selectedDay;
    const statusInfo = getStatusIcon(status.status);
    
    return (
      <Modal
        visible={detailModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {format(new Date(date), 'EEEE, dd/MM/yyyy')}
            </Text>
            
            <View style={styles.statusContainer}>
              <Text style={[styles.statusLabel, { color: theme.text }]}>
                {t('status.label')}:
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '30' }]}>
                <Text style={[styles.statusText, { color: statusInfo.color }]}>
                  {t(`status.${status.status || 'not_started'}`)}
                </Text>
              </View>
            </View>
            
            <View style={styles.timeDetails}>
              {status.goWorkTime && (
                <View style={styles.timeItem}>
                  <Ionicons name="walk-outline" size={20} color={theme.text} />
                  <Text style={[styles.timeItemText, { color: theme.text }]}>
                    {t('status.go_work')}: {format(new Date(status.goWorkTime), 'HH:mm')}
                  </Text>
                </View>
              )}
              
              {status.checkInTime && (
                <View style={styles.timeItem}>
                  <Ionicons name="log-in-outline" size={20} color={theme.text} />
                  <Text style={[styles.timeItemText, { color: theme.text }]}>
                    {t('status.check_in')}: {format(new Date(status.checkInTime), 'HH:mm')}
                  </Text>
                </View>
              )}
              
              {status.checkOutTime && (
                <View style={styles.timeItem}>
                  <Ionicons name="log-out-outline" size={20} color={theme.text} />
                  <Text style={[styles.timeItemText, { color: theme.text }]}>
                    {t('status.check_out')}: {format(new Date(status.checkOutTime), 'HH:mm')}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
                onPress={handleStatusPress}
              >
                <Text style={styles.modalButtonText}>
                  {t('change_status')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: theme.border }]}
                onPress={() => setDetailModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>
                  {t('close')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };
  
  const renderStatusSelectionModal = () => {
    const statusOptions = [
      { status: STATUS_TYPES.COMPLETE, label: t('status.complete') },
      { status: STATUS_TYPES.ABSENT, label: t('status.absent') },
      { status: STATUS_TYPES.LEAVE, label: t('status.leave') },
      { status: STATUS_TYPES.SICK, label: t('status.sick') },
      { status: STATUS_TYPES.HOLIDAY, label: t('status.holiday') },
      { status: STATUS_TYPES.LATE_OR_EARLY, label: t('status.late_or_early') },
    ];
    
    return (
      <Modal
        visible={statusModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {t('select_status')}
            </Text>
            
            <View style={styles.statusOptionsContainer}>
              {statusOptions.map((option, index) => {
                const statusInfo = getStatusIcon(option.status);
                
                return (
                  <TouchableOpacity 
                    key={index}
                    style={[styles.statusOption, { borderColor: theme.border }]}
                    onPress={() => handleStatusSelection(option.status)}
                  >
                    <Text style={[styles.statusOptionIcon, { color: statusInfo.color }]}>
                      {statusInfo.icon}
                    </Text>
                    <Text style={[styles.statusOptionText, { color: theme.text }]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: theme.border }]}
              onPress={() => setStatusModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>
                {t('cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };
  
  return (
    <View style={styles.container}>
      {renderWeekGrid()}
      {renderDetailModal()}
      {renderStatusSelectionModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  weekContainer: {
    width: '100%',
  },
  dayHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: 'center',
  },
  dayHeaderText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateCell: {
    flex: 1,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
  },
  todayText: {
    fontWeight: 'bold',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderWidth: 2,
    borderRadius: 20,
    marginHorizontal: 2,
  },
  statusIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeCell: {
    flex: 1,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontWeight: 'bold',
    marginLeft: 5,
  },
  timeDetails: {
    marginBottom: 15,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeItemText: {
    marginLeft: 8,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  statusOptionsContainer: {
    marginBottom: 15,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  statusOptionIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
    width: 30,
    textAlign: 'center',
  },
  statusOptionText: {
    fontSize: 16,
  },
});

export default WeekStatusGrid;