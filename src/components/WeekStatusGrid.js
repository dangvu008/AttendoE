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
                <Text style={[styles.statusIcon, { color: statusInfo.color }]}>
                  {statusInfo.icon}
                </Text>
                <Text style={[styles.statusText, { color: statusInfo.color }]}>
                  {t(`status.${status.status || 'not_started'}`)}
                </Text>
              </View>
            </View>
            
            {status.goWorkTime && (
              <View style={styles.timeRow}>
                <Ionicons name="walk-outline" size={20} color={theme.text} />
                <Text style={[styles.timeText, { color: theme.text }]}>
                  {t('status.go_work')}: {format(new Date(status.goWorkTime), 'HH:mm')}
                </Text>
              </View>
            )}
            
            {status.checkInTime && (
              <View style={styles.timeRow}>
                <Ionicons name="log-in-outline" size={20} color={theme.text} />
                <Text style={[styles.timeText, { color: theme.text }]}>
                  {t('status.check_in')}: {format(new Date(status.checkInTime), 'HH:mm')}
                </Text>
              </View>
            )}
            
            {status.checkOutTime && (
              <View style={styles.timeRow}>
                <Ionicons name="log-out-outline" size={20} color={theme.text} />
                <Text style={[styles.timeText, { color: theme.text }]}>
                  {t('status.check_out')}: {format(new Date(status.checkOutTime), 'HH:mm')}
                </Text>
              </View>
            )}
            
            <View style={styles.modalButtonRow}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.changeStatusButton, { backgroundColor: theme.primary }]}
                onPress={handleStatusPress}
              >
                <Text style={styles.modalButtonText}>
                  {t('change_status')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.closeButton, { borderColor: theme.border }]}
                onPress={() => setDetailModalVisible(false)}
              >
                <Text style={[styles.closeButtonText, { color: theme.text }]}>
                  {t('close')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };
  
  const renderStatusModal = () => {
    const statuses = [
      { value: STATUS_TYPES.COMPLETE, label: t('status.complete') },
      { value: STATUS_TYPES.ABSENT, label: t('status.absent') },
      { value: STATUS_TYPES.LEAVE, label: t('status.leave') },
      { value: STATUS_TYPES.SICK, label: t('status.sick') },
      { value: STATUS_TYPES.HOLIDAY, label: t('status.holiday') },
      { value: STATUS_TYPES.LATE_OR_EARLY, label: t('status.late_or_early') },
      { value: STATUS_TYPES.NOT_STARTED, label: t('status.not_started') },
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
            
            {statuses.map((status) => (
              <TouchableOpacity
                key={status.value}
                style={[styles.statusOption, { borderBottomColor: theme.border }]}
                onPress={() => handleStatusSelection(status.value)}
              >
                <Text style={[styles.statusOptionText, { color: theme.text }]}>
                  {status.label}
                </Text>
                <View style={[styles.statusIndicator, { backgroundColor: getStatusIcon(status.value).color }]} />
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.closeButton, { borderColor: theme.border, marginTop: 16 }]}
              onPress={() => setStatusModalVisible(false)}
            >
              <Text style={[styles.closeButtonText, { color: theme.text }]}>
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
      <View style={styles.headerRow}>
        {weeklyData.map((day, index) => (
          <Text 
            key={`header-${index}`} 
            style={[styles.dayHeader, { color: theme.text }]}
          >
            {t(`weekdays.short.${index}`)}
          </Text>
        ))}
      </View>
      
      <View style={styles.daysRow}>
        {weeklyData.map((day, index) => {
          const dayDate = new Date(day.date);
          const isToday = format(today, 'yyyy-MM-dd') === format(dayDate, 'yyyy-MM-dd');
          const isFuture = dayDate > today;
          const statusInfo = getStatusIcon(day.status?.status);
          
          return (
            <TouchableOpacity
              key={`day-${index}`}
              style={[
                styles.dayCell,
                isToday && styles.todayCell,
                { 
                  borderColor: isToday ? theme.primary : theme.border,
                  backgroundColor: isToday ? theme.primary + '20' : 'transparent' 
                }
              ]}
              onPress={() => handleDayPress(day)}
              disabled={isFuture}
            >
              <Text style={[styles.dayNumber, { color: theme.text, opacity: isFuture ? 0.5 : 1 }]}>
                {format(dayDate, 'd')}
              </Text>
              <Text 
                style={[
                  styles.statusSymbol, 
                  { color: isFuture ? '#9E9E9E' : statusInfo.color }
                ]}
              >
                {isFuture ? '--' : statusInfo.icon}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      
      {renderDetailModal()}
      {renderStatusModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCell: {
    flex: 1,
    height: 70,
    margin: 2,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayCell: {
    borderWidth: 2,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusSymbol: {
    fontSize: 18,
    marginTop: 4,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '90%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  statusIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    marginLeft: 8,
    fontSize: 14,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeStatusButton: {
    marginRight: 8,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    borderWidth: 1,
    marginLeft: 8,
  },
  closeButtonText: {
    fontWeight: 'bold',
  },
  statusOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  statusOptionText: {
    fontSize: 16,
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
});

export default WeekStatusGrid;