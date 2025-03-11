import React, { useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';

const ShiftCard = ({ shift, isActive, onApply, onEdit, onDelete, theme, t }) => {
  // Use the passed theme and t if available, otherwise use context
  const themeContext = useContext(ThemeContext);
  const langContext = useContext(LanguageContext);
  
  const effectiveTheme = theme || themeContext.theme;
  const effectiveT = t || langContext.t;
  
  const formatDays = (days) => {
    if (!days || days.length === 0) return '';
    if (days.length === 7) return effectiveT('everyday');
    
    return days
      .sort((a, b) => a - b)
      .map(day => effectiveT(`weekdays.short.${day - 1}`))
      .join(', ');
  };

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: isActive ? effectiveTheme.primary + '15' : effectiveTheme.surface,
          borderColor: isActive ? effectiveTheme.primary : effectiveTheme.border
        }
      ]}
    >
      <View style={styles.infoSection}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: effectiveTheme.text }]}>
            {shift.name}
          </Text>
          {isActive && (
            <View style={[styles.activeBadge, { backgroundColor: effectiveTheme.primary }]}>
              <Text style={styles.activeText}>{effectiveT('active')}</Text>
            </View>
          )}
        </View>
        
        <Text style={[styles.time, { color: effectiveTheme.text }]}>
          {shift.startTime} - {shift.endTime}
        </Text>
        
        <Text style={[styles.subtitle, { color: effectiveTheme.text + '80' }]}>
          {effectiveT('departure')}: {shift.departureTime}
        </Text>
        
        <Text style={[styles.days, { color: effectiveTheme.text + '80' }]}>
          {formatDays(shift.daysApplied)}
        </Text>
      </View>
      
      <View style={styles.actionsSection}>
        <TouchableOpacity 
          style={[
            styles.actionButton, 
            isActive && styles.disabledActionButton
          ]} 
          onPress={onApply}
          disabled={isActive}
        >
          <Ionicons 
            name={isActive ? "checkmark-circle" : "checkmark-circle-outline"} 
            size={24} 
            color={isActive ? effectiveTheme.primary : effectiveTheme.text} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={onEdit}
        >
          <Ionicons name="create-outline" size={24} color={effectiveTheme.text} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={onDelete}
        >
          <Ionicons name="trash-outline" size={24} color={effectiveTheme.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  infoSection: {
    flex: 1,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  time: {
    fontSize: 16,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  days: {
    fontSize: 12,
  },
  actionsSection: {
    borderLeftWidth: 1,
    borderLeftColor: '#EEEEEE',
  },
  actionButton: {
    padding: 12,
  },
  disabledActionButton: {
    opacity: 0.5,
  },
});

export default ShiftCard;