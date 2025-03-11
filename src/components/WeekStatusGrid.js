import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
} from "react-native";
import { format, startOfWeek, addDays } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";
import { LanguageContext } from "../context/LanguageContext";
import { AttendanceContext, STATUS_TYPES } from "../context/AttendanceContext";

const WeekStatusGrid = () => {
  const { theme } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);
  const { getWeeklyAttendance, updateDateStatus, getDateHistory } =
    useContext(AttendanceContext);

  const [selectedDay, setSelectedDay] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.3))[0];

  useEffect(() => {
    if (detailModalVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.3);
    }
  }, [detailModalVisible]);

  const weeklyData = getWeeklyAttendance();
  const today = new Date();

  const getStatusIcon = (status) => {
    switch (status) {
      case STATUS_TYPES.COMPLETE:
        return { icon: "✅", color: "#4CAF50", label: t("status.complete") };
      case STATUS_TYPES.INCOMPLETE:
        return { icon: "❗", color: "#FF9800", label: t("status.incomplete") };
      case STATUS_TYPES.ABSENT:
        return { icon: "❌", color: "#F44336", label: t("status.absent") };
      case STATUS_TYPES.LEAVE:
        return { icon: "📩", color: "#2196F3", label: t("status.leave") };
      case STATUS_TYPES.SICK:
        return { icon: "🛌", color: "#9C27B0", label: t("status.sick") };
      case STATUS_TYPES.HOLIDAY:
        return { icon: "🎌", color: "#E91E63", label: t("status.holiday") };
      case STATUS_TYPES.LATE_OR_EARLY:
        return {
          icon: "RV",
          color: "#FF5722",
          label: t("status.late_or_early"),
        };
      default:
        return { icon: "❓", color: "#9E9E9E", label: t("status.not_set") };
    }
  };

  const handleDayPress = (day) => {
    if (new Date(day.date) > today) {
      return;
    }
    setSelectedDay(day);
    setDetailModalVisible(true);
  };

  const renderWeekGrid = () => {
    const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    const currentDate = new Date();
    const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });

    return (
      <View style={styles.weekContainer}>
        <View style={styles.dayHeaderRow}>
          {days.map((day, index) => (
            <View key={`header-${index}`} style={styles.dayHeaderCell}>
              <Text
                style={[
                  styles.dayHeaderText,
                  { color: index === 6 ? theme.error : theme.text },
                ]}
              >
                {day}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.dateRow}>
          {days.map((_, index) => {
            const date = addDays(startOfCurrentWeek, index);
            const dateStr = format(date, "dd");
            const isToday =
              format(date, "yyyy-MM-dd") === format(currentDate, "yyyy-MM-dd");
            const dayData = weeklyData.find(
              (d) =>
                format(new Date(d.date), "yyyy-MM-dd") ===
                format(date, "yyyy-MM-dd")
            );
            const status = dayData
              ? getStatusIcon(dayData.status)
              : getStatusIcon();

            return (
              <TouchableOpacity
                key={`date-${index}`}
                style={[styles.dateCell, isToday && styles.todayCell]}
                onPress={() =>
                  handleDayPress(
                    dayData || {
                      date: format(date, "yyyy-MM-dd"),
                      status: null,
                    }
                  )
                }
              >
                <Text style={[styles.dateText, { color: theme.text }]}>
                  {dateStr}
                </Text>
                <Text style={[styles.workHours, { color: theme.text }]}>
                  08:00 - 20:00
                </Text>
                <Text style={[styles.statusIcon, { color: status.color }]}>
                  {status.icon}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderWeekGrid()}

      <Modal
        animationType="none"
        transparent={true}
        visible={detailModalVisible}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <TouchableOpacity
          style={[styles.modalOverlay, { opacity: fadeAnim }]}
          activeOpacity={1}
          onPress={() => setDetailModalVisible(false)}
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.background,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {selectedDay && (
              <>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  {format(new Date(selectedDay.date), "dd/MM/yyyy")}
                </Text>
                <Text style={[styles.modalWorkHours, { color: theme.text }]}>
                  {t("workHours")}: 08:00 - 20:00
                </Text>
                <Text style={[styles.modalStatus, { color: theme.text }]}>
                  {t("status.current")}:{" "}
                  {getStatusIcon(selectedDay.status).label}
                </Text>
                <View style={styles.statusOptions}>
                  {Object.values(STATUS_TYPES).map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusOption,
                        { backgroundColor: getStatusIcon(status).color },
                      ]}
                      onPress={() => {
                        updateDateStatus(selectedDay.date, status);
                        setDetailModalVisible(false);
                      }}
                    >
                      <Text style={styles.statusOptionText}>
                        {getStatusIcon(status).icon}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.historyContainer}>
                  <Text style={[styles.historyTitle, { color: theme.text }]}>
                    {t("history.title")}
                  </Text>
                  {getDateHistory(selectedDay.date).map((record, index) => (
                    <Text
                      key={index}
                      style={[styles.historyItem, { color: theme.text }]}
                    >
                      {format(new Date(record.timestamp), "HH:mm")} -{" "}
                      {record.action}
                    </Text>
                  ))}
                </View>
              </>
            )}
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "transparent",
  },
  weekContainer: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dayHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#007AFF",
    paddingVertical: 10,
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: "center",
  },
  dayHeaderText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  dateRow: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
  },
  dateCell: {
    flex: 1,
    alignItems: "center",
    padding: 8,
    borderWidth: 0.5,
    borderColor: "#E0E0E0",
  },
  todayCell: {
    backgroundColor: "#E3F2FD",
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statusIcon: {
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    borderRadius: 15,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalStatus: {
    fontSize: 16,
    marginBottom: 15,
  },
  statusOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
  },
  statusOption: {
    margin: 5,
    padding: 10,
    borderRadius: 8,
    minWidth: 50,
    alignItems: "center",
  },
  statusOptionText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  historyContainer: {
    marginTop: 10,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  historyItem: {
    fontSize: 14,
    marginBottom: 5,
    paddingLeft: 10,
  },
});
export default WeekStatusGrid;
