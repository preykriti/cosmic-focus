import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as focusSessionService from '../../firebase/firestore/focusSession';
import {
  FocusSession,
  CreateSessionData,
} from '../../firebase/firestore/focusSession';

interface FocusSessionState {
  currentSession: FocusSession | null;
  loading: boolean;
  error: string | null;
  isCompleting: boolean;
  isAbandoning: boolean;
}

const initialState: FocusSessionState = {
  currentSession: null,
  loading: false,
  error: null,
  isCompleting: false,
  isAbandoning: false,
};

// create session
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
    { rejectWithValue },
  ) => {
    try {
      await focusSessionService.completeSession(sessionId, userId);
      return await focusSessionService.getSession(sessionId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// abandon session
export const abandonSession = createAsyncThunk(
  'focusSession/abandon',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      await focusSessionService.abandonSession(sessionId);
      return await focusSessionService.getSession(sessionId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// fetch session
export const fetchSession = createAsyncThunk(
  'focusSession/fetch',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const session = await focusSessionService.getSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }
      return session;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

const focusSessionSlice = createSlice({
  name: 'focusSession',
  initialState,
  reducers: {
    clearCurrentSession: state => {
      state.currentSession = null;
      state.error = null;
    },
    clearError: state => {
      state.error = null;
    },
    updateCurrentSession: (state, action: PayloadAction<FocusSession>) => {
      state.currentSession = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(createSession.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createSession.fulfilled,
        (state, action: PayloadAction<FocusSession>) => {
          state.loading = false;
          state.currentSession = action.payload;
        },
      )
      .addCase(createSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // complete session cases
      .addCase(completeSession.pending, state => {
        state.isCompleting = true;
        state.error = null;
      })
      .addCase(
        completeSession.fulfilled,
        (state, action: PayloadAction<FocusSession | null>) => {
          state.isCompleting = false;
          if (action.payload) {
            state.currentSession = action.payload;
          }
        },
      )
      .addCase(completeSession.rejected, (state, action) => {
        state.isCompleting = false;
        state.error = action.payload as string;
      })

      .addCase(abandonSession.pending, state => {
        state.isAbandoning = true;
        state.error = null;
      })
      .addCase(
        abandonSession.fulfilled,
        (state, action: PayloadAction<FocusSession | null>) => {
          state.isAbandoning = false;
          if (action.payload) {
            state.currentSession = action.payload;
          }
        },
      )
      .addCase(abandonSession.rejected, (state, action) => {
        state.isAbandoning = false;
        state.error = action.payload as string;
      })

      .addCase(fetchSession.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchSession.fulfilled,
        (state, action: PayloadAction<FocusSession>) => {
          state.loading = false;
          state.currentSession = action.payload;
        },
      )
      .addCase(fetchSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentSession, clearError, updateCurrentSession } =
  focusSessionSlice.actions;

export default focusSessionSlice.reducer;
