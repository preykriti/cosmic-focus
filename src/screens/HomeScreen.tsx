import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import StarCanvas from '../components/home/StarCanvas';
import Ionicons from '@react-native-vector-icons/ionicons';
import { colors } from '../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../types/navigation';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'MainTabs'
>;

const messages = [
  'Stay consistent, grow your universe',
  'Focus is your superpower',
  'Every star is a victory',
  'Small sessions, big results',
];

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const [index, setIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      // fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        // change text
        setIndex(prev => (prev + 1) % messages.length);
        // fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }).start();
      });
    }, 3000);

    // fade in first message
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <StarCanvas />

      {/* Rotating text overlay */}
      <View style={styles.messageContainer}>
        <Animated.Text style={[styles.message, { opacity: fadeAnim }]}>
          {messages[index]}
        </Animated.Text>
      </View>

      {/* Icons bottom-center */}
      <View style={styles.icons}>
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => navigation.navigate('Shop')}
        >
          <Ionicons name="planet-outline" size={28} color={colors.white} />
          <Text style={styles.iconLabel}>Shop</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => navigation.navigate('Feed')}
        >
          <Ionicons name="newspaper-outline" size={28} color={colors.white} />
          <Text style={styles.iconLabel}>Feed</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  messageContainer: {
    position: 'absolute',
    top: 80,
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 10,
    borderRadius: 30,
    zIndex: 100,
    alignSelf: 'center',
    height: 100,
    width: '80%',
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    color: colors.white,
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  icons: {
    position: 'absolute',
    zIndex: 100,
    bottom: 58,
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 35,
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
  },
  iconLabel: {
    color: colors.white,
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
  },
});
