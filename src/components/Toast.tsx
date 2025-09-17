import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { clearError, clearMessage } from '../store/slices/authSlice';

const Toast = () => {
  const dispatch = useAppDispatch();
  const { error, message } = useAppSelector((state) => state.auth);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (error || message) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (error) dispatch(clearError());
        if (message) dispatch(clearMessage());
      });
    }
  }, [error, message, fadeAnim, dispatch]);

  if (!error && !message) return null;

  return (
    <Animated.View
      style={[
        styles.toast,
        { 
          opacity: fadeAnim,
          backgroundColor: error ? '#ad4338ff' : '#49c57dff',
        },
      ]}
    >
      <Text style={styles.toastText}>{error || message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 8,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  toastText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default Toast;