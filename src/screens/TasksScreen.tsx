import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { fetchTasks } from '../store/slices/taskSlice';
import Ionicon from '@react-native-vector-icons/ionicons';
import TaskModal from '../components/tasks/TaskModal';
import FilterBar from '../components/tasks/FilterBar';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import TaskCard from '../components/tasks/TaskCard';

export default function TasksScreen() {
  const { user } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const { tasks, loading, error } = useAppSelector(state => state.tasks);

  const [filter, setFilter] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchTasks(user.id));
    }
  }, [user, dispatch]);

  const filteredTasks =
    filter === 'all' ? tasks : tasks.filter(t => t.tag === filter);

  return (
    <View style={styles.container}>
      {/* Filter bar */}
      <FilterBar selected={filter} onSelect={setFilter} />

      {/* Task card */}
      {loading ? (
        <ActivityIndicator color="#1e3a8a" size="large" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <TaskCard task={item} onPress={() => {}} />}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Task Button */}
      <TouchableOpacity
        style={styles.addTaskButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicon name="add" size={22} color="#fff" />
        <Text style={styles.addTaskText}>Add Task</Text>
      </TouchableOpacity>

      <TaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        userId={user?.id || ''}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 90,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 10,
    elevation: 2,
  },
  listContainer: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  errorText: { color: 'red', textAlign: 'center', marginVertical: 10 },
  addTaskButton: {
    position: 'absolute',
    bottom: 54,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 14,
    backgroundColor: '#1e3a8a',
  },
  addTaskText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
