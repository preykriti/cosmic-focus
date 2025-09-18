import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchTasks } from '../store/slices/taskSlice';
import { StarBackground } from '../components/StarBackground';
import Ionicon from '@react-native-vector-icons/ionicons';
import TaskModal from '../components/tasks/TaskModal';
import FilterBar from '../components/tasks/FilterBar';
import { useAppSelector } from '../store/hooks';
import TaskCard from '../components/tasks/TaskCard';

export default function TasksScreen() {
  const { user } = useAppSelector(state => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, loading, error } = useSelector(
    (state: RootState) => state.tasks,
  );

  const [filter, setFilter] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchTasks(user.uid));
    }
  }, [user, dispatch]);

  const filteredTasks =
    filter === 'all' ? tasks : tasks.filter(t => t.tag === filter);

  return (
    <View style={styles.container}>
      <StarBackground count={40} />

      <Text style={styles.header}>Your Tasks</Text>
      <FilterBar selected={filter} onSelect={setFilter} />

      {loading ? (
        <ActivityIndicator color="#1e3a8a" size="large" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <TaskCard task={item} onPress={() => {}} />}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        />
      )}
      <View>
        <TouchableOpacity
          style={styles.addTaskButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicon name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <TaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        userId={user?.uid || ''}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111633', padding: 20 },
  header: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: '#64c8ff',
    textShadowRadius: 10,
  },
  errorText: { color: 'red', textAlign: 'center', marginVertical: 10 },
  addTaskButton: {
    position: 'absolute',
    bottom: 50,
    right: 30,
    backgroundColor: '#1e3a8a',
    padding: 16,
    borderRadius: 50,
    // boxShadow: `
    //   0 0 12px rgba(229, 235, 236, 0.6),
    //   0 0 25px rgba(138,43,226,0.4)
    // `,
  },
  taskButtonWrapper:{
    position: 'absolute',
    bottom: 50,
    right: 30,
  }
});
