import React, { useMemo, useState, useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import { Canvas, Rect } from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface Star {
  x: number;
  y: number;
  radius: number;
}

const StarCanvas = () => {
  const [numStars, setNumStars] = useState(500);
  const [starsBounds, setStarsBounds] = useState({
    minX: 0,
    maxX: 0,
    minY: 0,
    maxY: 0,
  });

  // Generate random stars and calculate their bounds
  const stars: Star[] = useMemo(() => {
    const newStars = Array.from({ length: numStars }, () => {
      const radius = Math.random() * 2 + 1;
      return {
        x: Math.random() * 4000 + 500, // Start from 500 to avoid edges
        y: Math.random() * 4000 + 500,
        radius,
      };
    });

    // Calculate bounds of stars
    if (newStars.length > 0) {
      const bounds = newStars.reduce(
        (acc, star) => ({
          minX: Math.min(acc.minX, star.x - star.radius),
          maxX: Math.max(acc.maxX, star.x + star.radius),
          minY: Math.min(acc.minY, star.y - star.radius),
          maxY: Math.max(acc.maxY, star.y + star.radius),
        }),
        {
          minX: Infinity,
          maxX: -Infinity,
          minY: Infinity,
          maxY: -Infinity,
        },
      );

      runOnJS(setStarsBounds)(bounds);
    }

    return newStars;
  }, [numStars]);

  // Calculate canvas size based on star bounds with padding
  const canvasWidth = useMemo(() => {
    return Math.max(starsBounds.maxX - starsBounds.minX + 1000, width);
  }, [starsBounds, width]);

  const canvasHeight = useMemo(() => {
    return Math.max(starsBounds.maxY - starsBounds.minY + 1000, height);
  }, [starsBounds, height]);

  // Zoom and pan values
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Calculate initial scale to fit all stars vertically
  const calculateInitialScale = () => {
    const starsWidth = starsBounds.maxX - starsBounds.minX;
    const starsHeight = starsBounds.maxY - starsBounds.minY;
    if (starsWidth > 0 && starsHeight > 0) {
      // Fit stars both horizontally and vertically
      return Math.min(width / starsWidth, height / starsHeight, 1);
    }
    return 1;
  };
  // Initialize with fit-to-view
  useEffect(() => {
    if (starsBounds.maxX > 0 && starsBounds.maxY > 0) {
      const initialScale = calculateInitialScale();
      const starsCenterX = (starsBounds.minX + starsBounds.maxX)/2;
      const starsCenterY = (starsBounds.minY + starsBounds.maxY) / 2;

      let initialTranslateX = width / 2 - starsCenterX * initialScale;
      let initialTranslateY = height / 2 - starsCenterY * initialScale;

      const clamped = clampTranslation(
        initialTranslateX,
        initialTranslateY,
        initialScale,
      );

      scale.value = initialScale;
      translateX.value = clamped.x;
      translateY.value = clamped.y;
    }
  }, [starsBounds]);

  // Pan gesture with boundaries
 // Pan gesture with proper boundaries
const panGesture = Gesture.Pan()
  .onStart(() => {
    savedTranslateX.value = translateX.value;
    savedTranslateY.value = translateY.value;
  })
  .onUpdate((event) => {
    const newX = savedTranslateX.value + event.translationX;
    const newY = savedTranslateY.value + event.translationY;

    // Scaled canvas size
    const scaledWidth = canvasWidth * scale.value;
    const scaledHeight = canvasHeight * scale.value;

    // Clamp translation so canvas edges never expose background
    const minX = Math.min(0, width - scaledWidth);
    const maxX = 0;
    const minY = Math.min(0, height - scaledHeight);
    const maxY = 0;

    translateX.value = Math.max(minX, Math.min(maxX, newX));
    translateY.value = Math.max(minY, Math.min(maxY, newY));
  });

// Pinch gesture with boundaries
const pinchGesture = Gesture.Pinch()
  .onStart(() => {
    savedScale.value = scale.value;
    savedTranslateX.value = translateX.value;
    savedTranslateY.value = translateY.value;
  })
  .onUpdate((event) => {
    let newScale = savedScale.value * event.scale;
    newScale = Math.max(0.1, Math.min(5, newScale)); // clamp zoom

    scale.value = newScale;

    // Keep canvas centered relative to pinch
    const scaledWidth = canvasWidth * newScale;
    const scaledHeight = canvasHeight * newScale;

    const minX = Math.min(0, width - scaledWidth);
    const maxX = 0;
    const minY = Math.min(0, height - scaledHeight);
    const maxY = 0;

    // Adjust translation proportionally
    translateX.value = Math.max(minX, Math.min(maxX, savedTranslateX.value * (newScale / savedScale.value)));
    translateY.value = Math.max(minY, Math.min(maxY, savedTranslateY.value * (newScale / savedScale.value)));
  })
  .onEnd(() => {
    // Optional spring back if scale exceeds limits
    if (scale.value < 0.3) scale.value = withSpring(0.3);
    else if (scale.value > 4) scale.value = withSpring(4);
  });

// Double tap to fit all stars
const doubleTapGesture = Gesture.Tap()
  .numberOfTaps(2)
  .onEnd(() => {
    const fitScale = calculateInitialScale();
    const starsCenterX = (starsBounds.minX + starsBounds.maxX) / 2;
    const starsCenterY = (starsBounds.minY + starsBounds.maxY) / 2;

    const initialTranslateX = width / 2 - starsCenterX * fitScale;
    const initialTranslateY = height / 2 - starsCenterY * fitScale;

    // Clamp translation to screen bounds
    const clampedX = Math.max(Math.min(initialTranslateX, 0), width - canvasWidth * fitScale);
    const clampedY = Math.max(Math.min(initialTranslateY, 0), height - canvasHeight * fitScale);

    scale.value = withSpring(fitScale);
    translateX.value = withSpring(clampedX);
    translateY.value = withSpring(clampedY);
  });

// Combine gestures
const composedGesture = Gesture.Simultaneous(
  panGesture,
  Gesture.Exclusive(pinchGesture, doubleTapGesture)
);


  const clampTranslation = (
    translateX: number,
    translateY: number,
    scale: number,
  ) => {
    const scaledWidth = canvasWidth * scale;
    const scaledHeight = canvasHeight * scale;

    const maxX = Math.max(0, (scaledWidth - width) / 2);
    const minX = -maxX;
    const maxY = Math.max(0, (scaledHeight - height) / 2);
    const minY = -maxY;

    return {
      x: Math.max(minX, Math.min(maxX, translateX)),
      y: Math.max(minY, Math.min(maxY, translateY)),
    };
  };


  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  return (
    <View style={{ flex: 1, backgroundColor: 'blue', overflow: 'hidden' }}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[{ width, height}, animatedStyle]}>
          <Canvas
            style={{
              width: canvasWidth,
              height: canvasHeight,
              backgroundColor: '#120935ff',
            }}
          >
            {/* Large black rectangle representing our canvas */}
            <Rect
              x={0}
              y={0}
              width={canvasWidth}
              height={canvasHeight}
              color="black"
            />

            {/* Render stars */}
            {stars.map((star, idx) => (
              <Rect
                key={idx}
                x={star.x - star.radius}
                y={star.y - star.radius}
                width={star.radius * 2}
                height={star.radius * 2}
                color="white"
              />
            ))}
          </Canvas>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

export default StarCanvas;
