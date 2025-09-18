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
import { StarBackground } from '../components/StarBackground';
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
    <View style={[globalStyles.container, styles.spaceContainer]}>
      <StarBackground count={40} />

      <View style={styles.searchContainer}>
        <Ionicon
          name="search-outline"
          size={20}
          color="#94a3b8"
          style={{ marginRight: 10 }}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search friends"
          placeholderTextColor="#64748b"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        contentContainerStyle={{ alignItems: 'center', paddingVertical: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* your friends*/}
        <View style={styles.holographicPanel}>
          <View style={styles.friendsHeader}>
            <Text style={styles.sectionTitle}>Your Friends</Text>
            <Text style={styles.friendsCount}>{friends.length} friends</Text>
          </View>

          {friends.map(friend => (
            <View key={friend.id} style={styles.friendItem}>
              <View style={styles.friendAvatar}>
                <Ionicon name="person-outline" size={28} color="#94a3b8" />
              </View>
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{friend.name}</Text>
                <View style={styles.streakContainer}>
                  <Ionicon name="flame-outline" size={14} color="#f59e0b" />
                  <Text style={styles.streakText}>{friend.streak}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* group session button */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={styles.spaceButton}
          onPress={handleStartGroupSession}
          activeOpacity={0.8}
        >
          <Ionicon name="people-outline" size={24} color="#ffffff" />
          <Text style={styles.spaceButtonText}>Start Group Session</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  spaceContainer: {
    flex: 1,
    backgroundColor: '#0f132cff',
  },

  searchContainer: {
    width: '94%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'center',
    marginTop: 20,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },

  holographicPanel: {
    width: '94%',
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    padding: 24,
    marginBottom: 50,
    alignSelf: 'center',
    boxShadow: `
      0 0 10px rgba(255, 255, 255, 0.15),
      0 4px 4px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1)
    `,
  },

  friendsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },

  friendsCount: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },

  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.1)',
  },

  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    marginRight: 16,
  },

  friendInfo: {
    flex: 1,
  },

  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },

  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  streakText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '500',
    marginLeft: 4,
  },

  bottomButtonContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    alignItems: 'center',
  },

  spaceButton: {
    width: '94%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    backgroundColor: '#1e3a8a',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    boxShadow: `
      0 4px 16px rgba(30, 64, 175, 0.25),
      0 0 0 1px rgba(59, 130, 246, 0.1)
    `,
  },

  spaceButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
});
