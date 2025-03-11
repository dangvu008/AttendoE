import React, { useContext, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  Alert,
  FlatList
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

// Import contexts
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';
import { WorkShiftContext } from '../context/WorkShiftContext';

// Import components
import ShiftCard from '../components/ShiftCard';

const SettingsScreen = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { locale, changeLanguage, t } = useContext(LanguageContext);
  const { workShifts, activeShift, setActiveWorkShift, deleteWorkShift } = useContext(WorkShiftContext);
  
  const [notificationSound, setNotificationSound] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [reminderSetting, setReminderSetting] = useState('when_changed');

  const handleApplyShift = (shiftId) => {
    Alert.alert(
      t('confirm'),
      t('apply_shift_confirmation'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        { 
          text: t('confirm'), 
          onPress: async () => {
            const success = await setActiveWorkShift(shiftId);
            if (success) {
              // Could show a success message here
            }
          }
        },
      ]
    );
  };

  const handleDeleteShift = (shiftId) => {
    Alert.alert(
      t('confirm'),
      t('delete_shift_confirmation'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        { 
          text: t('confirm'), 
          onPress: async () => {
            const success = await deleteWorkShift(shiftId);
            if (success) {
              // Could show a success message here
            }
          }
        },
      ]
    );
  };

  const handleAddShift = () => {
    navigation.navigate('AddEditShift');
  };

  const handleEditShift = (shift) => {
    navigation.navigate('AddEditShift', { shift });
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Work Shifts Section */}
      <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {t('work_shifts')}
        </Text>
        
        <FlatList
          data={workShifts.slice(0, 3)} // Show only first 3
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ShiftCard 
              shift={item} 
              isActive={activeShift?.id === item.id}
              onApply={() => handleApplyShift(item.id)}
              onEdit={() => handleEditShift(item)}
              onDelete={() => handleDeleteShift(item.id)}
              theme={theme}
              t={t}
            />
          )}
          scrollEnabled={false}
          ListFooterComponent={() => (
            workShifts.length > 3 ? (
              <TouchableOpacity 
                style={styles.viewMoreButton}
                onPress={() => navigation.navigate('AllShifts')}
              >
                <Text style={{ color: theme.primary }}>
                  {t('view_more')} ({workShifts.length - 3})
                </Text>
              </TouchableOpacity>
            ) : null
          )}
        />
        
        <View style={styles.reminderSettingContainer}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>
            {t('reminder_setting')}:
          </Text>
          <View style={[styles.pickerContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <Picker
              selectedValue={reminderSetting}
              style={{ color: theme.text }}
              onValueChange={(value) => setReminderSetting(value)}
              dropdownIconColor={theme.text}
            >
              <Picker.Item label={t('reminder.none')} value="none" />
              <Picker.Item label={t('reminder.when_changed')} value="when_changed" />
              <Picker.Item label={t('reminder.always')} value="always" />
            </Picker>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={handleAddShift}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>
            {t('add_shift')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* General Settings Section */}
      <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {t('general_settings')}
        </Text>

        {/* Dark Mode Toggle */}
        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <Ionicons 
              name={isDarkMode ? "moon" : "moon-outline"} 
              size={24} 
              color={theme.text} 
              style={styles.settingIcon}
            />
            <Text style={[styles.settingLabel, { color: theme.text }]}>
              {t('dark_mode')}
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: "#767577", true: theme.primary + '80' }}
            thumbColor={isDarkMode ? theme.primary : "#f4f3f4"}
          />
        </View>

        {/* Language Selector */}
        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <Ionicons 
              name="language" 
              size={24} 
              color={theme.text} 
              style={styles.settingIcon}
            />
            <Text style={[styles.settingLabel, { color: theme.text }]}>
              {t('language')}
            </Text>
          </View>
          <View style={[styles.pickerContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <Picker
              selectedValue={locale}
              style={{ color: theme.text, width: 150 }}
              onValueChange={(value) => changeLanguage(value)}
              dropdownIconColor={theme.text}
            >
              <Picker.Item label="Tiếng Việt 🇻🇳" value="vi" />
              <Picker.Item label="English 🇬🇧" value="en" />
            </Picker>
          </View>
        </View>

        {/* Notification Sound Toggle */}
        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <Ionicons 
              name={notificationSound ? "volume-high" : "volume-mute"} 
              size={24} 
              color={theme.text} 
              style={styles.settingIcon}
            />
            <Text style={[styles.settingLabel, { color: theme.text }]}>
              {t('notification_sound')} 🔊
            </Text>
          </View>
          <Switch
            value={notificationSound}
            onValueChange={setNotificationSound}
            trackColor={{ false: "#767577", true: theme.primary + '80' }}
            thumbColor={notificationSound ? theme.primary : "#f4f3f4"}
          />
        </View>

        {/* Vibration Toggle */}
        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <Ionicons 
              name="phone-portrait-outline" 
              size={24} 
              color={theme.text} 
              style={styles.settingIcon}
            />
            <Text style={[styles.settingLabel, { color: theme.text }]}>
              {t('vibration')} 📳
            </Text>
          </View>
          <Switch
            value={vibration}
            onValueChange={setVibration}
            trackColor={{ false: "#767577", true: theme.primary + '80' }}
            thumbColor={vibration ? theme.primary : "#f4f3f4"}
          />
        </View>
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
  section: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  reminderSettingContainer: {
    marginVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewMoreButton: {
    alignItems: 'center',
    padding: 8,
    marginVertical: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#CCCCCC',
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 8,
  },
  settingLabel: {
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },
});

export default SettingsScreen;