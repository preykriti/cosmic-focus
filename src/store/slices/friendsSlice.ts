import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as friendsService from '../../firebase/firestore/friends';
import * as usersService from '../../firebase/firestore/users';
import { Timestamp } from '@react-native-firebase/firestore';
import { resetAllState } from '../actions';
import { RootState } from '..';

type FriendRequest = {
  id: string;
  from: string;
  fromUsername: string;
  to: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Timestamp | null;
};

type FriendProfile = {
  id: string;
  email: string;
  username: string;
  streak: number;
};

type SearchResult = {
  id: string;
  username: string;
};

type FriendsState = {
  incoming: FriendRequest[];
  outgoing: FriendRequest[];
  friends: FriendProfile[];
  searchResults: SearchResult[];
  loading: boolean;
  error: string | null;
};

const initialState: FriendsState = {
  incoming: [],
  outgoing: [],
  friends: [],
  searchResults: [],
  loading: false,
  error: null,
};

export const fetchIncomingRequests = createAsyncThunk(
  'friends/fetchIncoming',
  async (userId: string) => {
    return await friendsService.getIncomingRequests(userId);
  },
);

export const fetchFriends = createAsyncThunk(
  'friends/fetchFriends',
  async (userId: string) => {
    return await friendsService.getFriendsWithProfiles(userId);
  },
);

export const sendRequest = createAsyncThunk(
  'friends/sendRequest',
  async ({
    fromUserId,
    toUserId,
  }: {
    fromUserId: string;
    toUserId: string;
  }) => {
    await friendsService.sendFriendRequest(fromUserId, toUserId);
    return { toUserId };
  },
);

export const acceptRequest = createAsyncThunk(
  'friends/acceptRequest',
  async ({
    requestId,
    from,
    to,
  }: {
    requestId: string;
    from: string;
    to: string;
  }) => {
    await friendsService.acceptFriendRequest(requestId, from, to);
    return requestId;
  },
);

export const declineRequest = createAsyncThunk(
  'friends/declineRequest',
  async (requestId: string) => {
    await friendsService.declineFriendRequest(requestId);
    return requestId;
  },
);

export const searchUsersByUsername = createAsyncThunk(
  'friends/searchUsers',
  async (username: string, { rejectWithValue }) => {
    try {
      return await usersService.searchUsersByUsername(username);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Search failed',
      );
    }
  },
);

const friendsSlice = createSlice({
  name: 'friends',
  initialState,
  reducers: {
    clearSearchResults: state => {
      state.searchResults = [];
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchIncomingRequests.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIncomingRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.incoming = action.payload as FriendRequest[];
      })
      .addCase(fetchFriends.fulfilled, (state, action) => {
        state.friends = action.payload as FriendProfile[];
      })
      .addCase(acceptRequest.fulfilled, (state, action) => {
        state.incoming = state.incoming.filter(r => r.id !== action.payload);
      })
      .addCase(declineRequest.fulfilled, (state, action) => {
        state.incoming = state.incoming.filter(r => r.id !== action.payload);
      })
      .addCase(searchUsersByUsername.pending, state => {
        state.loading = true;
        state.error = null;
        state.searchResults = [];
      })
      .addCase(searchUsersByUsername.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload as SearchResult[];
      })
      .addCase(searchUsersByUsername.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Search failed';
        state.searchResults = [];
      })
      .addCase(resetAllState, () => initialState);
  },
});

export const { clearSearchResults } = friendsSlice.actions;
export default friendsSlice.reducer;
