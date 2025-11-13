import React, { useMemo, useState, useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import {
  Canvas,
  Rect,
  Circle,
  useImage,
  Image as SkiaImage,
  Paint,
  BlurMask,
} from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useAppSelector } from '../../store/hooks';
import { planetsData } from '../../constants/shopData';

const { width, height } = Dimensions.get('window');

interface Star {
  x: number;
  y: number;
  radius: number;
  type: 'star' | 'deadStar' | 'blackhole';
}

const StarCanvas = () => {
  const user = useAppSelector(state => state.auth.user);

  const starsCount = user?.stars ?? 0;
  const deadStarsCount = user?.deadStars ?? 0;
  const blackholesCount = user?.blackholes ?? 0;
  const purchasedPlanetIds = user?.purchases ?? [];

  const planetImages = planetsData.map(planet => ({
    ...planet,
    skiaImage: useImage(planet.asset),
  }));
  const purchasedPlanetsWithImages = useMemo(() => {
    return planetImages.filter(
      planet => purchasedPlanetIds.includes(planet.id) && planet.skiaImage,
    );
  }, [purchasedPlanetIds, planetImages]);

  const [starsBounds, setStarsBounds] = useState({
    minX: 0,
    maxX: 0,
    minY: 0,
    maxY: 0,
  });

  const stars: Star[] = useMemo(() => {
    const randCoord = () => ({
      x: Math.random() * 4000 + 500,
      y: Math.random() * 4000 + 500,
    });

    const gen = (count: number, type: Star['type'], radius: number) =>
      Array.from({ length: count }, () => {
        const { x, y } = randCoord();
        return { x, y, radius, type };
      });

    const newStars = [
      ...gen(starsCount, 'star', 2),
      ...gen(deadStarsCount, 'deadStar', 2.5),
      ...gen(blackholesCount, 'blackhole', 10),
    ];

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
  }, [starsCount, deadStarsCount, blackholesCount]);

  const canvasWidth = useMemo(() => {
    return Math.max(starsBounds.maxX - starsBounds.minX + 1000, width);
  }, [starsBounds, width]);

  const canvasHeight = useMemo(() => {
    return Math.max(starsBounds.maxY - starsBounds.minY + 1000, height);
  }, [starsBounds, height]);

  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const clampTranslation = (
    translateX: number,
    translateY: number,
    scale: number,
  ) => {
    'worklet';
    const scaledWidth = canvasWidth * scale;
    const scaledHeight = canvasHeight * scale;

    // to keep canvas centered
    const maxX = Math.max(0, (scaledWidth - width) / 2);
    const minX = -maxX;
    const maxY = Math.max(0, (scaledHeight - height) / 2);
    const minY = -maxY;

    return {
      x: Math.max(minX, Math.min(maxX, translateX)),
      y: Math.max(minY, Math.min(maxY, translateY)),
    };
  };

  useEffect(() => {
    if (starsBounds.maxX > 0 && starsBounds.maxY > 0) {
      const starsWidth = starsBounds.maxX - starsBounds.minX;
      const starsHeight = starsBounds.maxY - starsBounds.minY;
      const initialScale =
        starsWidth > 0 && starsHeight > 0
          ? Math.min(width / starsWidth, height / starsHeight, 1)
          : 1;

      const starsCenterX = (starsBounds.minX + starsBounds.maxX) / 2;
      const starsCenterY = (starsBounds.minY + starsBounds.maxY) / 2;

      // Center the stars in the screen
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

  // pan gesture
  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate(event => {
      const newX = savedTranslateX.value + event.translationX;
      const newY = savedTranslateY.value + event.translationY;

      const clamped = clampTranslation(newX, newY, scale.value);
      translateX.value = clamped.x;
      translateY.value = clamped.y;
    });

  // pinch gesture
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate(event => {
      let newScale = savedScale.value * event.scale;
      newScale = Math.max(0.1, Math.min(5, newScale));

      scale.value = newScale;

      const newX = savedTranslateX.value * (newScale / savedScale.value);
      const newY = savedTranslateY.value * (newScale / savedScale.value);

      const clamped = clampTranslation(newX, newY, newScale);
      translateX.value = clamped.x;
      translateY.value = clamped.y;
    })
    .onEnd(() => {
      if (scale.value < 0.3) scale.value = withSpring(0.3);
      else if (scale.value > 4) scale.value = withSpring(4);
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      const starsWidth = starsBounds.maxX - starsBounds.minX;
      const starsHeight = starsBounds.maxY - starsBounds.minY;
      const fitScale =
        starsWidth > 0 && starsHeight > 0
          ? Math.min(width / starsWidth, height / starsHeight, 1)
          : 1;

      const starsCenterX = (starsBounds.minX + starsBounds.maxX) / 2;
      const starsCenterY = (starsBounds.minY + starsBounds.maxY) / 2;

      const initialTranslateX = width / 2 - starsCenterX * fitScale;
      const initialTranslateY = height / 2 - starsCenterY * fitScale;

      const clamped = clampTranslation(
        initialTranslateX,
        initialTranslateY,
        fitScale,
      );

      scale.value = withSpring(fitScale);
      translateX.value = withSpring(clamped.x);
      translateY.value = withSpring(clamped.y);
    });

  const composedGesture = Gesture.Simultaneous(
    panGesture,
    Gesture.Exclusive(pinchGesture, doubleTapGesture),
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  const canvasStyle = useMemo(() => {
    return {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: 'black',
      position: 'absolute' as const,
      left: (width - canvasWidth) / 2,
      top: (height - canvasHeight) / 2,
    };
  }, [canvasWidth, canvasHeight]);

  return (
    <View style={{ flex: 1, backgroundColor: 'black', overflow: 'hidden' }}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[{ width, height }, animatedStyle]}>
          <Canvas style={canvasStyle}>
            {/* background */}
            <Rect
              x={0}
              y={0}
              width={canvasWidth}
              height={canvasHeight}
              color="black"
            />

            {/* Render stars */}
            {stars.map((star, idx) => {
              const color =
                star.type === 'star'
                  ? 'white'
                  : star.type === 'deadStar'
                  ? 'gray'
                  : star.type === 'blackhole'
                  ? 'purple'
                  : 'white';

              return (
                <React.Fragment key={idx}>
                  <Circle
                    cx={star.x}
                    cy={star.y}
                    r={star.radius * 2}
                    color={color}
                    opacity={0.3}
                  >
                    <BlurMask blur={star.radius * 2} style="normal" />
                  </Circle>

                  {/* Main star */}
                  <Circle
                    cx={star.x}
                    cy={star.y}
                    r={star.radius}
                    color={color}
                  />
                </React.Fragment>
              );
            })}

            {/* Render purchased planets */}
            {purchasedPlanetsWithImages.map((planet, idx) => {
              const x = 1000 + idx * 400;
              const y = 800 + idx * 400;
              const size = 150;

              return (
                <SkiaImage
                  key={planet.id}
                  image={planet.skiaImage}
                  x={x}
                  y={y}
                  width={size}
                  height={size}
                  fit="contain"
                />
              );
            })}
          </Canvas>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

export default StarCanvas;
