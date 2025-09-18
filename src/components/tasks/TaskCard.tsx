import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Task } from '../../types/task';

type TaskCardProps = {
  task: Task;
  onPress: () => void;
};

export default function TaskCard({ task, onPress }: TaskCardProps) {
  const progress = task.hoursDone / task.allocatedHours;

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'study':
        return '#3b82f6';
      case 'work':
        return '#ef4444';
      case 'sleep':
        return '#8b5cf6';
      case 'workout':
        return '#22c55e';
      default:
        return '#64748b';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {task.title}
        </Text>
        <View style={[styles.tag, { backgroundColor: getTagColor(task.tag) }]}>
          <Text style={styles.tagText}>{task.tag}</Text>
        </View>
      </View>

      {task.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {task.description}
        </Text>
      ) : null}

      <View style={styles.hoursContainer}>
        <Text style={styles.hoursText}>
          {task.hoursDone}h of {task.allocatedHours}h
        </Text>
        <Text style={styles.progressPercent}>
          {Math.round(progress * 100)}%
        </Text>
      </View>

      {/* progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${Math.min(100, progress * 100)}%` },
            ]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    boxShadow: `
      0 0 10px rgba(255, 255, 255, 0.12),
      0 4px 8px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.08)
    `,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
    textShadowColor: 'rgba(96, 165, 250, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 70,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  description: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  hoursContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hoursText: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '500',
  },
  progressPercent: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '700',
  },
  progressBarContainer: {
    width: '100%',
    marginTop: 4,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: 'rgba(148, 163, 184, 0.25)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
    boxShadow: '0 0 8px rgba(59, 130, 246, 0.6)',
  },
});
