import React, { useCallback, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { globalStyles } from '../styles/global';
import { SearchBar } from '../components/friends/SearchBar';
import TabNavigator from '../components/friends/TabNavigator';
import SectionHeader from '../components/friends/SectionHeader';
import EmptyState from '../components/friends/EmptyState';
import FriendItem from '../components/friends/FriendItem';
import SearchResultItem from '../components/friends/SearchResultItem';
import FriendRequestItem from '../components/friends/FriendRequestItem';
import { useFriendsLogic } from '../hooks/useFriendsLogic';
import { Text } from 'react-native-gesture-handler';
import { PomodoroLengthModal } from '../components/groupSession/PomodoroLengthModal';
import { FriendSelectionModal } from '../components/groupSession/FriendsSelectionModal';
import { useNavigation } from '@react-navigation/core';
import { GroupParticipant } from '../types/focusSession';
import {
  createFocusSession,
  CreateSessionData,
} from '../firebase/firestore/focusSession';
import { useAppSelector } from '../store/hooks';
import { Timestamp } from '@react-native-firebase/firestore';
import { SessionDebugComponent } from '../components/SessionDebug';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../types/navigation';

export default function FriendsScreen() {
  const {
    searchQuery,
    activeTab,
    showSearchResults,
    filteredFriends,
    filteredSearchResults,
    incoming,
    loading,
    error,
    pendingRequests,
    sentRequests,
    setActiveTab,
    handleSearch,
    clearSearch,
    handleAccept,
    handleDecline,
    handleSendRequest,
    isUserFriend,
    getFriendStreak,
  } = useFriendsLogic();

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [pomodoroModalVisible, setPomodoroModalVisible] =
    useState<boolean>(false);
  const [friendModalVisible, setFriendModalVisible] = useState<boolean>(false);
  const [selectedPomodoro, setSelectedPomodoro] = useState<{
    work: number;
    breakTime: number;
  } | null>(null);
  const { user } = useAppSelector(state => state.auth);
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  const handleStartGroupSession = () => setPomodoroModalVisible(true);

  const handlePomodoroSelect = (work: number, breakTime: number) => {
    setSelectedPomodoro({ work, breakTime });
    setPomodoroModalVisible(false);
    setFriendModalVisible(true);
  };

  const handleFriendConfirm = async (selectedFriends: any[]) => {
    console.log('Selected friends:', selectedFriends);
    console.log('Pomodoro length:', selectedPomodoro);

    if (!selectedPomodoro || !user?.id || !user?.username) {
      console.error('Missing required data:', {
        selectedPomodoro,
        userId: user?.id,
        username: user?.username,
      });
      return;
    }

    try {
      const invitedParticipants: GroupParticipant[] = selectedFriends.map(
        friend => ({
          userId: friend.id,
          username: friend.name || friend.username,
          status: 'invited',
          joinedAt: Timestamp.now(),
          starsEarned: 0,
        }),
      );

      // add host as participant
      const hostParticipant: GroupParticipant = {
        userId: user.id,
        username: user.username,
        status: 'active',
        joinedAt: Timestamp.now(),
        starsEarned: 0,
      };

      // combine all participants: host + invited friends
      const allParticipants = [hostParticipant, ...invitedParticipants];

      const sessionData: CreateSessionData = {
        sessionMode: 'group',
        hostUserId: user.id,
        groupName: 'Focus Group Session',
        participants: allParticipants,
        sessionType: 'pomodoro',
        duration: selectedPomodoro.work,
        autoStartNext: false,
        currentCycle: 1,
        totalCycles: 1,
      };

      console.log('Creating session with data:', sessionData);

      const sessionResult = await createFocusSession(sessionData);

      console.log('Session created successfully:', sessionResult);

      setFriendModalVisible(false);
      navigation.navigate('Lobby', { sessionId: sessionResult.id });
    } catch (err) {
      console.error('Error creating group session:', err);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await handleSearch(searchQuery);
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setRefreshing(false);
    }
  }, [handleSearch, searchQuery]);

  const renderSearchResults = () => (
    <>
      <SectionHeader
        title="Search Results"
        count={filteredSearchResults.length}
        countLabel="users found"
      />

      {error ? (
        <EmptyState
          type="error"
          error={`Search failed: ${error}`}
          onRetry={() => handleSearch(searchQuery)}
        />
      ) : loading ? (
        <EmptyState type="loading" message="Searching for users..." />
      ) : filteredSearchResults.length === 0 ? (
        <EmptyState type="search-empty" searchQuery={searchQuery} />
      ) : (
        <FlatList
          data={filteredSearchResults}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <SearchResultItem
              user={item}
              isFriend={isUserFriend(item.id)}
              streak={getFriendStreak(item.id)}
              isPending={pendingRequests.has(item.id)}
              isSent={sentRequests.has(item.id)}
              onSendRequest={handleSendRequest}
            />
          )}
          contentContainerStyle={styles.friendsScrollContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </>
  );

  const renderFriendsList = () => (
    <>
      <SectionHeader
        title="Your Friends"
        count={filteredFriends.length}
        countLabel="friends"
      />

      {filteredFriends.length === 0 ? (
        <EmptyState
          type="empty"
          message={
            searchQuery
              ? `No friends found matching "${searchQuery}"`
              : 'No friends yet. Search for users to connect with!'
          }
        />
      ) : (
        <FlatList
          data={filteredFriends}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <FriendItem friend={item} />}
          contentContainerStyle={styles.friendsScrollContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </>
  );

  const renderRequestsList = () => (
    <>
      <SectionHeader
        title="Friend Requests"
        count={incoming.length}
        countLabel="requests"
      />

      {incoming.length === 0 ? (
        <EmptyState type="empty" message="No pending friend requests" />
      ) : (
        <FlatList
          data={incoming}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <FriendRequestItem
              request={item}
              onAccept={handleAccept}
              onDecline={handleDecline}
            />
          )}
          contentContainerStyle={styles.friendsScrollContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </>
  );

  return (
    <View style={[globalStyles.container, styles.container]}>
      <SearchBar
        searchQuery={searchQuery}
        onSearch={handleSearch}
        onClear={clearSearch}
        loading={loading}
      />

      {!showSearchResults && (
        <TabNavigator
          activeTab={activeTab}
          onTabChange={setActiveTab}
          friendsCount={filteredFriends.length}
          requestsCount={incoming.length}
        />
      )}

      <View style={styles.card}>
        {showSearchResults && renderSearchResults()}
        {!showSearchResults && activeTab === 'friends' && renderFriendsList()}
        {!showSearchResults && activeTab === 'requests' && renderRequestsList()}
      </View>

      <TouchableOpacity
        style={styles.startGroupButton}
        onPress={handleStartGroupSession}
      >
        <Text style={styles.startGroupButtonText}>Start Group Session</Text>
      </TouchableOpacity>
      <SessionDebugComponent />

      <PomodoroLengthModal
        visible={pomodoroModalVisible}
        onClose={() => setPomodoroModalVisible(false)}
        onSelectLength={handlePomodoroSelect}
      />

      <FriendSelectionModal
        visible={friendModalVisible}
        friends={filteredFriends}
        onClose={() => setFriendModalVisible(false)}
        onConfirm={handleFriendConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingTop: 20,
    marginBottom: 40,
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
  startGroupButton: {
    margin: 10,
    padding: 12,
    backgroundColor: '#6366F1',
    borderRadius: 8,
  },
  startGroupButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
