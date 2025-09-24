import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicon from '@react-native-vector-icons/ionicons';
import { FriendRequestButton } from './FriendRequestButton';

interface User {
  id: string;
  username: string;
}

interface SearchResultItemProps {
  user: User;
  isFriend: boolean;
  streak?: number;
  isPending: boolean;
  isSent: boolean;
  onSendRequest: (userId: string) => void;
}

export default function SearchResultItem({
  user,
  isFriend,
  streak,
  isPending,
  isSent,
  onSendRequest,
}: SearchResultItemProps) {
  return (
    <View style={styles.friendItem}>
      {/* avatar */}
      <View style={styles.friendAvatar}>
        <Ionicon name="person-outline" size={24} color="#1e3a8a" />
      </View>

      <View style={styles.friendInfo}>
        <View style={styles.userDetails}>
          <Text style={styles.friendName}>{user.username}</Text>

          {/* Show streak if friends */}
          {isFriend && (
            <View style={styles.streakRow}>
              <View style={styles.streakContainer}>
                <Ionicon name="flame" size={12} color="#fff" />
                <Text style={styles.streakNumber}>{streak ?? 0}</Text>
              </View>
              <Text style={styles.streakLabel}>day streak</Text>
            </View>
          )}
        </View>

        {!isFriend && (
          <FriendRequestButton
            userId={user.id}
            isPending={isPending}
            isSent={isSent}
            onSendRequest={onSendRequest}
          />
        )}
        {isFriend && (
          <View style={styles.friendBadge}>
            <Text style={styles.friendBadgeText}>Friend</Text>
          </View>
        )}
      </View>
    </View>
  );
}

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
  userDetails: {
    flex: 1,
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
  friendBadge: {
    backgroundColor: '#f0fdf4',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  friendBadgeText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '600',
  },
});
