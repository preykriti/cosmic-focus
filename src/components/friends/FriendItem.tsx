import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicon from '@react-native-vector-icons/ionicons';

interface Friend {
  id: string;
  username: string;
  streak?: number;
}

interface FriendItemProps {
  friend: Friend;
  onPress?: () => void;
}

export const FriendItem = ({ friend, onPress }: FriendItemProps) => {
  return (
    <TouchableOpacity
      style={styles.friendItem}
      activeOpacity={0.7}
      onPress={onPress}
    >
      {/* avatar */}
      <View style={styles.friendAvatar}>
        <Ionicon name="person-outline" size={24} color="#1e3a8a" />
      </View>

      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{friend.username}</Text>

        {/* streak display */}
        <View style={styles.streakRow}>
          <View style={styles.streakContainer}>
            <Ionicon name="flame" size={12} color="#fff" />
            <Text style={styles.streakNumber}>{friend.streak ?? 0}</Text>
          </View>
          <Text style={styles.streakLabel}>day streak</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  friendAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c7d2fe',
    marginRight: 12,
  },
  friendInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  friendName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
  },
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
