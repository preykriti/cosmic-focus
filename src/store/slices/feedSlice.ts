import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as feedsService from '../../firebase/firestore/feeds';
import * as commentsService from '../../firebase/firestore/comments';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { resetAllState } from '../actions';
import { RootState } from '..';

export type FeedType = 'session' | 'stars' | 'days';

export type Feed = {
  id: string;
  userId: string;
  username: string;
  type: FeedType;
  amount: number;
  message?: string;
  likes: string[];
  commentCount: number;
  createdAt: FirebaseFirestoreTypes.Timestamp | Date | null;
};

export type Comment = {
  id: string;
  feedId: string;
  userId: string;
  username: string;
  text: string;
  createdAt: FirebaseFirestoreTypes.Timestamp | Date | null;
};

type FeedState = {
  feeds: Feed[];
  feedMap: Record<string, Feed>;
  commentsMap: Record<string, Comment[]>;
  loading: boolean;
  error: string | null;
};

const initialState: FeedState = {
  feeds: [],
  feedMap: {},
  commentsMap: {},
  loading: false,
  error: null,
};

export const createFeed = createAsyncThunk(
  'feeds/createFeed',
  async (
    {
      userId,
      type,
      amount,
      message,
    }: {
      userId: string;
      type: FeedType;
      amount: number;
      message?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      return await feedsService.createFeed(userId, type, amount, message);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to create feed',
      );
    }
  },
);

// fetch feeds for a user
export const fetchUserFeeds = createAsyncThunk(
  'feeds/fetchUserFeeds',
  async (userId: string, { getState }) => {
    const state = getState() as RootState;
    const existingFeeds = state.feeds.feeds;
    if (existingFeeds.length > 0 && existingFeeds[0].userId === userId) {
      return existingFeeds;
    }
    return await feedsService.getFeedsForUser(userId);
  },
);

// fetch feeds for friends
export const fetchFriendFeeds = createAsyncThunk(
  'feeds/fetchFriendFeeds',
  async (friendIds: string[], { rejectWithValue }) => {
    try {
      return await feedsService.getFriendFeeds(friendIds);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch friend feeds',
      );
    }
  },
);

// like a post
export const likeFeed = createAsyncThunk(
  'feeds/likeFeed',
  async (
    { feedId, userId }: { feedId: string; userId: string },
    { rejectWithValue },
  ) => {
    try {
      await feedsService.likeFeed(feedId, userId);
      return { feedId, userId };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to like feed',
      );
    }
  },
);

export const unlikeFeed = createAsyncThunk(
  'feeds/unlikeFeed',
  async (
    { feedId, userId }: { feedId: string; userId: string },
    { rejectWithValue },
  ) => {
    try {
      await feedsService.unlikeFeed(feedId, userId);
      return { feedId, userId };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to unlike feed',
      );
    }
  },
);

// add comment
export const addComment = createAsyncThunk(
  'feeds/addComment',
  async (
    {
      feedId,
      userId,
      text,
    }: {
      feedId: string;
      userId: string;
      text: string;
    },
    { rejectWithValue },
  ) => {
    try {
      console.log('adding comment2', text, feedId, userId);
      return await commentsService.addComment(feedId, userId, text);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to add comment',
      );
    }
  },
);

// fetch comments for a feed
export const fetchCommentsForFeed = createAsyncThunk(
  'feeds/fetchCommentsForFeed',
  async (feedId: string, { rejectWithValue }) => {
    try {
      const comments = await commentsService.getCommentsForFeed(feedId);
      return { comments, feedId };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch comments',
      );
    }
  },
);

export const deleteComment = createAsyncThunk(
  'feeds/deleteComment',
  async (
    {
      commentId,
      feedId,
    }: {
      commentId: string;
      feedId: string;
    },
    { rejectWithValue },
  ) => {
    try {
      await commentsService.deleteComment(commentId, feedId);
      return { commentId, feedId };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to delete comment',
      );
    }
  },
);

export const deleteFeed = createAsyncThunk(
  'feeds/deleteFeed',
  async (feedId: string, { rejectWithValue }) => {
    try {
      await feedsService.deleteFeed(feedId);
      return feedId;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to delete feed',
      );
    }
  },
);

const feedSlice = createSlice({
  name: 'feeds',
  initialState,
  reducers: {
    clearFeeds: state => {
      state.feeds = [];
      state.feedMap = {};
      state.commentsMap = {};
      state.error = null;
    },
    clearComments: (state, action: PayloadAction<string>) => {
      delete state.commentsMap[action.payload];
    },
  },
  extraReducers: builder => {
    builder
      .addCase(createFeed.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFeed.fulfilled, (state, action) => {
        state.loading = false;
        state.feeds.unshift(action.payload);
        state.feedMap[action.payload.id] = action.payload;
      })
      .addCase(createFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchUserFeeds.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserFeeds.fulfilled, (state, action) => {
        state.loading = false;
        state.feeds = action.payload;
        state.feedMap = {};
        action.payload.forEach((feed: any) => {
          state.feedMap[feed.id] = feed;
        });
      })
      .addCase(fetchUserFeeds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchFriendFeeds.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFriendFeeds.fulfilled, (state, action) => {
        state.loading = false;
        state.feeds = action.payload;
        state.feedMap = {};
        action.payload.forEach(feed => {
          state.feedMap[feed.id] = feed;
        });
      })
      .addCase(fetchFriendFeeds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(likeFeed.fulfilled, (state, action) => {
        const { feedId, userId } = action.payload;
        const feed = state.feedMap[feedId];
        if (feed && !feed.likes.includes(userId)) {
          feed.likes.push(userId);
        }
      })

      .addCase(unlikeFeed.fulfilled, (state, action) => {
        const { feedId, userId } = action.payload;
        const feed = state.feedMap[feedId];
        if (feed) {
          feed.likes = feed.likes.filter(id => id !== userId);
        }
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const comment = action.payload;

        if (!state.commentsMap[comment.feedId]) {
          state.commentsMap[comment.feedId] = [];
        }
        state.commentsMap[comment.feedId].push(comment);

        const feed = state.feedMap[comment.feedId];
        if (feed) {
          feed.commentCount += 1;
        }

        const feedIndex = state.feeds.findIndex(f => f.id === comment.feedId);
        if (feedIndex !== -1) {
          state.feeds[feedIndex].commentCount += 1;
        }
      })

      .addCase(fetchCommentsForFeed.fulfilled, (state, action) => {
        const { comments, feedId } = action.payload;
        state.commentsMap[feedId] = comments;
      })

      .addCase(deleteComment.fulfilled, (state, action) => {
        const { commentId, feedId } = action.payload;
        const comments = state.commentsMap[feedId];
        if (comments) {
          state.commentsMap[feedId] = comments.filter(c => c.id !== commentId);
        }

        const feed = state.feedMap[feedId];
        if (feed) {
          feed.commentCount = Math.max(0, feed.commentCount - 1);
        }
      })

      .addCase(deleteFeed.fulfilled, (state, action) => {
        const feedId = action.payload;
        state.feeds = state.feeds.filter(f => f.id !== feedId);
        delete state.feedMap[feedId];
        delete state.commentsMap[feedId];
      })

      .addCase(resetAllState, () => initialState);
  },
});

export const { clearFeeds, clearComments } = feedSlice.actions;
export default feedSlice.reducer;
