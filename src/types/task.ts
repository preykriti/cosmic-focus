import { Timestamp } from '@react-native-firebase/firestore';
export interface Task {
  id: string;
  title: string;
  description: string;
  tag: string;
  allocatedHours: number;
  hoursDone: number;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
