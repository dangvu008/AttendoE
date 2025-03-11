import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';

export const AttendanceContext = createContext();

// Status constants
export const STATUS_TYPES = {
  NOT_STARTED: 'not_started', 
  GO_WORK: 'go_work',
  CHECK_IN: 'check_in',
  CHECK_OUT: 'check_out',
  COMPLETE: 'complete',
  ABSENT: 'absent',
  LEAVE: 'leave',
  SICK: 'sick',
  HOLIDAY: 'holiday',
  LATE_OR_EARLY: 'late_or_early',
};

export const AttendanceProvider = ({ children }) => {
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [todayStatus, setTodayStatus] = useState({
    status: STATUS_TYPES.NOT_STARTED,
    goWorkTime: null,
    checkInTime: null,
    checkOutTime: null,
    completeTime: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttendanceRecords();
  }, []);

  const loadAttendanceRecords = async () => {
    try {
      setLoading(true);
      const data = await AsyncStorage.getItem('attendanceRecords');
      const todayData = await AsyncStorage.getItem(`attendance_${format(new Date(), 'yyyy-MM-dd')}`);
      
      if (data) {
        setAttendanceRecords(JSON.parse(data));
      }
      
      if (todayData) {
        setTodayStatus(JSON.parse(todayData));
      } else {
        // Reset today's status if not exists
        setTodayStatus({
          status: STATUS_TYPES.NOT_STARTED,
          goWorkTime: null,
          checkInTime: null,
          checkOutTime: null,
          completeTime: null,
        });
      }
    } catch (e) {
      console.error('Failed to load attendance records', e);
    } finally {
      setLoading(false);
    }
  };

  const updateTodayStatus = async (newStatus) => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const updatedStatus = { ...todayStatus, ...newStatus };
      
      // Save today's status
      await AsyncStorage.setItem(`attendance_${today}`, JSON.stringify(updatedStatus));
      setTodayStatus(updatedStatus);
      
      // Update the attendance records
      const updatedRecords = { ...attendanceRecords };
      updatedRecords[today] = updatedStatus;
      await AsyncStorage.setItem('attendanceRecords', JSON.stringify(updatedRecords));
      setAttendanceRecords(updatedRecords);
      
      return true;
    } catch (e) {
      console.error('Failed to update today\'s status', e);
      return false;
    }
  };

  const resetTodayStatus = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const resetStatus = {
        status: STATUS_TYPES.NOT_STARTED,
        goWorkTime: null,
        checkInTime: null,
        checkOutTime: null,
        completeTime: null,
      };
      
      await AsyncStorage.setItem(`attendance_${today}`, JSON.stringify(resetStatus));
      setTodayStatus(resetStatus);
      
      // Update the attendance records
      const updatedRecords = { ...attendanceRecords };
      updatedRecords[today] = resetStatus;
      await AsyncStorage.setItem('attendanceRecords', JSON.stringify(updatedRecords));
      setAttendanceRecords(updatedRecords);
      
      return true;
    } catch (e) {
      console.error('Failed to reset today\'s status', e);
      return false;
    }
  };

  const updateDateStatus = async (date, status) => {
    try {
      const formattedDate = format(new Date(date), 'yyyy-MM-dd');
      
      // Update the attendance records
      const updatedRecords = { ...attendanceRecords };
      updatedRecords[formattedDate] = status;
      await AsyncStorage.setItem('attendanceRecords', JSON.stringify(updatedRecords));
      setAttendanceRecords(updatedRecords);
      
      // If it's today, also update today's status
      if (formattedDate === format(new Date(), 'yyyy-MM-dd')) {
        await AsyncStorage.setItem(`attendance_${formattedDate}`, JSON.stringify(status));
        setTodayStatus(status);
      }
      
      return true;
    } catch (e) {
      console.error('Failed to update date status', e);
      return false;
    }
  };

  const getWeeklyAttendance = (startDate = new Date()) => {
    const result = [];
    const currentDate = new Date(startDate);
    
    // Go to Monday of the current week
    const day = currentDate.getDay();
    const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    currentDate.setDate(diff);
    
    // Get records for the 7 days of the week
    for (let i = 0; i < 7; i++) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      result.push({
        date: new Date(currentDate),
        dateStr,
        status: attendanceRecords[dateStr] || { status: STATUS_TYPES.NOT_STARTED }
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return result;
  };

  // Check if we can transition to the next status
  const canTransition = (from, to) => {
    // Define valid transitions
    const validTransitions = {
      [STATUS_TYPES.NOT_STARTED]: [STATUS_TYPES.GO_WORK, STATUS_TYPES.ABSENT, STATUS_TYPES.LEAVE, STATUS_TYPES.SICK, STATUS_TYPES.HOLIDAY],
      [STATUS_TYPES.GO_WORK]: [STATUS_TYPES.CHECK_IN],
      [STATUS_TYPES.CHECK_IN]: [STATUS_TYPES.CHECK_OUT],
      [STATUS_TYPES.CHECK_OUT]: [STATUS_TYPES.COMPLETE],
    };
    
    return validTransitions[from]?.includes(to) || false;
  };

  // Handle the multi-purpose button press
  const handleMultiPurposeButton = async () => {
    const now = new Date();
    
    switch (todayStatus.status) {
      case STATUS_TYPES.NOT_STARTED:
        return await updateTodayStatus({ 
          status: STATUS_TYPES.GO_WORK,
          goWorkTime: now.toISOString(),
        });
      
      case STATUS_TYPES.GO_WORK:
        // Check minimum time difference (5 minutes = 300000 ms)
        if (todayStatus.goWorkTime && (now - new Date(todayStatus.goWorkTime)) < 300000) {
          // We should ask for confirmation here in the UI
          return false;
        }
        return await updateTodayStatus({ 
          status: STATUS_TYPES.CHECK_IN,
          checkInTime: now.toISOString(),
        });
      
      case STATUS_TYPES.CHECK_IN:
        // Check minimum time difference (2 hours = 7200000 ms)
        if (todayStatus.checkInTime && (now - new Date(todayStatus.checkInTime)) < 7200000) {
          // We should ask for confirmation here in the UI
          return false;
        }
        return await updateTodayStatus({ 
          status: STATUS_TYPES.CHECK_OUT,
          checkOutTime: now.toISOString(),
        });
      
      case STATUS_TYPES.CHECK_OUT:
        return await updateTodayStatus({ 
          status: STATUS_TYPES.COMPLETE,
          completeTime: now.toISOString(),
        });
      
      default:
        return false;
    }
  };

  return (
    <AttendanceContext.Provider value={{
      attendanceRecords,
      todayStatus,
      loading,
      updateTodayStatus,
      resetTodayStatus,
      updateDateStatus,
      getWeeklyAttendance,
      handleMultiPurposeButton,
      STATUS_TYPES
    }}>
      {children}
    </AttendanceContext.Provider>
  );
};