import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const StarBackground = ({ count = 50 }:{count: number}) => {
  const stars = useMemo(
    () =>
      [...Array(count)].map((_, i) => ({
        left: Math.random() * width,
        top: Math.random() * height,
        id: i,
      })),
    [count],
  );

  return (
    <View style={styles.starsContainer}>
      {stars.map(star => (
        <View
          key={star.id}
          style={[styles.star, { left: star.left, top: star.top }]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  starsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: 'white',
    borderRadius: 1,
    opacity: 0.8,
  },
});
