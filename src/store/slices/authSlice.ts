import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import * as authService from "../../services/auth";
import { AuthState, LoginCredentials, SignUpCredentials } from "../../types/redux";

const initialState: AuthState = {
  user: null,
  initializing: true,
  error: null,
  message: null,
};

// async thunks
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      await authService.login(credentials.email, credentials.password);
      return { message: "Login successful" };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const signUpUser = createAsyncThunk(
  "auth/signUp",
  async (credentials: SignUpCredentials, { rejectWithValue }) => {
    try {
      await authService.signUp(credentials.email, credentials.password);
      return { message: "Signup successful" };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<FirebaseAuthTypes.User | null>) => {
      state.user = action.payload;
      state.initializing = false;
    },
    setInitializing: (state, action: PayloadAction<boolean>) => {
      state.initializing = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        state.message = action.payload.message;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.message = action.payload.message;
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setUser, setInitializing, clearError, clearMessage } = authSlice.actions;
export default authSlice.reducer;