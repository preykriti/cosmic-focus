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
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');

  const friends = [
    { id: 1, name: 'alexjohnson', streak: 15 },
    { id: 2, name: 'sarahchen', streak: 8 },
    { id: 3, name: 'mikerodriguez', streak: 23 },
  ];

  const friendRequests = [
    { id: 101, name: 'newuser1' },
    { id: 102, name: 'newuser2' },
  ];

  const handleStartGroupSession = () => {};

  return (
    <View style={[globalStyles.container, styles.container]}>
      {/* search bar */}
      <View style={styles.searchContainer}>
        <Ionicon
          name="search-outline"
          size={18}
          color="#64748b"
          style={{ marginRight: 6 }}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search friends"
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicon name="close-circle" size={18} color="#64748b" />
          </TouchableOpacity>
        )}
      </View>

      {/* tab navigator */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'friends' && styles.activeTabText,
            ]}
          >
            Friends
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'requests' && styles.activeTabText,
            ]}
          >
            Friend Requests
          </Text>
        </TouchableOpacity>
      </View>

      {/* content */}
      <View style={styles.card}>
        <ScrollView
          contentContainerStyle={styles.friendsScrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'friends' ? (
            <>
              <View style={styles.friendsHeader}>
                <Text style={styles.sectionTitle}>Your Friends</Text>
                <Text style={styles.friendsCount}>
                  {friends.length} friends
                </Text>
              </View>

              {friends.map(friend => (
                <TouchableOpacity
                  key={friend.id}
                  style={styles.friendItem}
                  activeOpacity={0.7}
                >
                  <View style={styles.friendAvatar}>
                    <Ionicon name="person-outline" size={24} color="#1e3a8a" />
                  </View>
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{friend.name}</Text>
                    <View style={styles.streakRow}>
                      <View style={styles.streakContainer}>
                        <Ionicon name="flame" size={12} color="#fff" />
                        <Text style={styles.streakNumber}>{friend.streak}</Text>
                      </View>
                      <Text style={styles.streakLabel}>day streak</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <>
              <View style={styles.friendsHeader}>
                <Text style={styles.sectionTitle}>Friend Requests</Text>
                <Text style={styles.friendsCount}>
                  {friendRequests.length} requests
                </Text>
              </View>

              {friendRequests.map(req => (
                <View key={req.id} style={styles.friendItem}>
                  <View style={styles.friendAvatar}>
                    <Ionicon name="person-outline" size={24} color="#1e3a8a" />
                  </View>
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{req.name}</Text>
                    <View style={{ flexDirection: 'row' }}>
                      <TouchableOpacity style={styles.acceptBtn}>
                        <Ionicon name="checkmark" size={16} color="#ffffff" />
                        {/* <Text style={styles.btnText}>Accept</Text> */}
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.declineBtn}>
                        <Ionicon name="close" size={16} color="#ffffff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      </View>

      {/* group session button */}
      {activeTab === 'friends' && (
        <TouchableOpacity
          style={styles.groupButton}
          onPress={handleStartGroupSession}
          activeOpacity={0.9}
        >
          <Ionicon name="people-outline" size={20} color="#ffffff" />
          <Text style={styles.groupButtonText}>Start Group Session</Text>
        </TouchableOpacity>
      )}
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
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    paddingVertical: 0,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#1e3a8a',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  activeTabText: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 10,
    elevation: 2,
    flex: 1,
  },
  friendsScrollContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  friendsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e3a8a',
  },
  friendsCount: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
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
  groupButton: {
    position: 'absolute',
    bottom: 40,
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
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
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
  btnText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
});
