import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchFriendFeeds,
  likeFeed,
  unlikeFeed,
  addComment,
  fetchCommentsForFeed,
  Feed,
  createFeed,
} from '../store/slices/feedSlice';
import CommentModal from '../components/feed/CommentModal';
import Ionicons from '@react-native-vector-icons/ionicons';
import { MainStackParamList } from '../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type FeedScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'Feed'
>;
type FeedScreenRouteProp = RouteProp<MainStackParamList, 'Feed'>;

type FeedScreenProps = {
  navigation: FeedScreenNavigationProp;
  route: FeedScreenRouteProp;
};

export default function FeedScreen({ navigation }: FeedScreenProps) {
  const dispatch = useAppDispatch();
  const userId = useAppSelector(state => state.auth.user?.id);
  const userUsername = useAppSelector(state => state.auth.user?.username);
  const friends = useAppSelector(state => state.friends.friends);

  const friendIds = useMemo(() => friends.map(friend => friend.id), [friends]);

  const { feeds, loading, error, commentsMap } = useAppSelector(
    state => state.feeds,
  );

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [commentModalVisible, setCommentModalVisible] =
    useState<boolean>(false);
  const [selectedFeed, setSelectedFeed] = useState<Feed | null>(null);
  const [commentsExpanded, setCommentsExpanded] = useState<Set<string>>(
    new Set(),
  );
  const [initialLoad, setInitialLoad] = useState<boolean>(true);

  useEffect(() => {
    if (userId && friendIds.length >= 0 && initialLoad) {
      dispatch(fetchFriendFeeds(friendIds)).finally(() => {
        setInitialLoad(false);
      });
    }
  }, [dispatch, friendIds, initialLoad, userId]);

  const formatTimeAgo = (date: Date | null): string => {
    if (!date) return 'Just now';

    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleLike = (feed: Feed): void => {
    if (!userId) return;

    if (feed.likes.includes(userId)) {
      dispatch(unlikeFeed({ feedId: feed.id, userId }));
    } else {
      dispatch(likeFeed({ feedId: feed.id, userId }));
    }
  };

  const handleComment = (feed: Feed): void => {
    setSelectedFeed(feed);
    setCommentModalVisible(true);
  };

  const handleAddComment = (text: string): void => {
    if (!selectedFeed || !userId) return;
    console.log('adding comment', text);
    dispatch(
      addComment({
        feedId: selectedFeed.id,
        userId,
        text,
      }),
    );
  };

  const toggleComments = (feedId: string): void => {
    setCommentsExpanded(prev => {
      const newSet = new Set(prev);
      if (newSet.has(feedId)) {
        newSet.delete(feedId);
      } else {
        newSet.add(feedId);
        if (!commentsMap[feedId]) {
          dispatch(fetchCommentsForFeed(feedId));
        }
      }
      return newSet;
    });
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (friendIds.length > 0) {
      dispatch(fetchFriendFeeds(friendIds)).finally(() => {
        setRefreshing(false);
      });
    } else {
      setRefreshing(false);
    }
  }, [dispatch, friendIds]);

  const handleCreateDummyPost = async () => {
    if (!userId || !userUsername) {
      Alert.alert('Error', 'You need to be logged in to create a post');
      return;
    }

    try {
      await dispatch(
        createFeed({
          userId,
          type: 'session',
          amount: 15,
          message: '',
        }),
      ).unwrap();

      Alert.alert('Success', 'Dummy post created!');
    } catch (err) {
      Alert.alert('Error', 'Failed to create dummy post: ' + err);
    }
  };

  const getGradientColors = (type: string): string[] => {
    switch (type) {
      case 'session':
        return ['#667eea', '#764ba2'];
      case 'stars':
        return ['#ffeaa7', '#fdcb6e'];
      case 'days':
        return ['#a29bfe', '#6c5ce7'];
      default:
        return ['#667eea', '#764ba2'];
    }
  };

  const getBadge = (type: string): string => {
    switch (type) {
      case 'session':
        return '🧘‍♀️';
      case 'stars':
        return '⭐';
      case 'days':
        return '🔥';
      default:
        return '🎉';
    }
  };

  const getAchievementText = (type: string, amount: number): string => {
    switch (type) {
      case 'session':
        return `Completed ${amount} focus session${amount > 1 ? 's' : ''}`;
      case 'stars':
        return `Earned ${amount} star${amount > 1 ? 's' : ''}`;
      case 'days':
        return `Reached ${amount}-day streak`;
      default:
        return `Achieved ${amount} ${type}`;
    }
  };

  const renderFeedCard = ({ item }: { item: Feed }) => {
    const isLiked = userId ? item.likes.includes(userId) : false;
    const showAllComments = commentsExpanded.has(item.id);
    const comments = commentsMap[item.id] || [];
    const commentsToShow = showAllComments ? comments : comments.slice(0, 2);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person-outline" size={20} color="#fff" />
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.userName}>{item.username}</Text>
            {/* <Text style={styles.timestamp}>
              {formatTimeAgo(item.createdAt as Date)}
            </Text> */}
            {/* <Text style={styles.timestamp}>1 min ago</Text> */}
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{getBadge(item.type)}</Text>
          </View>
        </View>

        <LinearGradient
          colors={getGradientColors(item.type)}
          style={styles.achievementBanner}
        >
          <View style={styles.achievementContent}>
            <Text style={styles.achievementTitle}>
              {getAchievementText(item.type, item.amount)}
            </Text>
            {item.message && (
              <Text style={styles.achievementDescription}>{item.message}</Text>
            )}
          </View>
        </LinearGradient>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLike(item)}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={20}
              color={isLiked ? '#e74c3c' : '#64748b'}
            />
            <Text style={[styles.actionText, isLiked && styles.likedText]}>
              {item.likes.length}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleComment(item)}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#64748b" />
            <Text style={styles.actionText}>{item.commentCount}</Text>
          </TouchableOpacity>
        </View>

        {comments.length > 0 && (
          <View style={styles.commentsSection}>
            {commentsToShow.map(comment => (
              <View key={comment.id} style={styles.commentItem}>
                <View style={styles.commentAvatarPlaceholder}>
                  <Ionicons name="person-outline" size={16} color="#fff" />
                </View>
                <View style={styles.commentContent}>
                  <Text style={styles.commentUserName}>{comment.username}</Text>
                  <Text style={styles.commentText}>{comment.text}</Text>
                  {/* <Text style={styles.commentTime}>
                    {formatTimeAgo(comment.createdAt as Date)}
                  </Text> */}
                </View>
              </View>
            ))}

            {comments.length > 2 && (
              <TouchableOpacity
                style={styles.viewMoreComments}
                onPress={() => toggleComments(item.id)}
              >
                <Text style={styles.viewMoreText}>
                  {showAllComments
                    ? 'View less'
                    : `View all ${comments.length} comments`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  if (initialLoad) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading feeds...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Friends Feed</Text>
        <TouchableOpacity
          onPress={handleCreateDummyPost}
          style={styles.dummyButton}
          disabled={loading}
        >
          <Text style={styles.dummyButtonText}>Add Post</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={feeds}
        keyExtractor={item => item.id}
        renderItem={renderFeedCard}
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No achievements yet</Text>
          </View>
        }
      />

      <CommentModal
        visible={commentModalVisible}
        setVisible={() => setCommentModalVisible(false)}
        selectedPost={selectedFeed}
        setSelectedPost={() => setSelectedFeed(null)}
        loading={loading}
        handleAddComment={handleAddComment}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  feedContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  timestamp: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 16,
  },
  achievementBanner: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
  },
  achievementContent: {
    alignItems: 'center',
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 8,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  likedText: {
    color: '#e74c3c',
  },
  commentsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  commentAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  commentAvatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 18,
    marginBottom: 4,
  },
  commentTime: {
    fontSize: 12,
    color: '#64748b',
  },
  viewMoreComments: {
    paddingVertical: 8,
  },
  viewMoreText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
  },
  addFriendsButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addFriendsText: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#64748b',
  },
  dummyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },

  dummyButtonText: {
    color: '#6366f1',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
});
