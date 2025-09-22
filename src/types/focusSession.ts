import { Timestamp } from '@react-native-firebase/firestore';

export interface CreateSessionData {
  sessionMode: 'solo' | 'group';
  userId?: string;
  taskId?: string;
  taskTitle?: string;
  groupId?: string;
  hostUserId?: string;
  groupName?: string;
  groupSettings?: GroupSessionSettings;
  sessionType: 'pomodoro' | 'shortBreak' | 'longBreak';
  duration: number;
  autoStartNext: boolean;
  currentCycle: number;
  totalCycles: number;
}

export interface GroupConsequences {
  quitterUserId: string;
  quitterUsername: string;
  penaltyApplied: boolean;
  affectedParticipants: string[];
  consequenceReason: 'user_quit' | 'user_disconnected' | 'session_abandoned';
}

export interface FocusSession {
  id: string;
  sessionMode: 'solo' | 'group';

  sessionType: 'pomodoro' | 'shortBreak' | 'longBreak';
  duration: number;
  startTime: Timestamp;
  endTime?: Timestamp;
  status: 'active' | 'completed' | 'abandoned' | 'cancelled';
  autoStartNext: boolean;
  currentCycle: number;
  totalCycles: number;
  createdAt: Timestamp;

  // for solo sessions
  userId?: string;
  taskId?: string;
  taskTitle?: string;

  // for group sessions
  groupId?: string;
  hostUserId?: string;
  participants?: GroupParticipant[];
  groupName?: string;
  groupSettings?: GroupSessionSettings;
  consequences?: GroupConsequences;
}

export interface GroupParticipant {
  userId: string;
  username: string;
  status: 'active' | 'completed' | 'abandoned';
  joinedAt: Timestamp;
  taskId?: string;
  taskTitle?: string;
  starsEarned: number;
  completedAt?: Timestamp;
  abandonedAt?: Timestamp;
}

export interface GroupSessionSettings {
  requireAllToComplete: boolean;
  penaltyForQuitting: {
    deadStarsGained: number;
    applyToAll: boolean;
  };
  allowLateJoin: boolean;
  maxParticipants: number;
  isPrivate: boolean;
  inviteCode?: string;
}
