import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchFriends,
  fetchIncomingRequests,
  acceptRequest,
  declineRequest,
  searchUsersByUsername,
  sendRequest,
  clearSearchResults,
} from '../store/slices/friendsSlice';

export const useFriendsLogic = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(
    new Set(),
  );
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dispatch = useAppDispatch();
  const { friends, incoming, searchResults, loading, error } = useAppSelector(
    state => state.friends,
  );
  const { user } = useAppSelector(state => state.auth);

  const showSearchResults = searchQuery.trim().length > 0;

  const filteredFriends = useMemo(
    () =>
      friends.filter(friend =>
        friend.username.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [friends, searchQuery],
  );

  const filteredSearchResults = useMemo(
    () => searchResults.filter(result => result.id !== user?.id),
    [searchResults, user?.id],
  );

  useEffect(() => {
    if (!user?.id) return;
    dispatch(clearSearchResults());
    dispatch(fetchFriends(user.id));
    dispatch(fetchIncomingRequests(user.id));
  }, [dispatch, user?.id]);

  const handleAccept = async (reqId: string, from: string, to: string) => {
    try {
      await dispatch(acceptRequest({ requestId: reqId, from, to })).unwrap();
      if (user?.id) {
        dispatch(fetchFriends(user.id));
        dispatch(fetchIncomingRequests(user.id));
      }
    } catch (error) {
      console.error('Failed to accept friend request:', error);
    }
  };

  const handleDecline = async (reqId: string) => {
    try {
      await dispatch(declineRequest(reqId)).unwrap();
      if (user?.id) {
        dispatch(fetchIncomingRequests(user.id));
      }
    } catch (error) {
      console.error('Failed to decline friend request:', error);
    }
  };

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }

      if (query.trim().length > 0) {
        searchTimerRef.current = setTimeout(() => {
          dispatch(searchUsersByUsername(query.trim()));
        }, 500);
      }
    },
    [dispatch],
  );

  const handleSendRequest = async (toUserId: string) => {
    if (!user?.id) return;

    setPendingRequests(prev => new Set(prev).add(toUserId));

    try {
      await dispatch(sendRequest({ fromUserId: user.id, toUserId })).unwrap();
      setSentRequests(prev => new Set(prev).add(toUserId));
      setPendingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(toUserId);
        return newSet;
      });
    } catch (error) {
      setPendingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(toUserId);
        return newSet;
      });
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
      searchTimerRef.current = null;
    }
  };

  const isUserFriend = useCallback(
    (userId: string) => {
      return friends.some(friend => friend.id === userId);
    },
    [friends],
  );

  const getFriendStreak = useCallback(
    (userId: string) => {
      const friend = friends.find(friend => friend.id === userId);
      return friend?.streak ?? 0;
    },
    [friends],
  );

  return {
    // state
    searchQuery,
    activeTab,
    showSearchResults,
    filteredFriends,
    filteredSearchResults,
    friends,
    incoming,
    loading,
    error,
    pendingRequests,
    sentRequests,

    //  actions
    setActiveTab,
    handleSearch,
    clearSearch,
    handleAccept,
    handleDecline,
    handleSendRequest,
    isUserFriend,
    getFriendStreak,
  };
};
