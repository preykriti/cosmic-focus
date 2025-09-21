import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as focusSessionService from '../../firebase/firestore/focusSession';
import { FocusSession, CreateSessionData } from '../../firebase/firestore/focusSession';

interface FocusSessionState {
  currentSession: FocusSession | null;
  loading: boolean;
  error: string | null;
}

const initialState: FocusSessionState = {
  currentSession: null,
  loading: false,
  error: null,
};

export const createSession = createAsyncThunk(
  'focusSession/create',
  async (sessionData: CreateSessionData, { rejectWithValue }) => {
    try {
      return await focusSessionService.createFocusSession(sessionData);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const completeSession = createAsyncThunk(
  'focusSession/complete',
  async (
    { sessionId, userId }: { sessionId: string; userId: string },
    { rejectWithValue }
  ) => {
    try {
      await focusSessionService.completeSession(sessionId, userId);
      return sessionId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const abandonSession = createAsyncThunk(
  'focusSession/abandon',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      await focusSessionService.abandonSession(sessionId);
      return sessionId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

const focusSessionSlice = createSlice({
  name: 'focusSession',
  initialState,
  reducers: {
    clearCurrentSession: (state) => {
      state.currentSession = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSession.fulfilled, (state, action: PayloadAction<FocusSession>) => {
        state.loading = false;
        state.currentSession = action.payload;
      })
      .addCase(createSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(completeSession.fulfilled, (state) => {
        if (state.currentSession) {
          state.currentSession.status = 'completed';
        }
      })
      .addCase(completeSession.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(abandonSession.fulfilled, (state) => {
        if (state.currentSession) {
          state.currentSession.status = 'abandoned';
        }
      })
      .addCase(abandonSession.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentSession, clearError } = focusSessionSlice.actions;
export default focusSessionSlice.reducer;