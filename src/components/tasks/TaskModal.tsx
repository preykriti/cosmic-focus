import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useAppDispatch } from '../../store/hooks';
import { addTask } from '../../store/slices/taskSlice';
import firestore from '@react-native-firebase/firestore';

type TaskModalProps = {
  visible: boolean;
  onClose: () => void;
  userId: string;
};

const defaultTags = ['study', 'work', 'sleep', 'workout', 'other'];

export default function TaskModal({
  visible,
  onClose,
  userId,
}: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [allocatedHours, setAllocatedHours] = useState(1);
  const [tags, setTags] = useState<string[]>(defaultTags);
  const [tag, setTag] = useState('other');
  const [newTag, setNewTag] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);

  const dispatch = useAppDispatch();

  const handleAdd = () => {
    if (title.trim() && userId) {
      dispatch(
        addTask({
          userId,
          taskData: {
            title,
            description,
            tag,
            allocatedHours,
            hoursDone: 0,
            userId,
            createdAt: firestore.Timestamp.now(),
            updatedAt: firestore.Timestamp.now(),
          },
        }),
      );
      setTitle('');
      setDescription('');
      setAllocatedHours(1);
      setTag('other');
      onClose();
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setTag(newTag.trim());
      setNewTag('');
      setShowAddInput(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Add New Task</Text>

          {/* inputs */}
          <TextInput
            style={styles.input}
            placeholder="Title"
            placeholderTextColor="#94a3b8"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            placeholder="Description"
            placeholderTextColor="#94a3b8"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          {/* slider */}
          <Text style={styles.label}>Allocated Hours: {allocatedHours}</Text>
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={1}
            maximumValue={12}
            step={1}
            value={allocatedHours}
            onValueChange={setAllocatedHours}
            minimumTrackTintColor="#3b82f6"
            maximumTrackTintColor="#e2e8f0"
            thumbTintColor="#3b82f6"
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
                  style={[styles.tagText, tag === t && { color: '#3b82f6' }]}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* custom tag */}
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
                placeholderTextColor="#94a3b8"
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

          {/* buttons */}
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#e2e8f0' }]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: '#1e293b' }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#3b82f6' }]}
              onPress={handleAdd}
            >
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginBottom: 14,
    color: '#1e293b',
    fontSize: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
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
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    marginRight: 8,
  },
  selectedTag: {
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    textTransform: 'capitalize',
  },
  addTagTrigger: {
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  addTagTriggerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3b82f6',
  },
  addTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 8,
  },
  addTagButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
