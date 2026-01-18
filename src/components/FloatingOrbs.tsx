import React, { useEffect } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Gradients } from '../theme';

const { width, height } = Dimensions.get('window');

interface OrbProps {
  size: number;
  colors: string[];
  initialX: number;
  initialY: number;
  duration: number;
  delay: number;
  moveRange: number;
}

const Orb: React.FC<OrbProps> = ({
  size,
  colors,
  initialX,
  initialY,
  duration,
  delay,
  moveRange,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(moveRange, { duration, easing: Easing.inOut(Easing.ease) }),
          withTiming(-moveRange, { duration, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    translateY.value = withDelay(
      delay + 500,
      withRepeat(
        withSequence(
          withTiming(-moveRange * 0.7, { duration: duration * 1.2, easing: Easing.inOut(Easing.ease) }),
          withTiming(moveRange * 0.7, { duration: duration * 1.2, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.2, { duration: duration * 0.8 }),
          withTiming(0.9, { duration: duration * 0.8 })
        ),
        -1,
        true
      )
    );

    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.8, { duration: duration }),
          withTiming(0.4, { duration: duration })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.orb,
        animatedStyle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          left: initialX,
          top: initialY,
        },
      ]}
    >
      <LinearGradient
        colors={colors}
        style={[styles.orbGradient, { borderRadius: size / 2 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
    </Animated.View>
  );
};

interface FloatingOrbsProps {
  variant?: 'default' | 'minimal' | 'intense';
}

const FloatingOrbs: React.FC<FloatingOrbsProps> = ({ variant = 'default' }) => {
  const orbs = [
    {
      size: 300,
      colors: ['rgba(156, 39, 176, 0.4)', 'rgba(156, 39, 176, 0.1)'],
      initialX: -50,
      initialY: height * 0.1,
      duration: 8000,
      delay: 0,
      moveRange: 40,
    },
    {
      size: 250,
      colors: ['rgba(0, 212, 255, 0.35)', 'rgba(0, 212, 255, 0.08)'],
      initialX: width * 0.5,
      initialY: height * 0.3,
      duration: 10000,
      delay: 1000,
      moveRange: 50,
    },
    {
      size: 200,
      colors: ['rgba(255, 107, 157, 0.3)', 'rgba(255, 107, 157, 0.05)'],
      initialX: width * 0.7,
      initialY: height * 0.6,
      duration: 7000,
      delay: 2000,
      moveRange: 35,
    },
    {
      size: 180,
      colors: ['rgba(0, 217, 165, 0.3)', 'rgba(0, 217, 165, 0.05)'],
      initialX: -30,
      initialY: height * 0.7,
      duration: 9000,
      delay: 500,
      moveRange: 45,
    },
    {
      size: 150,
      colors: ['rgba(168, 85, 247, 0.35)', 'rgba(168, 85, 247, 0.08)'],
      initialX: width * 0.3,
      initialY: height * 0.85,
      duration: 6000,
      delay: 1500,
      moveRange: 30,
    },
  ];

  const filteredOrbs = variant === 'minimal' 
    ? orbs.slice(0, 3) 
    : variant === 'intense' 
    ? [...orbs, ...orbs.slice(0, 2).map(o => ({ ...o, initialX: o.initialX + 50, initialY: o.initialY + 50 }))]
    : orbs;

  return (
    <View style={styles.container} pointerEvents="none">
      {filteredOrbs.map((orb, index) => (
        <Orb key={index} {...orb} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    shadowColor: '#9C27B0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
  },
  orbGradient: {
    flex: 1,
  },
});

export default FloatingOrbs;
