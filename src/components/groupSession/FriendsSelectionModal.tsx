import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { FriendProfile } from '../../types/friends';
import Ionicons from '@react-native-vector-icons/ionicons';

interface Friend {
  id: string;
  name: string;
}

interface FriendSelectionModalProps {
  visible: boolean;
  friends: FriendProfile[];
  maxSelection?: number;
  onClose: () => void;
  onConfirm: (selectedFriends: FriendProfile[]) => void;
}

export const FriendSelectionModal: React.FC<FriendSelectionModalProps> = ({
  visible,
  friends,
  maxSelection,
  onClose,
  onConfirm,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(i => i !== id));
    } else {
      if (!maxSelection || selectedIds.length < maxSelection) {
        setSelectedIds(prev => [...prev, id]);
      }
    }
  };

  const handleConfirm = () => {
    const selectedFriends = friends.filter(f => selectedIds.includes(f.id));
    onConfirm(selectedFriends);
    setSelectedIds([]);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Select Friends</Text>
          <FlatList
            data={friends}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.friendItem}
                onPress={() => toggleSelect(item.id)}
              >
                <Text style={styles.friendName}>{item.username}</Text>
                {selectedIds.includes(item.id) && (
                  <Ionicons name="checkmark-circle" size={20} color="indigo" />
                )}
              </TouchableOpacity>
            )}
          />
          <View style={styles.buttons}>
            <TouchableOpacity
              onPress={handleConfirm}
              style={styles.confirmButton}
            >
              <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
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
    maxHeight: '80%',
  },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  friendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  friendName: { fontSize: 16 },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  confirmButton: { padding: 10, backgroundColor: '#6366F1', borderRadius: 8 },
  confirmText: { color: '#fff', fontWeight: 'bold' },
  cancelButton: { padding: 10 },
  cancelText: { color: 'red' },
});
