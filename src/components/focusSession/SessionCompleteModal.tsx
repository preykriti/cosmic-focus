import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { colors } from '../../constants/colors';

type SessionCompleteModalProps = {
  visible: boolean;
  onClose: () => void;
  sessionType: 'pomodoro' | 'shortBreak' | 'longBreak';
  starsEarned: number;
  currentCycle: number;
  totalCycles: number;
  nextSessionType?: 'pomodoro' | 'shortBreak' | 'longBreak';
  autoStartNext: boolean;
  onStartNext?: () => void;
  onFinishSession: () => void;
};

export default function SessionCompleteModal({
  visible,
  onClose,
  sessionType,
  starsEarned,
  currentCycle,
  totalCycles,
  nextSessionType,
  autoStartNext,
  onStartNext,
  onFinishSession,
}: SessionCompleteModalProps) {
  const isLastCycle = currentCycle > totalCycles;
  
  const getSessionTypeText = (type: string) => {
    switch (type) {
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

  const getNextSessionText = (type?: string) => {
    if (!type) return '';
    switch (type) {
      case 'pomodoro':
        return 'Next Focus Session';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return 'Next Session';
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name="checkmark-circle" 
              size={60} 
              color={colors.light.success} 
            />
          </View>

          <Text style={styles.title}>
            {getSessionTypeText(sessionType)} Complete!
          </Text>

          {starsEarned > 0 && (
            <View style={styles.starsContainer}>
              <Ionicons name="star" size={24} color={colors.star} />
              <Text style={styles.starsText}>+{starsEarned} Stars Earned!</Text>
            </View>
          )}

          <Text style={styles.progressText}>
            {/* Cycle {currentCycle} of {totalCycles} completed */}
            Cycle {sessionType === 'pomodoro' ? currentCycle : currentCycle - 1}{' '}
            of {totalCycles} completed
          </Text>

          {!isLastCycle && nextSessionType && (
            <>
              <Text style={styles.nextSessionText}>
                {autoStartNext 
                  ? `${getNextSessionText(nextSessionType)} will start automatically`
                  : `Ready for ${getNextSessionText(nextSessionType)}?`
                }
              </Text>

              <View style={styles.buttonContainer}>
                {!autoStartNext && onStartNext && (
                  <TouchableOpacity
                    style={[styles.button, styles.primaryButton]}
                    onPress={onStartNext}
                  >
                    <Text style={styles.buttonText}>
                      Start {getNextSessionText(nextSessionType)}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={onFinishSession}
                >
                  <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                    Finish Session
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {isLastCycle && (
            <>
              <Text style={styles.completionText}>
                All cycles completed! Great job!
              </Text>
              
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={onFinishSession}
              >
                <Text style={styles.buttonText}>
                  Finish Session
                </Text>
              </TouchableOpacity>
            </>
          )}

          {autoStartNext && !isLastCycle && (
            <TouchableOpacity style={styles.cancelAutoButton} onPress={onClose}>
              <Text style={styles.cancelAutoButtonText}>Cancel Auto-start</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: colors.light.card,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.light.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: colors.light.mutedcard,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  starsText: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '600',
    color: colors.star,
  },
  progressText: {
    fontSize: 14,
    color: colors.light.textSecondary,
    marginBottom: 16,
  },
  nextSessionText: {
    fontSize: 14,
    color: colors.light.text,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  completionText: {
    fontSize: 16,
    color: colors.light.text,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  primaryButton: {
    backgroundColor: colors.light.primary,
  },
  secondaryButton: {
    backgroundColor: colors.light.surface,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  secondaryButtonText: {
    color: colors.light.text,
  },
  cancelAutoButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelAutoButtonText: {
    fontSize: 14,
    color: colors.light.textSecondary,
    textAlign: 'center',
  },
});