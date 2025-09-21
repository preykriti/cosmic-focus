import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Ionicon from '@react-native-vector-icons/ionicons';

interface FriendRequestButtonProps {
  userId: string;
  isPending: boolean;
  isSent: boolean;
  onSendRequest: (userId: string) => void;
}

export const FriendRequestButton: React.FC<FriendRequestButtonProps> = ({
  userId,
  isPending,
  isSent,
  onSendRequest,
}) => {
  if (isSent) {
    return (
      <View style={styles.sentRequestBtn}>
        <Ionicon name="checkmark-circle-outline" size={16} color="#10b981" />
        <Text style={styles.sentRequestText}>Request Sent</Text>
      </View>
    );
  }

  if (isPending) {
    return (
      <View style={styles.pendingRequestBtn}>
        <ActivityIndicator size="small" color="#ffffff" />
        <Text style={styles.pendingRequestText}>Sending...</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.addFriendBtn}
      onPress={() => onSendRequest(userId)}
    >
      <Ionicon name="person-add-outline" size={16} color="#ffffff" />
      <Text style={styles.addFriendText}>Add Friend</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  addFriendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e3a8a',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  addFriendText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  pendingRequestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6b7280',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  pendingRequestText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  sentRequestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  sentRequestText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});
