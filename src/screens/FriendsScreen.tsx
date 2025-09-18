import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
} from 'react-native';
import { globalStyles } from '../styles/global';
import Ionicon from '@react-native-vector-icons/ionicons';

export default function FriendsScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const friends = [
    { id: 1, name: 'Alex Johnson', streak: 15 },
    { id: 2, name: 'Sarah Chen', streak: 8 },
    { id: 3, name: 'Mike Rodriguez', streak: 23 },
    { id: 4, name: 'Emma Wilson', streak: 12 },
    { id: 5, name: 'James Brown', streak: 5 },
    { id: 6, name: 'Lisa Davis', streak: 18 },
    { id: 7, name: 'David Garcia', streak: 10 },
    { id: 8, name: 'Sophia Martinez', streak: 7 },
    { id: 9, name: 'Chris Lee', streak: 14 },
    { id: 10, name: 'Olivia Kim', streak: 20 },
    { id: 11, name: 'Daniel Walker', streak: 6 },
  ];

  const handleStartGroupSession = () => {};

  return (
    <View style={[globalStyles.container, styles.container]}>
      {/* search bar */}
      <View style={styles.searchContainer}>
        <Ionicon
          name="search-outline"
          size={20}
          color="#64748b"
          style={{ marginRight: 8 }}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search friends"
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* friends card */}
      <View style={styles.card}>
        <ScrollView
          contentContainerStyle={styles.friendsScrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.friendsHeader}>
            <Text style={styles.sectionTitle}>Your Friends</Text>
            <Text style={styles.friendsCount}>{friends.length} friends</Text>
          </View>

          {friends.map(friend => (
            <View key={friend.id} style={styles.friendItem}>
              <View style={styles.friendAvatar}>
                <Ionicon name="person-outline" size={24} color="#3b82f6" />
              </View>
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{friend.name}</Text>
                <View style={styles.streakRow}>
                  <View style={styles.streakContainer}>
                    <Ionicon name="flame" size={12} color="#fff" />
                    <Text style={styles.streakNumber}>{friend.streak}</Text>
                  </View>
                  {/* <Text style={styles.streakLabel}>day streak</Text> */}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* group session button */}
      <TouchableOpacity
        style={styles.groupButton}
        onPress={handleStartGroupSession}
        activeOpacity={0.8}
      >
        <Ionicon name="people-outline" size={20} color="#ffffff" />
        <Text style={styles.groupButtonText}>Start Group Session</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    // marginBottom: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    // padding: 16,
    marginBottom: 10,
    elevation: 2,
  },
  friendsScrollContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  friendsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  friendsCount: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 12,
  },
  friendInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
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
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
    marginLeft: 4,
  },
  streakLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  groupButton: {
    position: 'absolute',
    bottom: 54,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 14,
    backgroundColor: '#1e3a8a',
  },
  groupButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
