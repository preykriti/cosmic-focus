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
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { addTask } from '../../store/slices/taskSlice';
import firestore from '@react-native-firebase/firestore';
import { useAppDispatch } from '../../store/hooks';

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
            placeholderTextColor="#888"
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            placeholder="Description"
            placeholderTextColor="#888"
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
            maximumTrackTintColor="#8b7878ff"
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
                <Text style={styles.tagText}>{t}</Text>
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
                placeholderTextColor="#888"
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

          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#555' }]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleAdd}>
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modal: {
    width: '90%',
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    padding: 20,
    boxShadow: `
      0 0 12px rgba(255, 255, 255, 0.08),
      0 4px 8px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.05)
    `,
  },

  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 18,
    textShadowColor: 'rgba(96, 165, 250, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },

  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.15)',
    padding: 12,
    marginBottom: 14,
    color: '#ffffff',
    fontSize: 15,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: 8,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },

  button: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#1e3a8a',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    marginHorizontal: 6,
    boxShadow: `
      0 4px 16px rgba(30, 64, 175, 0.25),
      0 0 0 1px rgba(59, 130, 246, 0.1)
    `,
  },

  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },

  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  selectedTag: {
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
  },

  tagText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
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
    backgroundColor: '#1e3a8a',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },

  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
