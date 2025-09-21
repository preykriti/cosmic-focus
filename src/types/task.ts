import { Timestamp } from '@react-native-firebase/firestore';
export interface Task {
  id: string;
  title: string;
  description?: string;
  tag: string;
  priority: 'low' | 'medium' | 'high';
  pomodoroLength: 25 | 50;
  breakLength: 5 | 10;
  plannedPomodoros: number;
  completedPomodoros: number;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}