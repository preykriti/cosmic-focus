import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

type AutoStartModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (autoStart: boolean) => void;
  taskTitle: string;
};

export default function AutoStartModal({
  visible,
  onClose,
  onConfirm,
  taskTitle,
}: AutoStartModalProps) {
  const handleAutoStart = (autoStart: boolean) => {
    onConfirm(autoStart);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Start Focus Session</Text>

          <Text style={styles.taskTitle}>"{taskTitle}"</Text>

          <Text style={styles.description}>
            Do you want break timers and next pomodoro sessions to start
            automatically?
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.manualButton]}
              onPress={() => handleAutoStart(false)}
            >
              <Text style={[styles.buttonText, styles.manualButtonText]}>
                Manual Start
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.autoButton]}
              onPress={() => handleAutoStart(true)}
            >
              <Text style={styles.buttonText}>Auto Start</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: `${colors.black}50`,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: colors.light.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  autoButton: {
    backgroundColor: colors.light.primary,
  },
  manualButton: {
    backgroundColor: colors.light.surface,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  manualButtonText: {
    color: colors.light.text,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    fontSize: 14,
    color: colors.light.textSecondary,
    textAlign: 'center',
  },
});
