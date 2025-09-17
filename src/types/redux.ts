import { FirebaseAuthTypes } from "@react-native-firebase/auth";

export interface AuthState {
  user: FirebaseAuthTypes.User | null;
  initializing: boolean;
  error: string | null;
  message: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
}