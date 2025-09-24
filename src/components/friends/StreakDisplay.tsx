import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicon from '@react-native-vector-icons/ionicons';

interface StreakDisplayProps {
  streak: number;
}

export default function StreakDisplay({ streak }: StreakDisplayProps) {
  return (
    <View style={styles.streakRow}>
      <View style={styles.streakContainer}>
        <Ionicon name="flame" size={12} color="#fff" />
        <Text style={styles.streakNumber}>{streak}</Text>
      </View>
      <Text style={styles.streakLabel}>day streak</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginRight: 6,
  },
  streakNumber: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 3,
  },
  streakLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '400',
  },
});
