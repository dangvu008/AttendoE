import React, { useContext } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  View 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';
import { STATUS_TYPES } from '../context/AttendanceContext';

const MultiPurposeButton = ({ status, onPress }) => {
  const { theme } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);

  const getButtonConfig = () => {
    switch (status) {
      case STATUS_TYPES.NOT_STARTED:
        return {
          text: t('multi_purpose_button.go_work'),
          icon: 'walk-outline',
          bgColor: theme.secondary,
        };
      case STATUS_TYPES.GO_WORK:
        return {
          text: t('multi_purpose_button.check_in'),
          icon: 'log-in-outline',
          bgColor: theme.primary,
        };
      case STATUS_TYPES.CHECK_IN:
        return {
          text: t('multi_purpose_button.check_out'),
          icon: 'log-out-outline',
          bgColor: theme.accent,
        };
      case STATUS_TYPES.CHECK_OUT:
        return {
          text: t('multi_purpose_button.complete'),
          icon: 'checkmark-done-outline',
          bgColor: theme.primary,
        };
      case STATUS_TYPES.COMPLETE:
        return {
          text: t('multi_purpose_button.complete'),
          icon: 'checkmark-circle-outline',
          bgColor: theme.secondary,
        };
      default:
        return {
          text: t('multi_purpose_button.go_work'),
          icon: 'walk-outline',
          bgColor: theme.secondary,
        };
    }
  };

  const { text, icon, bgColor } = getButtonConfig();

  const isDisabled = status === STATUS_TYPES.COMPLETE;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: isDisabled ? theme.border : bgColor },
        isDisabled && styles.disabledButton,
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      <View style={styles.contentContainer}>
        <Ionicons name={icon} size={36} color="white" />
        <Text style={styles.text}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  disabledButton: {
    opacity: 0.5,
  },
  contentContainer: {
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default MultiPurposeButton;