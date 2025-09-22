import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text, TextInput } from 'react-native-gesture-handler';
import Ionicons from '@react-native-vector-icons/ionicons';

import { Feed } from '../../store/slices/feedSlice';

const CommentModal = ({
  visible,
  setVisible,
  selectedPost,
  setSelectedPost,
  loading,
  handleAddComment,
}: {
  visible: boolean;
  setVisible: () => void;
  selectedPost: Feed | null;
  setSelectedPost: () => void;
  loading: boolean;
  handleAddComment: (text: string) => void;
}) => {
  const [newComment, setNewComment] = useState<string>('');
  const submitComment = (): void => {
    if (!newComment.trim() || !selectedPost) return;
    handleAddComment(newComment);
    setNewComment('');
    setVisible();
    setSelectedPost();
  };
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setVisible()}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Comment</Text>
            <TouchableOpacity onPress={() => setVisible()}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.commentInput}
            placeholder="Write a comment..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
            autoFocus
          />

          <TouchableOpacity
            style={[
              styles.submitButton,
              !newComment.trim() && styles.submitButtonDisabled,
            ]}
            onPress={submitComment}
            disabled={!newComment.trim()}
          >
            <Text
              style={[
                styles.submitButtonText,
                !newComment.trim() && styles.submitButtonTextDisabled,
              ]}
            >
              Post Comment
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CommentModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 200,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#e2e8f0',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonTextDisabled: {
    color: '#94a3b8',
  },
});
