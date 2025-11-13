import React, { useRef } from 'react';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  State,
} from 'react-native-gesture-handler';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Animated,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { colors } from '../../constants/colors';
import TaskCard from './TaskCard';

const { width: screenWidth } = Dimensions.get('window');
const DELETE_THRESHOLD = screenWidth * 0.25; 

interface Task {
  id: string;
  title: string;
  description?: string;
  tag: string;
  priority: 'low' | 'medium' | 'high';
  pomodoroLength: 25 | 50;
  breakLength: 5 | 10;
  plannedPomodoros: number;
  completedPomodoros: number;
  userId: string;
  createdAt: any;
  updatedAt: any;
}

interface SwipeableTaskCardProps {
  task: Task;
  onPress: () => void;
  onStartPomodoro?: (task: Task, autoStart: boolean) => void;
  onDelete: (taskId: string) => void;
}

export default function SwipeableTaskCard({
  task,
  onPress,
  onStartPomodoro,
  onDelete,
}: SwipeableTaskCardProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, velocityX } = event.nativeEvent;
      
      // checking if swipe is far enough or fast enough to trigger delete
      const shouldDelete = 
        translationX < -DELETE_THRESHOLD || 
        (translationX < -50 && velocityX < -500);

      if (shouldDelete) {
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: -screenWidth,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.8,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onDelete(task.id);
        });
      } else {
        // back to original position
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      }
    }
  };

  const deleteOpacity = translateX.interpolate({
    inputRange: [-DELETE_THRESHOLD * 2, -DELETE_THRESHOLD, 0],
    outputRange: [1, 0.8, 0],
    extrapolate: 'clamp',
  });

  const deleteScale = translateX.interpolate({
    inputRange: [-DELETE_THRESHOLD * 2, -DELETE_THRESHOLD, 0],
    outputRange: [1.1, 1, 0.8],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.deleteBackground,
          {
            opacity: deleteOpacity,
            transform: [{ scale: deleteScale }],
          },
        ]}
      >
        <View style={styles.deleteContent}>
          <Ionicons name="trash-outline" size={24} color={colors.white} />
          <Text style={styles.deleteText}>Delete</Text>
        </View>
      </Animated.View>

      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-10, 10]}
        failOffsetY={[-5, 5]}
      >
        <Animated.View
          style={[
            styles.cardContainer,
            {
              transform: [
                { translateX },
                { scale },
              ],
              opacity,
            },
          ]}
        >
          <TaskCard
            task={task}
            onPress={onPress}
            onStartPomodoro={onStartPomodoro}
          />
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 26,
  },
  cardContainer: {
    backgroundColor: 'transparent',
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: screenWidth,
    backgroundColor: colors.light.error || '#EF4444',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 30,
    borderRadius: 16,
    zIndex: -1,
  },
  deleteContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
});