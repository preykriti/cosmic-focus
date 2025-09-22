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
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { globalStyles } from '../styles/global';
import { colors } from '../constants/colors';
import SessionCompleteModal from '../components/focusSession/SessionCompleteModal';
import * as focusSessionService from '../firebase/firestore/focusSession';
import { useAppSelector } from '../store/hooks';

type RouteParams = {
  task: {
    id: string;
    title: string;
    tag: string;
    pomodoroLength: 25 | 50;
    breakLength: 5 | 10;
    plannedPomodoros: number;
  };
  autoStartNext: boolean;
};

const { height } = Dimensions.get('window');

export default function PomodoroScreen() {
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const navigation = useNavigation();
  const { task, autoStartNext } = route.params;

  const user = useAppSelector(state => state.auth.user);

  // Session state
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState<
    'pomodoro' | 'shortBreak' | 'longBreak'
  >('pomodoro');
  const [currentCycle, setCurrentCycle] = useState(1);
  const [time, setTime] = useState(task.pomodoroLength * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [lastCompletedStars, setLastCompletedStars] = useState(0);
  const [testButton, setTestButton] = useState(true);

  const timerRef = useRef<number | null>(null);
  const orbitAnim = useRef(new Animated.Value(0)).current;
  const autoStartTimeoutRef = useRef<number | null>(null);

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
        return task.pomodoroLength * 60;
      case 'shortBreak':
        return task.breakLength * 60;
      case 'longBreak':
        return task.breakLength * 2 * 60;
      default:
        return task.pomodoroLength * 60;
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
      if (currentCycle >= task.plannedPomodoros) {
        return undefined;
      }
      return 'pomodoro';
    }
  };

  const createSession = async (
    type: 'pomodoro' | 'shortBreak' | 'longBreak',
  ) => {
    if (!user) return;

    try {
      const sessionData = {
        sessionMode: 'solo' as const,
        userId: user.id,
        taskId: task.id,
        taskTitle: task.title,
        sessionType: type,
        duration: getSessionDuration(type),
        autoStartNext,
        currentCycle,
        totalCycles: task.plannedPomodoros,
      };

      const session = await focusSessionService.createFocusSession(sessionData);
      setCurrentSessionId(session.id);
      return session;
    } catch (error) {
      console.error('Failed to create session:', error);
      Alert.alert('Error', 'Failed to start session');
    }
  };

  const handleSessionComplete = async () => {
    if (!currentSessionId || !user) return;

    try {
      await focusSessionService.completeSession(currentSessionId, user.id);

      // stars earned
      const starsEarned =
        sessionType === 'pomodoro' ? (task.pomodoroLength === 25 ? 5 : 10) : 0;

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

    Alert.alert(
      'Give Up Session',
      "Are you sure you want to give up? You won't earn any stars and your progress won't be counted.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Give Up',
          style: 'destructive',
          onPress: async () => {
            try {
              await focusSessionService.abandonSession(
                currentSessionId,
                user.id,
              );
              navigation.goBack();
            } catch (error) {
              console.error('Failed to abandon session:', error);
            }
          },
        },
      ],
    );
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

  // timer logic
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
  }, [isRunning]);

  useEffect(() => {
    if (time === 0 && isRunning) {
      setIsRunning(false);
      handleSessionComplete();
    }
  }, [time]);

  // animation
  useEffect(() => {
    const totalDuration = getSessionDuration(sessionType);
    const progress = (totalDuration - time) / totalDuration;

    Animated.timing(orbitAnim, {
      toValue: progress * 360,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, [time, sessionType]);

  //auto start
  useEffect(() => {
    if (autoStartNext && showCompleteModal) {
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
  }, [showCompleteModal, autoStartNext, currentCycle]);

  // initialize first session
  useEffect(() => {
    if (user && !currentSessionId) {
      createSession('pomodoro').then(() => {
        setIsRunning(true);
      });
    }
  }, [user]);

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

  const handleStartPause = () => {
    setIsRunning(prev => !prev);
  };

  const orbitRotation = orbitAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

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

  return (
    <View style={[globalStyles.container, styles.container]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleAbandonSession}>
          <Ionicons name="close" size={24} color={colors.light.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.sessionInfo}>
        <Text style={styles.sessionType}>{getSessionTypeDisplay()}</Text>
        <Text style={styles.taskTitle}>{task.title}</Text>
        <View style={styles.tagContainer}>
          <Ionicons
            name="pricetag-outline"
            size={16}
            color={getSessionColor()}
          />
          <Text style={[styles.taskTag, { color: getSessionColor() }]}>
            {task.tag}
          </Text>
        </View>
      </View>

      <View style={styles.cycleProgress}>
        <Text style={styles.cycleText}>
          Cycle {currentCycle} of {task.plannedPomodoros}
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
        totalCycles={task.plannedPomodoros}
        nextSessionType={getNextSessionType()}
        autoStartNext={autoStartNext}
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
