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
        return '#bd3636ff';
      case 'sleep':
        return '#8b5cf6';
      case 'workout':
        return '#127709ff';
      default:
        return '#64748b';
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {task.title}
        </Text>
        <View
          style={[
            styles.tag,
            {
              borderColor: getTagColor(task.tag),
              backgroundColor: `${getTagColor(task.tag)}15`, // faint bg
            },
          ]}
        >
          <Text style={[styles.tagText, { color: getTagColor(task.tag) }]}>
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

      {/* progress*/}
      <View style={styles.hoursContainer}>
        <Text style={styles.hoursText}>
          {task.hoursDone}h of {task.allocatedHours}h
        </Text>
        <Text
          style={[styles.progressPercent, { color: getTagColor(task.tag) }]}
        >
          {Math.round(progress * 100)}%
        </Text>
      </View>

      {/* progress bar */}
      <View style={styles.progressBarBackground}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${Math.min(100, progress * 100)}%`,
              backgroundColor: getTagColor(task.tag),
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#1e293b',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 60,
    alignItems: 'center',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  description: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  hoursContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  hoursText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
