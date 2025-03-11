import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';

export const WorkShiftContext = createContext();

// Default work shifts
const defaultWorkShifts = [
  {
    id: '1',
    name: 'Ca ngày',
    departureTime: '07:00',
    startTime: '08:00',
    endTime: '17:00',
    reminderBefore: 30, // minutes
    reminderAfter: 15, // minutes
    showSignButton: true,
    daysApplied: [1, 2, 3, 4, 5], // Monday to Friday
  },
  {
    id: '2',
    name: 'Ca đêm',
    departureTime: '21:00',
    startTime: '22:00',
    endTime: '06:00',
    reminderBefore: 30,
    reminderAfter: 15,
    showSignButton: true,
    daysApplied: [1, 2, 3, 4, 5],
  },
  {
    id: '3',
    name: 'Ca hành chính',
    departureTime: '07:30',
    startTime: '08:00',
    endTime: '17:30',
    reminderBefore: 30,
    reminderAfter: 15,
    showSignButton: true,
    daysApplied: [1, 2, 3, 4, 5],
  },
  {
    id: '4',
    name: 'Ca 1',
    departureTime: '05:30',
    startTime: '06:00',
    endTime: '14:00',
    reminderBefore: 30,
    reminderAfter: 15,
    showSignButton: true,
    daysApplied: [1, 2, 3, 4, 5, 6],
  },
  {
    id: '5',
    name: 'Ca 2',
    departureTime: '13:30',
    startTime: '14:00',
    endTime: '22:00',
    reminderBefore: 30,
    reminderAfter: 15,
    showSignButton: true,
    daysApplied: [1, 2, 3, 4, 5, 6],
  },
  {
    id: '6',
    name: 'Ca 3',
    departureTime: '21:30',
    startTime: '22:00',
    endTime: '06:00',
    reminderBefore: 30,
    reminderAfter: 15,
    showSignButton: true,
    daysApplied: [1, 2, 3, 4, 5, 6],
  }
];

export const WorkShiftProvider = ({ children }) => {
  const [workShifts, setWorkShifts] = useState([]);
  const [activeShift, setActiveShift] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkShifts();
  }, []);

  const loadWorkShifts = async () => {
    try {
      setLoading(true);
      const shiftsData = await AsyncStorage.getItem('workShifts');
      const activeShiftData = await AsyncStorage.getItem('activeShift');
      
      if (!shiftsData) {
        // First run - initialize with default shifts
        await AsyncStorage.setItem('workShifts', JSON.stringify(defaultWorkShifts));
        setWorkShifts(defaultWorkShifts);
        
        // Set the first shift as active by default
        await AsyncStorage.setItem('activeShift', defaultWorkShifts[0].id);
        setActiveShift(defaultWorkShifts[0]);
      } else {
        setWorkShifts(JSON.parse(shiftsData));
        
        if (activeShiftData) {
          const activeId = activeShiftData;
          const activeShiftObj = JSON.parse(shiftsData).find(shift => shift.id === activeId);
          setActiveShift(activeShiftObj || null);
        }
      }
    } catch (e) {
      console.error('Failed to load work shifts', e);
    } finally {
      setLoading(false);
    }
  };

  const saveWorkShifts = async (shifts) => {
    try {
      await AsyncStorage.setItem('workShifts', JSON.stringify(shifts));
      setWorkShifts(shifts);
    } catch (e) {
      console.error('Failed to save work shifts', e);
    }
  };

  const addWorkShift = async (shift) => {
    try {
      const newShift = {
        ...shift,
        id: Date.now().toString()
      };
      const updatedShifts = [...workShifts, newShift];
      await saveWorkShifts(updatedShifts);
      return true;
    } catch (e) {
      console.error('Failed to add work shift', e);
      return false;
    }
  };

  const updateWorkShift = async (updatedShift) => {
    try {
      const updatedShifts = workShifts.map(shift => 
        shift.id === updatedShift.id ? updatedShift : shift
      );
      await saveWorkShifts(updatedShifts);
      
      // Update active shift if it's the one being edited
      if (activeShift && activeShift.id === updatedShift.id) {
        setActiveShift(updatedShift);
      }
      return true;
    } catch (e) {
      console.error('Failed to update work shift', e);
      return false;
    }
  };

  const deleteWorkShift = async (shiftId) => {
    try {
      const updatedShifts = workShifts.filter(shift => shift.id !== shiftId);
      await saveWorkShifts(updatedShifts);
      
      // If active shift is deleted, set the first available shift as active
      if (activeShift && activeShift.id === shiftId) {
        if (updatedShifts.length > 0) {
          await setActiveWorkShift(updatedShifts[0].id);
        } else {
          await AsyncStorage.removeItem('activeShift');
          setActiveShift(null);
        }
      }
      return true;
    } catch (e) {
      console.error('Failed to delete work shift', e);
      return false;
    }
  };

  const setActiveWorkShift = async (shiftId) => {
    try {
      const shiftToActivate = workShifts.find(shift => shift.id === shiftId);
      if (!shiftToActivate) {
        throw new Error('Shift not found');
      }
      
      await AsyncStorage.setItem('activeShift', shiftId);
      setActiveShift(shiftToActivate);
      return true;
    } catch (e) {
      console.error('Failed to set active work shift', e);
      return false;
    }
  };
  
  const getCurrentShiftForToday = () => {
    if (!activeShift) return null;
    
    const today = new Date();
    const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); // Convert Sunday (0) to 7 for easier comparison
    
    // Check if the active shift applies to today
    if (activeShift.daysApplied.includes(dayOfWeek)) {
      return activeShift;
    }
    
    return null;
  };

  return (
    <WorkShiftContext.Provider value={{
      workShifts,
      activeShift,
      loading,
      addWorkShift,
      updateWorkShift,
      deleteWorkShift,
      setActiveWorkShift,
      getCurrentShiftForToday
    }}>
      {children}
    </WorkShiftContext.Provider>
  );
};