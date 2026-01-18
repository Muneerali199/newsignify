import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Colors, Shadows, BorderRadius, Spacing } from '../theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'light' | 'medium' | 'heavy' | 'dark';
  glowColor?: string;
  animated?: boolean;
  pressable?: boolean;
  onPress?: () => void;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  variant = 'medium',
  glowColor,
  animated = false,
  pressable = false,
  onPress,
}) => {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const handlePressIn = () => {
    if (pressable) {
      scale.value = withSpring(0.97);
      translateY.value = withSpring(2);
    }
  };

  const handlePressOut = () => {
    if (pressable) {
      scale.value = withSpring(1);
      translateY.value = withSpring(0);
      onPress?.();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  const getGradientColors = () => {
    switch (variant) {
      case 'light':
        return ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.08)'];
      case 'medium':
        return ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)'];
      case 'heavy':
        return ['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)'];
      case 'dark':
        return ['rgba(30,30,63,0.9)', 'rgba(37,37,80,0.8)'];
      default:
        return ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)'];
    }
  };

  const glowStyle = glowColor ? {
    shadowColor: glowColor,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  } : {};

  const CardComponent = animated ? AnimatedLinearGradient : LinearGradient;
  const containerStyle = animated ? [styles.container, animatedStyle, glowStyle, style] : [styles.container, glowStyle, style];

  return (
    <Animated.View
      style={containerStyle}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
    >
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.innerBorder}>
          {children}
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    ...Shadows.medium,
  },
  gradient: {
    borderRadius: BorderRadius['2xl'],
    padding: 1,
  },
  innerBorder: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BorderRadius['2xl'] - 1,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.glass.border,
  },
});

export default GlassCard;
