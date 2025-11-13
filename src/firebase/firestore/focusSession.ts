import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  Timestamp,
  increment,
  serverTimestamp,
  query,
  where,
  getDocs,
  FirebaseFirestoreTypes,
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
  sessionStatus?: 'lobby' | 'active' | 'completed';
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
  status:
    | 'invited'
    | 'accepted'
    | 'declined'
    | 'active'
    | 'completed'
    | 'abandoned';
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
  participants?: GroupParticipant[];
  groupSettings?: GroupSessionSettings;
  sessionType: 'pomodoro' | 'shortBreak' | 'longBreak';
  duration: number;
  autoStartNext: boolean;
  currentCycle: number;
  totalCycles: number;
}

const firestore = getFirestore();
const sessionsCollection = collection(firestore, 'focusSessions');

export const createFocusSession = async (
  sessionData: CreateSessionData,
): Promise<FocusSession> => {
  console.log('createFocusSession called with:', sessionData);
  const sessionRef = doc(sessionsCollection);

  let processedParticipants: GroupParticipant[] = [];
  if (sessionData.sessionMode === 'group' && sessionData.participants) {
    processedParticipants = sessionData.participants.map(participant => ({
      ...participant,
      joinedAt:
        participant.joinedAt instanceof Timestamp
          ? participant.joinedAt
          : Timestamp.now(),
    }));
  }

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
      sessionStatus: 'lobby',
      groupId: sessionData.groupId || sessionRef.id,
      hostUserId: sessionData.hostUserId,
      groupName: sessionData.groupName,
      participants: processedParticipants,
      groupSettings: sessionData.groupSettings || {
        requireAllToComplete: true,
        penaltyForQuitting: { deadStarsGained: 1, applyToAll: true },
        allowLateJoin: false,
        maxParticipants: 6,
        isPrivate: false,
      },
    }),
  };

  console.log(
    'Writing session to Firestore:',
    JSON.stringify(session, null, 2),
  );

  try {
    await setDoc(sessionRef, session);
    console.log(
      'Session created successfully in Firestore with ID:',
      sessionRef.id,
    );
    return session;
  } catch (error) {
    console.error('Error creating session in Firestore:', error);
    throw new Error(`Failed to create session: ${error.message}`);
  }
};

export const completeSession = async (
  sessionId: string,
  userId: string,
): Promise<void> => {
  const sessionRef = doc(sessionsCollection, sessionId);
  const sessionSnap = await getDoc(sessionRef);

  if (!sessionSnap.exists()) throw new Error('Session not found');

  const sessionData = sessionSnap.data() as FocusSession;

  if (sessionData.sessionMode === 'solo') {
    await updateDoc(sessionRef, {
      status: 'completed',
      endTime: Timestamp.now(),
    });
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
    const participant = sessionData.participants?.find(
      p => p.userId === userId,
    );
    if (!participant) throw new Error('Participant not found');

    const starsEarned = calculateStars(
      sessionData.sessionType,
      sessionData.duration,
    );
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

    await updateDoc(sessionRef, { participants: updatedParticipants });
    await updateUserStatsForCompletion(
      null,
      userId,
      sessionData.sessionType,
      sessionData.duration,
      participant.taskId,
    );

    const allCompleted = updatedParticipants?.every(
      p => p.status === 'completed',
    );
    if (allCompleted) {
      await updateDoc(sessionRef, {
        status: 'completed',
        sessionStatus: 'completed',
        endTime: Timestamp.now(),
      });
    }
  }
};

export const abandonSession = async (
  sessionId: string,
  userId?: string,
): Promise<void> => {
  const sessionRef = doc(sessionsCollection, sessionId);
  const sessionSnap = await getDoc(sessionRef);

  if (!sessionSnap.exists()) throw new Error('Session not found');

  const sessionData = sessionSnap.data() as FocusSession;

  if (sessionData.sessionMode === 'solo') {
    await updateDoc(sessionRef, {
      status: 'abandoned',
      endTime: Timestamp.now(),
    });
    if (sessionData.userId) {
      await applyAbandonmentPenalty(
        null,
        sessionData.userId,
        sessionData.sessionType,
        sessionData.duration,
      );
    }
  } else if (sessionData.sessionMode === 'group' && userId) {
    await abandonGroupSession(sessionId, userId);
  }
};

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
  if (sessionData.sessionMode !== 'group')
    throw new Error('Cannot join solo session');
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

  await updateDoc(sessionRef, {
    participants: [...(sessionData.participants || []), participant],
  });
};

export const getSession = async (
  sessionId: string,
): Promise<FocusSession | null> => {
  const sessionRef = doc(sessionsCollection, sessionId);
  const sessionSnap = await getDoc(sessionRef);
  if (!sessionSnap.exists()) return null;
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

export const checkGroupSessionCompletion = (session: FocusSession): boolean => {
  if (session.sessionMode !== 'group' || !session.participants) return false;
  return session.participants
    .filter(p => p.status === 'active' || p.status === 'completed')
    .every(p => p.status === 'completed');
};

export const acceptGroupInvitation = async (
  sessionId: string,
  userId: string,
  username: string,
  taskId?: string,
  taskTitle?: string,
): Promise<void> => {
  if (!userId || !username) {
    throw new Error('Cannot accept invitation: userId or username is missing');
  }

  const sessionRef = doc(sessionsCollection, sessionId);
  const sessionSnap = await getDoc(sessionRef);

  if (!sessionSnap.exists()) throw new Error('Session not found');

  const sessionData = sessionSnap.data() as FocusSession;

  const participants = sessionData.participants || [];

  const existingParticipant = participants.find(p => p.userId === userId);

  if (existingParticipant) {
    const updatedParticipants = participants.map(participant =>
      participant.userId === userId
        ? {
            ...participant,
            status: 'accepted' as const,
            ...(username && { username }),
            ...(taskId && { taskId }),
            ...(taskTitle && { taskTitle }),
          }
        : participant,
    );

    await updateDoc(sessionRef, { participants: updatedParticipants });
  } else {
    const newParticipant: GroupParticipant = {
      userId,
      username,
      status: 'accepted',
      joinedAt: Timestamp.now(),
      starsEarned: 0,
      ...(taskId && { taskId }),
      ...(taskTitle && { taskTitle }),
    };

    await updateDoc(sessionRef, {
      participants: [...participants, newParticipant],
    });
  }
};

export const declineGroupInvitation = async (
  sessionId: string,
  userId: string,
): Promise<void> => {
  if (!userId) {
    throw new Error('Cannot decline invitation: userId is missing');
  }

  const sessionRef = doc(sessionsCollection, sessionId);
  const sessionSnap = await getDoc(sessionRef);

  if (!sessionSnap.exists()) throw new Error('Session not found');

  const sessionData = sessionSnap.data() as FocusSession;

  const participants = sessionData.participants || [];

  const updatedParticipants = participants.map(participant =>
    participant.userId === userId
      ? { ...participant, status: 'declined' as const }
      : participant,
  );

  await updateDoc(sessionRef, { participants: updatedParticipants });
};

export const fetchUserSessions = async (
  userId: string,
): Promise<FocusSession[]> => {
  const sessionsRef = collection(firestore, 'focusSessions');

  const soloQuery = query(sessionsRef, where('userId', '==', userId));
  const soloSnapshot = await getDocs(soloQuery);
  const soloSessions = soloSnapshot.docs.map(doc => doc.data() as FocusSession);

  let groupSessions: FocusSession[] = [];
  try {
    const allGroupQuery = query(
      sessionsRef,
      where('sessionMode', '==', 'group'),
    );
    const allGroupSnapshot = await getDocs(allGroupQuery);
    groupSessions = allGroupSnapshot.docs
      .map((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => doc.data() as FocusSession)
      .filter((session: FocusSession) => session.participants?.some(p => p.userId === userId));
  } catch (error) {
    console.log('Group session query failed:', error);
  }

  return [...soloSessions, ...groupSessions];
};

export const aggregateSessionsByWeek = (
  sessions: FocusSession[],
  weeks = 18,
) => {
  const today = new Date();
  const startDate = new Date();
  startDate.setDate(today.getDate() - weeks * 7);

  const dailyCounts: Record<string, number> = {};

  sessions.forEach(session => {
    const sessionDate =
      session.createdAt instanceof Timestamp
        ? session.createdAt.toDate()
        : new Date(session.createdAt);

    const year = sessionDate.getFullYear();
    const month = String(sessionDate.getMonth() + 1).padStart(2, '0');
    const day = String(sessionDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    dailyCounts[dateStr] = (dailyCounts[dateStr] || 0) + 1;
  });

  const data: number[][] = [];
  for (let w = 0; w < weeks; w++) {
    const week: number[] = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + w * 7 + d);

      const year = day.getFullYear();
      const month = String(day.getMonth() + 1).padStart(2, '0');
      const dayNum = String(day.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${dayNum}`;

      const count = dailyCounts[dateStr] || 0;
      week.push(Math.min(count, 4));
    }
    data.push(week);
  }

  return data;
};

export const startGroupSession = async (sessionId: string): Promise<void> => {
  const sessionRef = doc(sessionsCollection, sessionId);
  await updateDoc(sessionRef, {
    sessionStatus: 'active',
    startTime: serverTimestamp(),
  });
};

export const abandonGroupSession = async (
  sessionId: string,
  userId: string,
): Promise<void> => {
  const sessionRef = doc(sessionsCollection, sessionId);
  const sessionSnap = await getDoc(sessionRef);

  if (!sessionSnap.exists()) throw new Error('Session not found');

  const sessionData = sessionSnap.data() as FocusSession;
  const participant = sessionData.participants?.find(p => p.userId === userId);
  if (!participant) throw new Error('Participant not found');

  const groupSettings = sessionData.groupSettings;
  if (!groupSettings) throw new Error('Group settings not found');

  // Get all active participants
  const allParticipants = sessionData.participants?.filter(
    p => p.status === 'active' || p.status === 'accepted'
  ) || [];

  // Mark ALL participants as abandoned
  const updatedParticipants = sessionData.participants?.map(p => ({
    ...p,
    status: 'abandoned' as const,
    abandonedAt: Timestamp.now(),
  }));

  const allParticipantIds = allParticipants.map(p => p.userId);
  
  const consequences: GroupConsequences = {
    quitterUserId: userId,
    quitterUsername: participant.username,
    penaltyApplied: true,
    affectedParticipants: allParticipantIds,
    consequenceReason: 'user_quit',
  };

  await applyAbandonmentPenalty(
    null,
    userId,
    sessionData.sessionType,
    sessionData.duration,
  );

  await updateDoc(sessionRef, {
    participants: updatedParticipants,
    status: 'cancelled',
    sessionStatus: 'completed',
    endTime: Timestamp.now(),
    consequences,
  });

  console.log(`Session ${sessionId} cancelled by user ${userId}`);
};
