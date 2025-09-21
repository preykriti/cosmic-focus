// focusSession.ts - Core session operations
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  writeBatch,
  Timestamp,
  runTransaction,
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

//new focus session
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
        penaltyForQuitting: {
          deadStarsGained: 1,
          applyToAll: true,
        },
        allowLateJoin: false,
        maxParticipants: 6,
        isPrivate: false,
      },
    }),
  };

  await setDoc(sessionRef, session);
  return session;
};

// for both solo and group session completion
export const completeSession = async (
  sessionId: string,
  userId: string,
): Promise<void> => {
  await runTransaction(firestore, async transaction => {
    const sessionRef = doc(sessionsCollection, sessionId);
    const sessionSnap = await transaction.get(sessionRef);

    if (!sessionSnap.exists()) {
      throw new Error('Session not found');
    }

    const sessionData = sessionSnap.data() as FocusSession;
    const starsEarned = calculateStars(
      sessionData.sessionType,
      sessionData.duration,
    );

    if (sessionData.sessionMode === 'solo') {
      transaction.update(sessionRef, {
        status: 'completed',
        endTime: Timestamp.now(),
      });

      await updateUserStatsForCompletion(
        transaction,
        userId,
        sessionData.sessionType,
        sessionData.duration,
        sessionData.taskId,
      );
    } else {
      const participant = sessionData.participants?.find(
        p => p.userId === userId,
      );
      if (!participant) {
        throw new Error('Participant not found');
      }

      const updatedParticipants = sessionData.participants?.map(p =>
        p.userId === userId
          ? {
              ...p,
              status: 'completed' as const,
              completedAt: Timestamp.now(),
              starsEarned,
            }
          : p,
      );

      transaction.update(sessionRef, {
        participants: updatedParticipants,
      });

      await updateUserStatsForCompletion(
        transaction,
        userId,
        sessionData.sessionType,
        sessionData.duration,
        participant.taskId,
      );
    }
  });
};

// join group session
export const joinGroupSession = async (
  sessionId: string,
  userId: string,
  username: string,
  taskId?: string,
  taskTitle?: string,
): Promise<void> => {
  await runTransaction(firestore, async transaction => {
    const sessionRef = doc(sessionsCollection, sessionId);
    const sessionSnap = await transaction.get(sessionRef);

    if (!sessionSnap.exists()) {
      throw new Error('Session not found');
    }

    const sessionData = sessionSnap.data() as FocusSession;

    if (sessionData.sessionMode !== 'group') {
      throw new Error('Cannot join solo session');
    }

    if (sessionData.status !== 'active') {
      throw new Error('Session is not active');
    }

    // check if user is already in session
    const existingParticipant = sessionData.participants?.find(
      p => p.userId === userId,
    );
    if (existingParticipant) {
      throw new Error('User already in session');
    }

    const currentParticipants = sessionData.participants?.length || 0;
    if (
      sessionData.groupSettings &&
      currentParticipants >= sessionData.groupSettings.maxParticipants
    ) {
      throw new Error('Session is full');
    }

    const participant: GroupParticipant = {
      userId,
      username,
      status: 'active',
      joinedAt: Timestamp.now(),
      taskId,
      taskTitle,
      starsEarned: 0,
    };

    transaction.update(sessionRef, {
      participants: [...(sessionData.participants || []), participant],
    });
  });
};

// abandon a session
export const abandonSession = async (
  sessionId: string,
  userId?: string,
): Promise<void> => {
  await runTransaction(firestore, async transaction => {
    const sessionRef = doc(sessionsCollection, sessionId);
    const sessionSnap = await transaction.get(sessionRef);

    if (!sessionSnap.exists()) {
      throw new Error('Session not found');
    }

    const sessionData = sessionSnap.data() as FocusSession;

    if (sessionData.sessionMode === 'solo') {
      transaction.update(sessionRef, {
        status: 'abandoned',
        endTime: Timestamp.now(),
      });

      if (sessionData.userId) {
        await applyAbandonmentPenalty(
          transaction,
          sessionData.userId,
          sessionData.sessionType,
          sessionData.duration,
        );
      }
    } else if (sessionData.sessionMode === 'group' && userId) {
      const participant = sessionData.participants?.find(
        p => p.userId === userId,
      );
      if (!participant) {
        throw new Error('Participant not found');
      }

      const groupSettings = sessionData.groupSettings;
      if (!groupSettings) {
        throw new Error('Group settings not found');
      }

      const updatedParticipants = sessionData.participants?.map(p =>
        p.userId === userId
          ? { ...p, status: 'abandoned' as const, abandonedAt: Timestamp.now() }
          : p,
      );

      let sessionUpdate: any = { participants: updatedParticipants };

      if (
        groupSettings.requireAllToComplete &&
        groupSettings.penaltyForQuitting.applyToAll
      ) {
        const affectedParticipants =
          sessionData.participants
            ?.filter(p => p.userId !== userId && p.status === 'active')
            .map(p => p.userId) || [];

        const consequences: GroupConsequences = {
          quitterUserId: userId,
          quitterUsername: participant.username,
          penaltyApplied: true,
          affectedParticipants,
          consequenceReason: 'user_quit',
        };

        await applyGroupPenalties(
          transaction,
          affectedParticipants,
          userId,
          sessionData.sessionType,
          sessionData.duration,
          groupSettings.penaltyForQuitting.deadStarsGained,
        );

        sessionUpdate = {
          ...sessionUpdate,
          status: 'cancelled',
          endTime: Timestamp.now(),
          consequences,
        };
      } else {
        await applyAbandonmentPenalty(
          transaction,
          userId,
          sessionData.sessionType,
          sessionData.duration,
        );
      }

      transaction.update(sessionRef, sessionUpdate);
    }
  });
};

export const getSession = async (
  sessionId: string,
): Promise<FocusSession | null> => {
  const sessionRef = doc(sessionsCollection, sessionId);
  const sessionSnap = await getDoc(sessionRef);

  if (!sessionSnap.exists()) {
    return null;
  }

  return sessionSnap.data() as FocusSession;
};

export const updateSessionStatus = async (
  sessionId: string,
  status: 'active' | 'completed' | 'abandoned' | 'cancelled',
): Promise<void> => {
  const sessionRef = doc(sessionsCollection, sessionId);
  await updateDoc(sessionRef, {
    status,
    ...(status !== 'active' && { endTime: Timestamp.now() }),
  });
};

export const updateMultipleSessionStatuses = async (
  updates: Array<{
    sessionId: string;
    status: 'active' | 'completed' | 'abandoned' | 'cancelled';
  }>,
): Promise<void> => {
  const batch = writeBatch(firestore);

  updates.forEach(({ sessionId, status }) => {
    const sessionRef = doc(sessionsCollection, sessionId);
    batch.update(sessionRef, {
      status,
      ...(status !== 'active' && { endTime: Timestamp.now() }),
    });
  });

  await batch.commit();
};

export const getMultipleSessions = async (
  sessionIds: string[],
): Promise<FocusSession[]> => {
  if (sessionIds.length === 0) return [];

  const promises = sessionIds.map(id => getDoc(doc(sessionsCollection, id)));
  const snapshots = await Promise.all(promises);

  return snapshots
    .filter(snap => snap.exists())
    .map(snap => snap.data() as FocusSession);
};

export const checkGroupSessionCompletion = (session: FocusSession): boolean => {
  if (session.sessionMode !== 'group' || !session.participants) {
    return false;
  }

  const activeParticipants = session.participants.filter(
    p => p.status === 'active' || p.status === 'completed',
  );

  return activeParticipants.every(p => p.status === 'completed');
};

export const cleanupExpiredSessions = async (
  expiredSessionIds: string[],
): Promise<void> => {
  if (expiredSessionIds.length === 0) return;

  const batch = writeBatch(firestore);

  expiredSessionIds.forEach(sessionId => {
    const sessionRef = doc(sessionsCollection, sessionId);
    batch.update(sessionRef, {
      status: 'abandoned',
      endTime: Timestamp.now(),
    });
  });

  await batch.commit();
};
