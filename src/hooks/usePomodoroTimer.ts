import { useState, useEffect, useRef } from 'react';
import { Alert, BackHandler, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BackgroundTimer from 'react-native-background-timer';
import * as focusSessionService from '../firebase/firestore/focusSession';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  doc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from '@react-native-firebase/firestore';
import { getFirestore } from '@react-native-firebase/firestore';
import { getUser, updateUser } from '../store/slices/authSlice';
import { createFeed } from '../store/slices/feedSlice';
import { applyAbandonmentPenalty } from '../firebase/firestore/sessionRewards';

export interface PomodoroHookParams {
  sessionTask: any;
  autoStartNext: boolean;
  isGroupSession: boolean;
  groupSessionId?: string;
  pomodoroLength: number;
  breakLength: number;
  plannedPomodoros: number;
}

// Constants for feed posting thresholds
const starsPost = 10;
const streakPost = 2;

export const usePomodoroTimer = ({
  sessionTask,
  autoStartNext,
  isGroupSession,
  groupSessionId,
  pomodoroLength,
  breakLength,
  plannedPomodoros,
}: PomodoroHookParams) => {
  const navigation = useNavigation();
  const user = useAppSelector(state => state.auth.user);
  const dispatch = useAppDispatch();

  // State
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState<
    'pomodoro' | 'shortBreak' | 'longBreak'
  >('pomodoro');
  const [currentCycle, setCurrentCycle] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [lastCompletedStars, setLastCompletedStars] = useState(0);
  const [testButton, setTestButton] = useState(true);
  const [participants, setParticipants] = useState<
    focusSessionService.GroupParticipant[]
  >([]);
  const [groupSession, setGroupSession] =
    useState<focusSessionService.FocusSession | null>(null);
  const [isLoading, setIsLoading] = useState(
    isGroupSession && groupSessionId ? true : false,
  );
  const [time, setTime] = useState(pomodoroLength * 60);

  // Refs
  const timerRef = useRef<number | null>(null);
  const orbitAnim = useRef(new Animated.Value(0)).current;
  const autoStartTimeoutRef = useRef<number | null>(null);

  // Date helper functions from your friend's code
  const isToday = (firestoreTimestamp: any) => {
    if (!firestoreTimestamp) return false;

    // Convert Firestore Timestamp to JS Date
    const date = firestoreTimestamp.toDate();
    const today = new Date();

    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isYesterday = (firestoreTimestamp: any) => {
    if (!firestoreTimestamp) return false;

    const date = firestoreTimestamp.toDate();
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    return (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    );
  };

  // Utility functions
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getSessionDuration = (
    type: 'pomodoro' | 'shortBreak' | 'longBreak',
  ) => {
    switch (type) {
      case 'pomodoro':
        return pomodoroLength * 60;
      case 'shortBreak':
        return breakLength * 60;
      case 'longBreak':
        return breakLength * 2 * 60;
      default:
        return pomodoroLength * 60;
    }
  };

  const getNextSessionType = ():
    | 'pomodoro'
    | 'shortBreak'
    | 'longBreak'
    | undefined => {
    if (sessionType === 'pomodoro') {
      return currentCycle % 4 === 0 ? 'longBreak' : 'shortBreak';
    } else {
      if (currentCycle > plannedPomodoros) {
        return undefined;
      }
      return 'pomodoro';
    }
  };

  const createSession = async (
    type: 'pomodoro' | 'shortBreak' | 'longBreak',
  ) => {
    if (!user) return;

    if (isGroupSession && groupSessionId) {
      setCurrentSessionId(groupSessionId);
      return;
    }

    if (!isGroupSession && !sessionTask) {
      console.error('Cannot create solo session without task');
      return;
    }

    try {
      const sessionData: focusSessionService.CreateSessionData = {
        sessionMode: isGroupSession ? 'group' : 'solo',
        userId: user.id,
        taskId: sessionTask?.id,
        taskTitle: sessionTask?.title,
        sessionType: type,
        duration: getSessionDuration(type),
        autoStartNext,
        currentCycle,
        totalCycles: plannedPomodoros,
      };

      const session = await focusSessionService.createFocusSession(sessionData);
      setCurrentSessionId(session.id);
      return session;
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const handleGroupSessionEnd = async (
    sessionData: focusSessionService.FocusSession,
  ) => {
    setIsRunning(false);
    // Stop background timer
    if (timerRef.current) {
      BackgroundTimer.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Handle cancelled sessions (when someone abandons)
    if (sessionData.status === 'cancelled' && sessionData.consequences) {
      const { quitterUsername, quitterUserId, affectedParticipants } =
        sessionData.consequences;

      // apply penalty
      if (
        user &&
        affectedParticipants.includes(user.id) &&
        user.id !== quitterUserId
      ) {
        try {
          await applyAbandonmentPenalty(
            null,
            user.id,
            sessionData.sessionType,
            sessionData.duration,
          );
          console.log('Penalty applied to current user');
        } catch (error) {
          console.error('Failed to apply penalty:', error);
        }
      }

      Alert.alert(
        'Session Failed',
        'A participant abandoned the session.',
        [
          {
            text: 'OK',
            onPress: () => {
              if (user) {
                dispatch(getUser({ userId: user.id }));
              }
              navigation.goBack();
            },
          },
        ],
      );
    }
    // Handle completed sessions
    else if (sessionData.status === 'completed') {
      Alert.alert(
        'Session Complete',
        'Great job! All participants completed the session.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    }
    // Handle any other session ending
    else {
      navigation.goBack();
    }
  };

  const handleSessionComplete = async () => {
    if (!currentSessionId || !user) return;

    // Stop timer first
    setIsRunning(false);
    if (timerRef.current) {
      BackgroundTimer.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    try {
      await focusSessionService.completeSession(currentSessionId, user.id);
      dispatch(getUser({ userId: user.id }));

      // Calculate stars earned
      const starsEarned =
        sessionType === 'pomodoro' ? (pomodoroLength === 25 ? 5 : 10) : 0;

      // Handle streak and feed logic for pomodoro sessions only
      if (sessionType === 'pomodoro') {
        if (!user.lastPomodoroDate) {
          // First pomodoro ever - set streak to 1
          dispatch(
            updateUser({
              userId: user.id,
              data: {
                streak: 1,
              },
            }),
          );
        } else if (isToday(user.lastPomodoroDate)) {
          console.log('its today');
          // Same day - check for stars milestone
          if (user.stars && (user.stars + starsEarned) % starsPost === 0) {
            await dispatch(
              createFeed({
                userId: user.id,
                type: 'stars',
                amount: user.stars + starsEarned,
                message: 'Making my Galaxy full of stars!!',
              }),
            ).unwrap();
          }
        } else if (isYesterday(user.lastPomodoroDate)) {
          // Yesterday - increment streak and check milestones
          const newStreak = (user.streak || 0) + 1;

          // Check streak milestone
          if (newStreak % streakPost === 1) {
            await dispatch(
              createFeed({
                userId: user.id,
                type: 'days',
                amount: newStreak,
                message: 'Another day, another step toward greatness!',
              }),
            ).unwrap();
          }

          // Check stars milestone
          if (user.stars && (user.stars + starsEarned) % starsPost === 0) {
            await dispatch(
              createFeed({
                userId: user.id,
                type: 'stars',
                amount: user.stars + starsEarned,
                message: 'Making my Galaxy full of stars!!',
              }),
            ).unwrap();
          }

          // Update streak
          dispatch(
            updateUser({
              userId: user.id,
              data: {
                streak: newStreak,
              },
            }),
          );
        } else {
          // More than 1 day gap - reset streak to 1 and check stars milestone
          if (user.stars && (user.stars + starsEarned) % starsPost === 0) {
            await dispatch(
              createFeed({
                userId: user.id,
                type: 'stars',
                amount: user.stars + starsEarned,
                message: 'Making my Galaxy full of stars!!',
              }),
            ).unwrap();
          }

          dispatch(
            updateUser({
              userId: user.id,
              data: {
                streak: 1,
              },
            }),
          );
        }
      }

      setLastCompletedStars(starsEarned);
      setShowCompleteModal(true);

      if (sessionType === 'shortBreak' || sessionType === 'longBreak') {
        setCurrentCycle(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to complete session:', error);
      Alert.alert('Error', 'Failed to complete session');
    }
  };

  const handleAbandonSession = async () => {
    if (!currentSessionId || !user) return;

    const alertTitle = isGroupSession
      ? 'Give Up Group Session'
      : 'Give Up Session';
    const alertMessage = isGroupSession
      ? 'Are you sure you want to give up? This will end the session for everyone and all participants will lose 1 star.'
      : "Are you sure you want to give up? You won't earn any stars and your progress won't be counted.";

    Alert.alert(alertTitle, alertMessage, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Give Up',
        style: 'destructive',
        onPress: async () => {
          try {
            // Stop timer
            setIsRunning(false);
            if (timerRef.current) {
              BackgroundTimer.clearInterval(timerRef.current);
              timerRef.current = null;
            }

            if (isGroupSession) {
              await focusSessionService.abandonGroupSession(
                currentSessionId,
                user.id,
              );
              dispatch(getUser({ userId: user.id }));
            } else {
              await focusSessionService.abandonSession(
                currentSessionId,
                user.id,
              );
              dispatch(getUser({ userId: user.id }));
            }
            navigation.goBack();
          } catch (error) {
            console.error('Failed to abandon session:', error);
          }
        },
      },
    ]);
  };

  const startNextSession = async (
    nextType?: 'pomodoro' | 'shortBreak' | 'longBreak',
  ) => {
    const nextSessionType = nextType || getNextSessionType();
    if (!nextSessionType) return;

    setSessionType(nextSessionType);
    const duration = getSessionDuration(nextSessionType);
    setTime(duration);

    await createSession(nextSessionType);
    setIsRunning(true);
    setShowCompleteModal(false);
  };

  const finishAllSessions = () => {
    setShowCompleteModal(false);
    // Stop timer if running
    if (timerRef.current) {
      BackgroundTimer.clearInterval(timerRef.current);
    }
    if (autoStartTimeoutRef.current) {
      BackgroundTimer.clearTimeout(autoStartTimeoutRef.current);
    }
    navigation.goBack();
  };

  const handleStartPause = () => {
    setIsRunning(prev => !prev);
  };

  // Effects

  // Group session listener
  useEffect(() => {
    if (!isGroupSession || !groupSessionId) return;

    console.log('Setting up group session listener for:', groupSessionId);
    const sessionRef = doc(getFirestore(), 'focusSessions', groupSessionId);

    const unsubscribe = onSnapshot(
      sessionRef,
      doc => {
        console.log('Group session snapshot received:', doc.exists());

        if (!doc.exists()) {
          console.error('Group session not found');
          Alert.alert('Error', 'Session not found', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
          return;
        }

        const sessionData = doc.data() as focusSessionService.FocusSession;
        console.log('Group session data:', {
          sessionStatus: sessionData.sessionStatus,
          status: sessionData.status,
          duration: sessionData.duration,
          startTime: sessionData.startTime,
        });

        setGroupSession(sessionData);
        setIsLoading(false);

        // Handle active session - start the timer
        if (
          sessionData.sessionStatus === 'active' &&
          sessionData.status === 'active'
        ) {
          console.log('Session is active, starting timer...');

          const sessionDuration = pomodoroLength * 60;

          if (!isRunning) {
            if (sessionData.startTime) {
              const startTime = sessionData.startTime.toDate().getTime();
              const elapsed = Math.floor((Date.now() - startTime) / 1000);
              const remaining = Math.max(0, sessionDuration - elapsed);

              console.log('Timer sync:', {
                startTime,
                elapsed,
                remaining,
                sessionDuration,
              });
              setTime(remaining);
            } else {
              setTime(sessionDuration);
            }
            setIsRunning(true);
          }
        }

        // Update participants
        if (sessionData.participants) {
          console.log(
            'Updating participants:',
            sessionData.participants.length,
          );
          setParticipants(sessionData.participants);
        }

        // Handle session end
        if (
          sessionData.status === 'completed' ||
          sessionData.status === 'cancelled'
        ) {
          console.log('Session ended:', sessionData.status);
          handleGroupSessionEnd(sessionData);
        }
      },
      error => {
        console.error('Group session listener error:', error);
        setIsLoading(false);
        Alert.alert('Error', 'Failed to load session data');
      },
    );

    return unsubscribe;
  }, [isGroupSession, groupSessionId, isRunning, navigation, pomodoroLength]);

  // Background timer logic
  useEffect(() => {
    if (isRunning && time > 0) {
      timerRef.current = BackgroundTimer.setInterval(() => {
        setTime(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            if (timerRef.current) {
              BackgroundTimer.clearInterval(timerRef.current);
              timerRef.current = null;
            }
            handleSessionComplete();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    } else if (timerRef.current) {
      BackgroundTimer.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        BackgroundTimer.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, time]);

  // Animation effect
  useEffect(() => {
    const totalDuration = getSessionDuration(sessionType);
    const progress = (totalDuration - time) / totalDuration;

    Animated.timing(orbitAnim, {
      toValue: progress * 360,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, [time, sessionType, orbitAnim]);

  // Auto start effect
  useEffect(() => {
    if (autoStartNext && showCompleteModal && !isGroupSession) {
      const nextType = getNextSessionType();
      if (nextType) {
        autoStartTimeoutRef.current = BackgroundTimer.setTimeout(() => {
          startNextSession(nextType);
        }, 3000);
      }
    }

    return () => {
      if (autoStartTimeoutRef.current) {
        BackgroundTimer.clearTimeout(autoStartTimeoutRef.current);
      }
    };
  }, [showCompleteModal, autoStartNext, currentCycle, isGroupSession]);

  // Initialize first session
  useEffect(() => {
    if (user && !currentSessionId) {
      if (isGroupSession && groupSessionId) {
        setCurrentSessionId(groupSessionId);
      } else if (!isGroupSession && sessionTask) {
        createSession('pomodoro').then(() => {
          setIsRunning(true);
        });
      }
    }
  }, [user, isGroupSession, groupSessionId, sessionTask, currentSessionId]);

  // Back handler
  useEffect(() => {
    const handleBackPress = () => {
      if (isRunning) {
        handleAbandonSession();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );
    return () => backHandler.remove();
  }, [isRunning, currentSessionId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        BackgroundTimer.clearInterval(timerRef.current);
      }
      if (autoStartTimeoutRef.current) {
        BackgroundTimer.clearTimeout(autoStartTimeoutRef.current);
      }
      BackgroundTimer.stopBackgroundTimer();
    };
  }, []);

  // Debug effect
  useEffect(() => {
    console.log('PomodoroScreen Debug:', {
      isGroupSession,
      groupSessionId,
      hasRouteTask: !!sessionTask,
      sessionTaskPresent: sessionTask ? 'present' : 'null',
    });
  }, [isGroupSession, groupSessionId, sessionTask]);

  // Animation values
  const orbitRotation = orbitAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return {
    // State
    currentSessionId,
    sessionType,
    currentCycle,
    isRunning,
    showCompleteModal,
    lastCompletedStars,
    testButton,
    participants,
    groupSession,
    isLoading,
    time,

    // Animation
    orbitRotation,

    // Functions
    formatTime,
    getSessionDuration,
    getNextSessionType,
    handleSessionComplete,
    handleAbandonSession,
    startNextSession,
    finishAllSessions,
    handleStartPause,
    setShowCompleteModal,
    setIsRunning,
    setTime,
  };
};
