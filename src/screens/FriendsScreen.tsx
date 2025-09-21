import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { globalStyles } from '../styles/global';
import { SearchBar } from '../components/friends/SearchBar';
import { TabNavigator } from '../components/friends/TabNavigator';
import { SectionHeader } from '../components/friends/SectionHeader';
import { EmptyState } from '../components/friends/EmptyState';
import { FriendItem } from '../components/friends/FriendItem';
import { SearchResultItem } from '../components/friends/SearchResultItem';
import { FriendRequestItem } from '../components/friends/FriendRequestItem';
import { useFriendsLogic } from '../hooks/useFriendsLogic';

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
});
