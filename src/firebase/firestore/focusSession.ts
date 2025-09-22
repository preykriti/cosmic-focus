import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  Timestamp,
  increment,
} from '@react-native-firebase/firestore';
import {
  calculateStars,
  updateUserStatsForCompletion,
  applyAbandonmentPenalty,
  applyGroupPenalties,
} from './sessionRewards';

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
  userId?: string;
  taskId?: string;
  taskTitle?: string;
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

export interface GroupConsequences {
  quitterUserId: string;
  quitterUsername: string;
  penaltyApplied: boolean;
  affectedParticipants: string[];
  consequenceReason: 'user_quit' | 'user_disconnected' | 'session_abandoned';
}

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

const firestore = getFirestore();
const sessionsCollection = collection(firestore, 'focusSessions');

// create session
export const createFocusSession = async (
  sessionData: CreateSessionData,
): Promise<FocusSession> => {
  const sessionRef = doc(sessionsCollection);

  const session: FocusSession = {
    id: sessionRef.id,
    sessionMode: sessionData.sessionMode,
    sessionType: sessionData.sessionType,
    duration: sessionData.duration,
    startTime: Timestamp.now(),
    status: 'active',
    autoStartNext: sessionData.autoStartNext,
    currentCycle: sessionData.currentCycle,
    totalCycles: sessionData.totalCycles,
    createdAt: Timestamp.now(),
    ...(sessionData.sessionMode === 'solo' && {
      userId: sessionData.userId,
      taskId: sessionData.taskId,
      taskTitle: sessionData.taskTitle,
    }),
    ...(sessionData.sessionMode === 'group' && {
      groupId: sessionData.groupId,
      hostUserId: sessionData.hostUserId,
      groupName: sessionData.groupName,
      participants: [],
      groupSettings: sessionData.groupSettings || {
        requireAllToComplete: true,
        penaltyForQuitting: { deadStarsGained: 1, applyToAll: true },
        allowLateJoin: false,
        maxParticipants: 6,
        isPrivate: false,
      },
    }),
  };

  await setDoc(sessionRef, session);
  return session;
};

// complete session
export const completeSession = async (
  sessionId: string,
  userId: string,
): Promise<void> => {
  const sessionRef = doc(sessionsCollection, sessionId);
  const sessionSnap = await getDoc(sessionRef);

  if (!sessionSnap.exists()) throw new Error('Session not found');

  const sessionData = sessionSnap.data() as FocusSession;

  if (sessionData.sessionMode === 'solo') {
    await updateDoc(sessionRef, { status: 'completed', endTime: Timestamp.now() });
    if (sessionData.userId) {
      await updateUserStatsForCompletion(
        null,
        userId,
        sessionData.sessionType,
        sessionData.duration,
        sessionData.taskId,
      );
    }
  } else {
    // group session
    const participant = sessionData.participants?.find(p => p.userId === userId);
    if (!participant) throw new Error('Participant not found');

    const starsEarned = calculateStars(sessionData.sessionType, sessionData.duration);
    const updatedParticipants = sessionData.participants?.map(p =>
      p.userId === userId
        ? { ...p, status: 'completed' as const, completedAt: Timestamp.now(), starsEarned }
        : p,
    );

    await updateDoc(sessionRef, { participants: updatedParticipants });
    await updateUserStatsForCompletion(null, userId, sessionData.sessionType, sessionData.duration, participant.taskId);
  }
};

// abandon session
export const abandonSession = async (sessionId: string, userId?: string): Promise<void> => {
  const sessionRef = doc(sessionsCollection, sessionId);
  const sessionSnap = await getDoc(sessionRef);

  if (!sessionSnap.exists()) throw new Error('Session not found');

  const sessionData = sessionSnap.data() as FocusSession;

  if (sessionData.sessionMode === 'solo') {
    await updateDoc(sessionRef, { status: 'abandoned', endTime: Timestamp.now() });
    if (sessionData.userId) {
      await applyAbandonmentPenalty(null, sessionData.userId, sessionData.sessionType, sessionData.duration);
    }
  } else if (sessionData.sessionMode === 'group' && userId) {
    const participant = sessionData.participants?.find(p => p.userId === userId);
    if (!participant) throw new Error('Participant not found');

    const groupSettings = sessionData.groupSettings;
    if (!groupSettings) throw new Error('Group settings not found');

    const updatedParticipants = sessionData.participants?.map(p =>
      p.userId === userId
        ? { ...p, status: 'abandoned' as const, abandonedAt: Timestamp.now() }
        : p,
    );

    let sessionUpdate: any = { participants: updatedParticipants };

    if (groupSettings.requireAllToComplete && groupSettings.penaltyForQuitting.applyToAll) {
      const affectedParticipants = sessionData.participants
        ?.filter(p => p.userId !== userId && p.status === 'active')
        .map(p => p.userId) || [];

      const consequences: GroupConsequences = {
        quitterUserId: userId,
        quitterUsername: participant.username,
        penaltyApplied: true,
        affectedParticipants,
        consequenceReason: 'user_quit',
      };

      
      await applyGroupPenalties(null, affectedParticipants, userId, sessionData.sessionType, sessionData.duration, groupSettings.penaltyForQuitting.deadStarsGained);

      sessionUpdate = { ...sessionUpdate, status: 'cancelled', endTime: Timestamp.now(), consequences };
    } else {
      await applyAbandonmentPenalty(null, userId, sessionData.sessionType, sessionData.duration);
    }

    await updateDoc(sessionRef, sessionUpdate);
  }
};

// join group session
export const joinGroupSession = async (
  sessionId: string,
  userId: string,
  username: string,
  taskId?: string,
  taskTitle?: string,
): Promise<void> => {
  const sessionRef = doc(sessionsCollection, sessionId);
  const sessionSnap = await getDoc(sessionRef);

  if (!sessionSnap.exists()) throw new Error('Session not found');

  const sessionData = sessionSnap.data() as FocusSession;
  if (sessionData.sessionMode !== 'group') throw new Error('Cannot join solo session');
  if (sessionData.status !== 'active') throw new Error('Session is not active');

  const participant: GroupParticipant = {
    userId,
    username,
    status: 'active',
    joinedAt: Timestamp.now(),
    taskId,
    taskTitle,
    starsEarned: 0,
  };

  await updateDoc(sessionRef, { participants: [...(sessionData.participants || []), participant] });
};

// get session
export const getSession = async (sessionId: string): Promise<FocusSession | null> => {
  const sessionRef = doc(sessionsCollection, sessionId);
  const sessionSnap = await getDoc(sessionRef);
  if (!sessionSnap.exists()) return null;
  return sessionSnap.data() as FocusSession;
};

// update session status
export const updateSessionStatus = async (
  sessionId: string,
  status: 'active' | 'completed' | 'abandoned' | 'cancelled',
): Promise<void> => {
  const sessionRef = doc(sessionsCollection, sessionId);
  await updateDoc(sessionRef, { status, ...(status !== 'active' && { endTime: Timestamp.now() }) });
};


export const checkGroupSessionCompletion = (session: FocusSession): boolean => {
  if (session.sessionMode !== 'group' || !session.participants) return false;
  return session.participants.filter(p => p.status === 'active' || p.status === 'completed')
    .every(p => p.status === 'completed');
};
