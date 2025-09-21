import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../../constants/colors';

interface Task {
  id: string;
  title: string;
  description?: string;
  tag: string;
  priority: 'low' | 'medium' | 'high';
  pomodoroLength: 25 | 50;
  breakLength: 5 | 10;
  plannedPomodoros: number;
  completedPomodoros: number;
  userId: string;
  createdAt: any;
  updatedAt: any;
}

type TaskCardProps = {
  task: Task;
  onPress: () => void;
};

export default function TaskCard({ task, onPress }: TaskCardProps) {
  const progress = task.completedPomodoros / task.plannedPomodoros;

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return colors.light.primary;
      case 'medium':
        return `${colors.light.primary}80`;
      case 'low':
        return `${colors.light.primary}40`;
      default:
        return colors.light.border;
    }
  };

  const getTagColor = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'study':
        return { bg: '#FEF3C7', text: '#D97706', border: '#FCD34D' };
      case 'work':
        return { bg: '#DBEAFE', text: '#2563EB', border: '#93C5FD' };
      case 'sleep':
        return { bg: '#E0E7FF', text: '#7C3AED', border: '#C4B5FD' };
      case 'workout':
        return { bg: '#DCFCE7', text: '#16A34A', border: '#86EFAC' };
      case 'other':
        return { bg: '#FCE7F3', text: '#EC4899', border: '#F9A8D4' };
      default:
        return { bg: '#F1F5F9', text: '#64748B', border: '#CBD5E1' };
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* priority color strip */}
      <View
        style={[
          styles.priorityStrip,
          { backgroundColor: getPriorityColor(task.priority) },
        ]}
      />

      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {task.title}
          </Text>
          <View
            style={[
              styles.tag,
              {
                backgroundColor: getTagColor(task.tag).bg,
                borderColor: getTagColor(task.tag).border,
              },
            ]}
          >
            <Text
              style={[
                styles.tagText,
                {
                  color: getTagColor(task.tag).text,
                },
              ]}
            >
              {task.tag}
            </Text>
          </View>
        </View>

        {/* description */}
        {task.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {task.description}
          </Text>
        ) : null}

        {/* pomodoro info */}
        <View style={styles.infoRow}>
          <View style={styles.infoBadge}>
            <Text style={styles.infoText}>
              {task.pomodoroLength}/{task.breakLength}
            </Text>
          </View>

          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {task.completedPomodoros}/{task.plannedPomodoros}
            </Text>
          </View>
        </View>

        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${
                  isNaN(progress) ? 0 : Math.min(100, progress * 100)
                }%`,
              },
            ]}
          />
        </View>

        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
          <LinearGradient
            colors={[colors.light.gradientStart, colors.light.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.startButton}
          >
            <Ionicons name="play" size={16} color={colors.white} />
            <Text style={styles.startButtonText}>Start</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.light.card,
    borderRadius: 16,
    marginBottom: 26,
    borderWidth: 1,
    borderColor: colors.light.border,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    flexDirection: 'row',
  },
  priorityStrip: {
    width: 8,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    color: colors.light.text,
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
    lineHeight: 24,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
    backgroundColor: colors.light.surface,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
    color: colors.light.textSecondary,
  },
  description: {
    color: colors.light.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.light.surface,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.light.text,
  },

  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    color: colors.light.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: colors.light.textSecondary + '25',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.light.textSecondary + '50',
    // backgroundColor: "#CBD5E1"
  },
  startButton: {
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 3,
    shadowColor: colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  startButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
  },
});
