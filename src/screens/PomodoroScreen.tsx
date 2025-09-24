import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Animated,
  Easing,
  Alert,
  BackHandler,
  FlatList,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { globalStyles } from '../styles/global';
import { colors } from '../constants/colors';
import SessionCompleteModal from '../components/focusSession/SessionCompleteModal';
import * as focusSessionService from '../firebase/firestore/focusSession';
import { useAppSelector } from '../store/hooks';
import {
  doc,
  onSnapshot,
  serverTimestamp,
} from '@react-native-firebase/firestore';
import { getFirestore } from '@react-native-firebase/firestore';

type RouteParams = {
  task?: {
    id: string;
    title: string;
    tag: string;
    pomodoroLength: 25 | 50;
    breakLength: 5 | 10;
    plannedPomodoros: number;
  };
  autoStartNext: boolean;
  isGroupSession?: boolean;
  groupSessionId?: string;
};

const { height } = Dimensions.get('window');

const GROUP_SESSION_DEFAULT_TASK = {
  id: 'group-session-default',
  title: 'Group Session',
  tag: 'group',
  pomodoroLength: 25 as 25 | 50,
  breakLength: 5 as 5 | 10,
  plannedPomodoros: 4,
};

export default function PomodoroScreen() {
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const navigation = useNavigation();
  const {
    task: routeTask,
    autoStartNext,
    isGroupSession = false,
    groupSessionId,
  } = route.params;

  const user = useAppSelector(state => state.auth.user);

  // Move all useState and useRef hooks to the top, before any conditional logic
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
  const [time, setTime] = useState(25 * 60);

  // All refs must also be declared before any conditional logic
  const timerRef = useRef<number | null>(null);
  const orbitAnim = useRef(new Animated.Value(0)).current;
  const autoStartTimeoutRef = useRef<number | null>(null);

  // Determine the task to use - moved to after hooks
  const getSessionTask = () => {
    if (isGroupSession) {
      return null;
    }
    return routeTask || null;
  };

  const sessionTask = getSessionTask();
  const pomodoroLength = isGroupSession
    ? 25
    : sessionTask?.pomodoroLength ?? 25;
  const breakLength = isGroupSession ? 5 : sessionTask?.breakLength ?? 5;
  const plannedPomodoros = isGroupSession
    ? 4
    : sessionTask?.plannedPomodoros ?? 4;

  // ALL useEffect hooks must be declared before any conditional returns
  
  // Group session listener - consolidated into one useEffect
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

          const sessionDuration = sessionData.duration || 25 * 60;

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
          console.log('Updating participants:', sessionData.participants.length);
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
  }, [isGroupSession, groupSessionId, isRunning, navigation]);

  // Debug effect
  useEffect(() => {
    console.log('PomodoroScreen Debug:', {
      isGroupSession,
      groupSessionId,
      hasRouteTask: !!routeTask,
      sessionTask: sessionTask ? 'present' : 'null',
    });
  }, [isGroupSession, groupSessionId, routeTask, sessionTask]);

  // Timer logic
  useEffect(() => {
    if (isRunning && time > 0) {
      timerRef.current = setInterval(() => {
        setTime(prev => prev - 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, time]);

  // Handle timer completion
  useEffect(() => {
    if (time === 0 && isRunning) {
      setIsRunning(false);
      handleSessionComplete();
    }
  }, [time, isRunning]);

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
        autoStartTimeoutRef.current = setTimeout(() => {
          startNextSession(nextType);
        }, 3000);
      }
    }

    return () => {
      if (autoStartTimeoutRef.current) {
        clearTimeout(autoStartTimeoutRef.current);
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

  // Function definitions (moved after hooks)
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

    if (sessionData.status === 'cancelled' && sessionData.consequences) {
      Alert.alert(
        'Session Failed',
        'A participant abandoned the session. Everyone loses 1 star.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } else {
      navigation.goBack();
    }
  };

  const handleSessionComplete = async () => {
    if (!currentSessionId || !user) return;

    try {
      await focusSessionService.completeSession(currentSessionId, user.id);

      const starsEarned =
        sessionType === 'pomodoro' ? (pomodoroLength === 25 ? 5 : 10) : 0;

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
            if (isGroupSession) {
              await focusSessionService.abandonGroupSession(
                currentSessionId,
                user.id,
              );
            } else {
              await focusSessionService.abandonSession(
                currentSessionId,
                user.id,
              );
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
    navigation.goBack();
  };

  const handleStartPause = () => {
    setIsRunning(prev => !prev);
  };

  const getSessionTypeDisplay = () => {
    switch (sessionType) {
      case 'pomodoro':
        return 'Focus Session';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return 'Session';
    }
  };

  const getSessionColor = () => {
    switch (sessionType) {
      case 'pomodoro':
        return colors.light.primary;
      case 'shortBreak':
        return colors.light.success;
      case 'longBreak':
        return colors.light.warning;
      default:
        return colors.light.primary;
    }
  };

  const renderParticipant = ({
    item,
  }: {
    item: focusSessionService.GroupParticipant;
  }) => (
    <View style={styles.participantItem}>
      <Text style={styles.participantName}>{item.username}</Text>
      <View style={styles.participantStatus}>
        {item.status === 'active' && (
          <View
            style={[
              styles.statusDot,
              { backgroundColor: colors.light.success },
            ]}
          />
        )}
        {item.status === 'completed' && (
          <Ionicons
            name="checkmark-circle"
            size={16}
            color={colors.light.success}
          />
        )}
        {item.status === 'abandoned' && (
          <Ionicons name="close-circle" size={16} color={colors.light.error} />
        )}
      </View>
    </View>
  );

  // Animation values
  const orbitRotation = orbitAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  // NOW handle conditional rendering AFTER all hooks are declared
  if (isGroupSession && isLoading) {
    return (
      <View
        style={[
          globalStyles.container,
          styles.container,
          styles.loadingContainer,
        ]}
      >
        <Text style={styles.loadingText}>Loading group session...</Text>
      </View>
    );
  }

  if (!isGroupSession && !sessionTask) {
    return null;
  }

  // Main render
  return (
    <View style={[globalStyles.container, styles.container]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleAbandonSession}>
          <Ionicons name="close" size={24} color={colors.light.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.sessionInfo}>
        <Text style={styles.sessionType}>{getSessionTypeDisplay()}</Text>
        <Text style={styles.taskTitle}>
          {isGroupSession
            ? 'Group Session'
            : sessionTask?.title || 'Focus Session'}
        </Text>
        <View style={styles.tagContainer}>
          <Ionicons
            name={isGroupSession ? 'people' : 'pricetag-outline'}
            size={16}
            color={getSessionColor()}
          />
          <Text style={[styles.taskTag, { color: getSessionColor() }]}>
            {isGroupSession ? 'group' : sessionTask?.tag || 'focus'}
          </Text>
        </View>
      </View>

      {isGroupSession && participants.length > 0 && (
        <View style={styles.participantsContainer}>
          <Text style={styles.participantsTitle}>Participants</Text>
          <FlatList
            data={participants}
            keyExtractor={item => item.userId}
            renderItem={renderParticipant}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.participantsList}
          />
        </View>
      )}

      <View style={styles.cycleProgress}>
        <Text style={styles.cycleText}>
          {isGroupSession
            ? 'Group Focus Session'
            : `Cycle ${currentCycle} of ${plannedPomodoros}`}
        </Text>
      </View>

      <View style={styles.timerWrapper}>
        <View style={[styles.timerCircle, { borderColor: getSessionColor() }]}>
          <Text style={styles.timerText}>{formatTime(time)}</Text>
        </View>

        <Animated.View
          style={[
            styles.orbitCircle,
            { backgroundColor: getSessionColor() },
            {
              transform: [{ rotate: orbitRotation }, { translateY: -106 }],
            },
          ]}
        />
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[
            styles.controlButton,
            {
              backgroundColor: isRunning ? '#ef4444' : getSessionColor(),
            },
          ]}
          onPress={handleStartPause}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isRunning ? 'pause-outline' : 'play-outline'}
            size={20}
            color="#fff"
          />
          <Text style={styles.controlText}>
            {isRunning ? 'Pause' : 'Start'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.giveUpButton]}
          onPress={handleAbandonSession}
          activeOpacity={0.8}
        >
          <Ionicons name="flag-outline" size={20} color="#fff" />
          <Text style={styles.controlText}>Give Up</Text>
        </TouchableOpacity>

        {testButton && (
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: '#10b981' }]}
            onPress={async () => {
              setIsRunning(false);
              setTime(0);
              await handleSessionComplete();
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-done-outline" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <SessionCompleteModal
        visible={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        sessionType={sessionType}
        starsEarned={lastCompletedStars}
        currentCycle={currentCycle}
        totalCycles={plannedPomodoros}
        nextSessionType={isGroupSession ? undefined : getNextSessionType()}
        autoStartNext={autoStartNext && !isGroupSession}
        onStartNext={() => startNextSession()}
        onFinishSession={finishAllSessions}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingVertical: 24,
    paddingHorizontal: 16,
    height: height - 50,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.light.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  sessionInfo: {
    alignItems: 'center',
    marginBottom: 10,
  },
  sessionType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.textSecondary,
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  taskTag: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  participantsContainer: {
    marginBottom: 16,
  },
  participantsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  participantsList: {
    paddingHorizontal: 16,
  },
  participantItem: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  participantName: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.light.text,
    marginRight: 6,
  },
  participantStatus: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cycleProgress: {
    alignItems: 'center',
    marginBottom: 30,
  },
  cycleText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.light.textSecondary,
  },
  timerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  timerCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  timerText: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.light.text,
  },
  orbitCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    position: 'absolute',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
    marginBottom: 40,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  giveUpButton: {
    backgroundColor: '#6b7280',
  },
  controlText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});