import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useAppDispatch } from '../../store/hooks';
import { addTask } from '../../store/slices/taskSlice';
import { Timestamp } from '@react-native-firebase/firestore';
import { colors } from '../../constants/colors';

type TaskModalProps = {
  visible: boolean;
  onClose: () => void;
  userId: string;
};

const defaultTags = ['study', 'work', 'sleep', 'workout', 'other'];
const priorityOptions = ['low', 'medium', 'high'] as const;

export default function TaskModal({
  visible,
  onClose,
  userId,
}: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [plannedPomodoros, setPlannedPomodoros] = useState(4);
  const [tags, setTags] = useState<string[]>(defaultTags);
  const [tag, setTag] = useState('other');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [pomodoroLength, setPomodoroLength] = useState<25 | 50>(25);
  const [breakLength, setBreakLength] = useState<5 | 10>(5);
  const [newTag, setNewTag] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const dispatch = useAppDispatch();

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPlannedPomodoros(1);
    setTag('other');
    setPriority('medium');
    setPomodoroLength(25);
    setBreakLength(5);
    setNewTag('');
    setShowAddInput(false);
  };

  const handleAdd = () => {
    if (title.trim() && userId) {
      dispatch(
        addTask({
          userId,
          taskData: {
            title,
            description,
            tag,
            priority,
            pomodoroLength,
            breakLength,
            plannedPomodoros,
            completedPomodoros: 0,
            userId,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          },
        }),
      );
      resetForm();
      onClose();
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setTag(newTag.trim());
      setNewTag('');
      setShowAddInput(false);
    }
  };

  const handlePomodoroLengthChange = (length: 25 | 50) => {
    setPomodoroLength(length);
    setBreakLength(length === 25 ? 5 : 10);
  };

  const getPriorityColor = (priorityValue: string) => {
    switch (priorityValue) {
      case 'high':
        return colors.light.error;
      case 'medium':
        return colors.light.warning;
      case 'low':
        return colors.light.success;
      default:
        return colors.light.textSecondary;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView style={styles.overlay}>
        <View
          style={[
            styles.scrollContainer,
            keyboardVisible && styles.scrollContainerKeyboard,
          ]}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              !keyboardVisible && styles.scrollContentCentered,
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={[styles.modal, keyboardVisible && styles.modalKeyboard]}
            >
              <Text style={styles.title}>Add New Task</Text>

              {/* title*/}
              <TextInput
                style={styles.input}
                placeholder="Task title"
                placeholderTextColor={colors.light.textSecondary}
                value={title}
                onChangeText={setTitle}
              />

              {/* description */}
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Description (optional)"
                placeholderTextColor={colors.light.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
              />

              {/* priority */}
              <Text style={styles.label}>Priority</Text>
              <View style={styles.priorityContainer}>
                {priorityOptions.map(p => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityOption,
                      priority === p && {
                        backgroundColor: `${getPriorityColor(p)}15`,
                        borderColor: getPriorityColor(p),
                      },
                    ]}
                    onPress={() => setPriority(p)}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        priority === p && { color: getPriorityColor(p) },
                      ]}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* pomodoro settings */}
              <Text style={styles.label}>Pomodoro Settings</Text>
              <View style={styles.pomodoroSettings}>
                <TouchableOpacity
                  style={[
                    styles.pomodoroOption,
                    pomodoroLength === 25 && styles.selectedPomodoroOption,
                  ]}
                  onPress={() => handlePomodoroLengthChange(25)}
                >
                  <Text
                    style={[
                      styles.pomodoroOptionText,
                      pomodoroLength === 25 && { color: colors.light.primary },
                    ]}
                  >
                    25min / 5min
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.pomodoroOption,
                    pomodoroLength === 50 && styles.selectedPomodoroOption,
                  ]}
                  onPress={() => handlePomodoroLengthChange(50)}
                >
                  <Text
                    style={[
                      styles.pomodoroOptionText,
                      pomodoroLength === 50 && { color: colors.light.primary },
                    ]}
                  >
                    50min / 10min
                  </Text>
                </TouchableOpacity>
              </View>

              {/* pomodoro cycle */}
              <Text style={styles.label}>
                Pomodoros Cycle: {plannedPomodoros}
              </Text>
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={1}
                maximumValue={12}
                step={1}
                value={plannedPomodoros}
                onValueChange={setPlannedPomodoros}
                minimumTrackTintColor={colors.light.primary}
                maximumTrackTintColor={colors.light.border}
                thumbTintColor={colors.light.primary}
              />

              {/* tags */}
              <Text style={styles.label}>Select Tag</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 15 }}
              >
                {tags.map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.tag, tag === t && styles.selectedTag]}
                    onPress={() => setTag(t)}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        tag === t && { color: colors.light.primary },
                      ]}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {!showAddInput ? (
                <TouchableOpacity
                  style={styles.addTagTrigger}
                  onPress={() => setShowAddInput(true)}
                >
                  <Text style={styles.addTagTriggerText}>+ Add custom tag</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.addTagContainer}>
                  <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                    placeholder="Tag name"
                    placeholderTextColor={colors.light.textSecondary}
                    value={newTag}
                    onChangeText={setNewTag}
                    autoFocus
                  />
                  <TouchableOpacity
                    style={styles.addTagButton}
                    onPress={handleAddTag}
                  >
                    <Text style={styles.buttonText}>Add</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setShowAddInput(false);
                      setNewTag('');
                    }}
                  >
                    <Text style={styles.buttonText}>×</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* add and cancel button */}
              <View style={styles.row}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    { backgroundColor: colors.light.border },
                  ]}
                  onPress={handleClose}
                >
                  <Text
                    style={[styles.buttonText, { color: colors.light.text }]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    { backgroundColor: colors.light.primary },
                  ]}
                  onPress={handleAdd}
                >
                  <Text style={styles.buttonText}>Add Task</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  scrollContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  scrollContainerKeyboard: {
    justifyContent: 'flex-start',
    paddingTop: 40,
    paddingBottom: 20,
  },
  scrollContent: {
    flexGrow: 1,
  },
  scrollContentCentered: {
    justifyContent: 'center',
  },
  modal: {
    backgroundColor: colors.light.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.light.border,
    padding: 20,
  },
  modalKeyboard: {
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.light.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.light.border,
    padding: 12,
    marginBottom: 14,
    color: colors.light.text,
    fontSize: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.textSecondary,
    marginBottom: 8,
  },
  priorityContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
    backgroundColor: colors.light.surface,
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.textSecondary,
    textTransform: 'capitalize',
  },
  pomodoroSettings: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  pomodoroOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
    backgroundColor: colors.light.surface,
    alignItems: 'center',
  },
  selectedPomodoroOption: {
    borderColor: colors.light.primary,
    backgroundColor: `${colors.light.primary}10`,
  },
  pomodoroOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.textSecondary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  buttonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 15,
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.light.border,
    backgroundColor: colors.light.surface,
    marginRight: 8,
  },
  selectedTag: {
    borderColor: colors.light.primary,
    backgroundColor: `${colors.light.primary}10`,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.light.textSecondary,
    textTransform: 'capitalize',
  },
  addTagTrigger: {
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  addTagTriggerText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.light.primary,
  },
  addTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 8,
  },
  addTagButton: {
    backgroundColor: colors.light.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.light.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
