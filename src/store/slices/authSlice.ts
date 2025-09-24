import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import * as authService from '../../firebase/auth';
import * as usersService from '../../firebase/firestore/users';
import { completeSession } from './focusSessionSlice';
import {
  AuthState,
  LoginCredentials,
  SignUpCredentials,
  UserProfile,
} from '../../types/redux';
import { resetAllState } from '../actions';

const initialState: AuthState = {
  user: null,
  initializing: true,
  error: null,
  message: null,
};

// async thunks
export const loginUser = createAsyncThunk<
  { message: string; user: UserProfile },
  LoginCredentials,
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const userCredential = await authService.login(
      credentials.email,
      credentials.password,
    );
    const userId = userCredential.user.uid;
    const profile = await usersService.getUserProfile(userId);

    if (!profile) {
      throw new Error('User profile not found');
    }

    return {
      message: 'Login successful',
      user: profile as UserProfile,
    };
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const getUser = createAsyncThunk<
  UserProfile,
  { userId: string },
  { rejectValue: string }
>('auth/getUser', async ({ userId }, { rejectWithValue }) => {
  console.log('calling update user');
  try {
    console.log('updating user1', userId);
    const updatedProfile = await usersService.getUserProfile(userId);
    return updatedProfile as UserProfile;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const signUpUser = createAsyncThunk<
  { message: string; user: UserProfile },
  SignUpCredentials & { username: string },
  { rejectValue: string }
>('auth/signUp', async (credentials, { rejectWithValue }) => {
  try {
    const taken = await usersService.isUsernameTaken(credentials.username);
    if (taken) throw new Error('Username is already taken');

    const userCredential = await authService.signUp(
      credentials.email,
      credentials.password,
    );
    const userId = userCredential.user.uid;

    await usersService.createUserProfile(
      userId,
      credentials.email,
      credentials.username,
    );

    return {
      message: 'Signup successful',
      user: {
        id: userId,
        email: credentials.email,
        username: credentials.username,
      },
    };
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logout',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await authService.logout();
      dispatch(resetAllState());
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateUser = createAsyncThunk<
  UserProfile,
  { userId: string; data: Partial<UserProfile> },
  { rejectValue: string }
>('auth/updateUser', async ({ userId, data }, { rejectWithValue }) => {
  try {
    console.log('updating user1', data);
    await usersService.updateUserProfile(userId, data);
    const updatedProfile = await usersService.getUserProfile(userId);
    return updatedProfile as UserProfile;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserProfile | null>) => {
      state.user = action.payload;
      state.initializing = false;
    },
    setInitializing: (state, action: PayloadAction<boolean>) => {
      state.initializing = action.payload;
    },
    clearError: state => {
      state.error = null;
    },
    clearMessage: state => {
      state.message = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        state.message = action.payload.message;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.message = action.payload.message;
        state.user = action.payload.user;
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(resetAllState, () => initialState)
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setUser, setInitializing, clearError, clearMessage } =
  authSlice.actions;
export default authSlice.reducer;
