import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicon from '@react-native-vector-icons/ionicons';

interface FriendRequest {
  id: string;
  fromUsername: string;
  from: string;
  to: string;
}

interface FriendRequestItemProps {
  request: FriendRequest;
  onAccept: (requestId: string, from: string, to: string) => void;
  onDecline: (requestId: string) => void;
}

export const FriendRequestItem: React.FC<FriendRequestItemProps> = ({
  request,
  onAccept,
  onDecline,
}) => {
  return (
    <View style={styles.friendItem}>
      {/* avatar */}
      <View style={styles.friendAvatar}>
        <Ionicon name="person-outline" size={24} color="#1e3a8a" />
      </View>

      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{request.fromUsername}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() => onAccept(request.id, request.from, request.to)}
          >
            <Ionicon name="checkmark" size={16} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.declineBtn}
            onPress={() => onDecline(request.id)}
          >
            <Ionicon name="close" size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
  buttonContainer: {
    flexDirection: 'row',
  },
  acceptBtn: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  declineBtn: {
    backgroundColor: '#d46363ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  friendAvatar: {
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c7d2fe',
    marginRight: 12,
  },
});
