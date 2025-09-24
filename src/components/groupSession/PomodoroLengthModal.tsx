import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

interface PomodoroLengthModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLength: (work: number, breakTime: number) => void;
}

export const PomodoroLengthModal: React.FC<PomodoroLengthModalProps> = ({
  visible,
  onClose,
  onSelectLength,
}) => {
  const options = [
    { label: '25 / 5 min', work: 25, breakTime: 5 },
    { label: '50 / 10 min', work: 50, breakTime: 10 },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Choose Pomodoro Length</Text>
          {options.map(option => (
            <TouchableOpacity
              key={option.label}
              style={styles.option}
              onPress={() => {
                onSelectLength(option.work, option.breakTime);
                onClose();
              }}
            >
              <Text style={styles.optionText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
  },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  option: { paddingVertical: 12, width: '100%', alignItems: 'center' },
  optionText: { fontSize: 16 },
  cancelButton: { marginTop: 10 },
  cancelText: { color: 'red' },
});
