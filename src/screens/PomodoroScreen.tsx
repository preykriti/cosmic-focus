import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Animated,
  FlatList,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { globalStyles } from '../styles/global';
import { colors } from '../constants/colors';
import SessionCompleteModal from '../components/focusSession/SessionCompleteModal';
import * as focusSessionService from '../firebase/firestore/focusSession';
import { usePomodoroTimer } from '../hooks/usePomodoroTimer';
import SoundToggle from '../components/focusSession/SoundToggle';
import DeepFocusPermission from '../components/DeepFocusPermission';
import { Modal } from 'react-native';

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

export default function PomodoroScreen() {
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const [challengeModeVisible, setChallengeModeVisible] = useState(false);
  const [isDeepFocusEnabled, setIsDeepFocusEnabled] = useState(false);

  const {
    task: routeTask,
    autoStartNext,
    isGroupSession = false,
    groupSessionId,
  } = route.params;

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

  // Use custom hook for all logic
  const {
    sessionType,
    currentCycle,
    isRunning,
    showCompleteModal,
    lastCompletedStars,
    testButton,
    participants,
    isLoading,
    time,
    orbitRotation,
    formatTime,
    handleSessionComplete,
    handleAbandonSession,
    startNextSession,
    finishAllSessions,
    // Removed handleStartPause
    getNextSessionType,
    setShowCompleteModal,
    setIsRunning,
    setTime,
  } = usePomodoroTimer({
    sessionTask,
    autoStartNext,
    isGroupSession,
    groupSessionId,
    pomodoroLength,
    breakLength,
    plannedPomodoros,
  });

  // UI Helper functions
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

  // Loading state
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

  // Invalid state
  if (!isGroupSession && !sessionTask) {
    return null;
  }

  return (
    <View style={[globalStyles.container, styles.container]}>
      <View style={styles.header}>
        <SoundToggle file="whitenoise.mp3" />

        {sessionType === 'pomodoro' && (
          <TouchableOpacity
            style={{ marginLeft: 16 }}
            onPress={() => setChallengeModeVisible(true)}
          >
            <Ionicons name="flash" size={28} color={colors.light.primary} />
          </TouchableOpacity>
        )}
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
{/* 
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
      )} */}

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
        {!isRunning && (
          <TouchableOpacity
            style={[
              styles.controlButton,
              {
                backgroundColor: getSessionColor(),
              },
            ]}
            onPress={() => setIsRunning(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="play-outline" size={20} color="#fff" />
            <Text style={styles.controlText}>Start</Text>
          </TouchableOpacity>
        )}

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
      <Modal
        visible={challengeModeVisible}
        animationType="slide"
        transparent={true} 
        onRequestClose={() => setChallengeModeVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <DeepFocusPermission
              isDeepFocusEnabled={isDeepFocusEnabled}
              setIsDeepFocusEnabled={setIsDeepFocusEnabled}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setChallengeModeVisible(false)}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    marginBottom: 20,
    alignItems: 'center',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // dim background
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});
