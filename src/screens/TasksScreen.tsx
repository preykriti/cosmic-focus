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
import { colors } from '../constants/colors';
import { useNavigation } from '@react-navigation/core';

export default function TasksScreen() {
  const { user } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const { tasks, loading, error } = useAppSelector(state => state.tasks);
  const navigation: any = useNavigation();

  const [filter, setFilter] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);

  const handleStartPomodoro = (task: any, autoStart: boolean) => {
    navigation.navigate('Pomodoro', {
      task: {
        id: task.id,
        title: task.title,
        tag: task.tag,
        pomodoroLength: task.pomodoroLength,
        breakLength: task.breakLength,
        plannedPomodoros: task.plannedPomodoros,
      },
      autoStartNext: autoStart,
    });
  };

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchTasks(user.id));
    }
  }, [user, dispatch]);

  const filteredTasks =
    filter === 'all' ? tasks : tasks.filter(t => t.tag === filter);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your tasks</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicon name="add" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Filter bar */}
      <FilterBar selected={filter} onSelect={setFilter} />

      {/* Task list */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.light.primary} />
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onPress={() => {
                console.log('card pressed');
              }}
              onStartPomodoro={handleStartPomodoro}
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

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
    backgroundColor: colors.light.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.light.text,
  },
  addButton: {
    backgroundColor: colors.light.primary,
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.light.error,
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
});
