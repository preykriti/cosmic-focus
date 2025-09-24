import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { Timestamp } from '@react-native-firebase/firestore';

export interface AuthState {
  user: UserProfile | null;
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
  username: string;
}

export type UserProfile = {
  id: string;
  email: string;
  username: string;
  stars?: number;
  streak?: number;
  deadStars?: number;
  blackholes?: number;
  lastPomodoroDate?: Timestamp | null;
  totalFocusMinutes?: number;
  totalTasksDone?: number;
  totalPomodoros?: number;
  createdAt?: Timestamp | null;
  purchases?: string[];
};
