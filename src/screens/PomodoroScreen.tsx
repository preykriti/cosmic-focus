import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import Ionicon from '@react-native-vector-icons/ionicons';
import { globalStyles } from '../styles/global';

const { height } = Dimensions.get('window');
const POMODORO_DURATION = 25 * 60;

export default function PomodoroScreen() {
  const [time, setTime] = useState(POMODORO_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [stars, setStars] = useState(120);
  const [taskTitle, setTaskTitle] = useState('Finish Assignment');
  const [taskTag, setTaskTag] = useState<'study' | 'work' | 'sleep' | 'other'>(
    'study',
  );

  const timerRef = useRef<number | null>(null);

  const orbitAnim = useRef(new Animated.Value(0)).current;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000) as number;
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  useEffect(() => {
    const progress = (POMODORO_DURATION - time) / POMODORO_DURATION;
    Animated.timing(orbitAnim, {
      toValue: progress * 360,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, [time]);

  const handleStartPause = () => {
    setIsRunning(prev => !prev);
  };

  const orbitX = orbitAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[globalStyles.container, styles.container]}>
      <View style={styles.taskInfoContainer}>
        <Text style={styles.taskTitle}>{taskTitle}</Text>
        <View style={styles.tagContainer}>
          <Ionicon name="pricetag-outline" size={16} color="#3b82f6" />
          <Text style={styles.taskTag}>{taskTag}</Text>
        </View>
      </View>

      <View style={styles.timerWrapper}>
        <View style={styles.timerCircle}>
          <Text style={styles.timerText}>{formatTime(time)}</Text>
        </View>

        {/* orbiting small circle */}
        <Animated.View
          style={[
            styles.orbitCircle,
            {
              transform: [{ rotate: orbitX }, { translateY: -105 }],
            },
          ]}
        />
      </View>
      <View style={styles.starsContainer}>
        <Ionicon name="star-outline" size={22} color="#f59e0b" />
        <Text style={styles.starsText}>{stars} Stars</Text>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[
            styles.controlButton,
            { backgroundColor: isRunning ? '#1a648fff' : '#1e3a8a' },
          ]}
          onPress={handleStartPause}
          activeOpacity={0.8}
        >
          <Ionicon
            name={isRunning ? 'pause-outline' : 'play-outline'}
            size={20}
            color="#fff"
          />
          <Text style={styles.controlText}>{isRunning ? 'Stop' : 'Start'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'space-between',
    paddingVertical: 24,
    paddingHorizontal: 16,
    height: height - 50,
  },
  taskInfoContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  taskTag: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0369a1',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  timerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  timerCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 6,
    borderColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  timerText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1e293b',
  },
  orbitCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#f59e0b',
    position: 'absolute',
  },
  starsContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  starsText: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '600',
    color: '#f59e0b',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 40,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
    elevation: 2,
  },
  controlText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
