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
    // group session
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

    // check if all participants have completed
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

// abandon session
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
    const participant = sessionData.participants?.find(
      p => p.userId === userId,
    );
    if (!participant) throw new Error('Participant not found');

    const groupSettings = sessionData.groupSettings;
    if (!groupSettings) throw new Error('Group settings not found');

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
        null,
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
        null,
        userId,
        sessionData.sessionType,
        sessionData.duration,
      );
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

// get session
export const getSession = async (
  sessionId: string,
): Promise<FocusSession | null> => {
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

// accept group invitation
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

// decline group invitation
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

// Fixed fetchUserSessions function
export const fetchUserSessions = async (
  userId: string,
): Promise<FocusSession[]> => {
  const sessionsRef = collection(firestore, 'focusSessions');

  // Query for solo sessions
  const soloQuery = query(sessionsRef, where('userId', '==', userId));
  const soloSnapshot = await getDocs(soloQuery);
  const soloSessions = soloSnapshot.docs.map(doc => doc.data() as FocusSession);

  // Query for group sessions where user is a participant
  const groupQuery = query(
    sessionsRef,
    where('sessionMode', '==', 'group'),
    where('participants', 'array-contains-any', [{ userId }]),
  );

  let groupSessions: FocusSession[] = [];
  try {
    const groupSnapshot = await getDocs(groupQuery);
    groupSessions = groupSnapshot.docs
      .map(doc => doc.data() as FocusSession)
      .filter(session => session.participants?.some(p => p.userId === userId));
  } catch (error) {
    console.log('Group session query failed, using alternative approach');

    // Fallback: get all group sessions and filter client-side
    const allGroupQuery = query(
      sessionsRef,
      where('sessionMode', '==', 'group'),
    );
    const allGroupSnapshot = await getDocs(allGroupQuery);
    groupSessions = allGroupSnapshot.docs
      .map((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => doc.data() as FocusSession)
      .filter((session: FocusSession) => session.participants?.some(p => p.userId === userId));
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
    // Convert Firestore Timestamp to JavaScript Date
    const sessionDate =
      session.createdAt instanceof Timestamp
        ? session.createdAt.toDate()
        : new Date(session.createdAt);

    // Use local timezone for date string to avoid timezone issues
    const year = sessionDate.getFullYear();
    const month = String(sessionDate.getMonth() + 1).padStart(2, '0');
    const day = String(sessionDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    dailyCounts[dateStr] = (dailyCounts[dateStr] || 0) + 1;
  });

  console.log('Daily counts:', dailyCounts); // Debug log

  const data: number[][] = [];
  for (let w = 0; w < weeks; w++) {
    const week: number[] = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + w * 7 + d);

      // Use same date formatting as above
      const year = day.getFullYear();
      const month = String(day.getMonth() + 1).padStart(2, '0');
      const dayNum = String(day.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${dayNum}`;

      const count = dailyCounts[dateStr] || 0;
      // Cap the count at 4 for heatmap visualization
      week.push(Math.min(count, 4));
    }
    data.push(week);
  }

  return data;
};

// start group session
export const startGroupSession = async (sessionId: string): Promise<void> => {
  const sessionRef = doc(sessionsCollection, sessionId);
  await updateDoc(sessionRef, {
    sessionStatus: 'active',
    startTime: serverTimestamp(),
  });
};

// abandon group session
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
        ?.filter(
          p =>
            p.userId !== userId &&
            (p.status === 'active' || p.status === 'accepted'),
        )
        .map(p => p.userId) || [];

    const consequences: GroupConsequences = {
      quitterUserId: userId,
      quitterUsername: participant.username,
      penaltyApplied: true,
      affectedParticipants,
      consequenceReason: 'user_quit',
    };

    await applyGroupPenalties(
      null,
      [...affectedParticipants, userId],
      userId,
      sessionData.sessionType,
      sessionData.duration,
      groupSettings.penaltyForQuitting.deadStarsGained,
    );

    sessionUpdate = {
      ...sessionUpdate,
      status: 'cancelled',
      sessionStatus: 'completed',
      endTime: Timestamp.now(),
      consequences,
    };
  } else {
    await applyAbandonmentPenalty(
      null,
      userId,
      sessionData.sessionType,
      sessionData.duration,
    );
  }

  await updateDoc(sessionRef, sessionUpdate);
};
