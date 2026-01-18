import React, { useEffect } from 'react';
import {
  Text,
  StyleSheet,
  TextStyle,
  StyleProp,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  interpolate,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
  SlideInRight,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { Colors, Typography, Gradients } from '../theme';

interface AnimatedTextProps {
  children: string;
  style?: StyleProp<TextStyle>;
  variant?: 'title' | 'subtitle' | 'body' | 'caption' | 'display';
  animation?: 'fadeIn' | 'slideUp' | 'slideDown' | 'zoom' | 'slideRight' | 'pulse' | 'glow';
  gradient?: boolean;
  gradientColors?: string[];
  delay?: number;
  duration?: number;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({
  children,
  style,
  variant = 'body',
  animation = 'fadeIn',
  gradient = false,
  gradientColors = Gradients.cosmic,
  delay = 0,
  duration = 500,
}) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    if (animation === 'pulse') {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
    }
    if (animation === 'glow') {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [animation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    textShadowColor: gradientColors[0],
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: interpolate(glowOpacity.value, [0.3, 0.8], [5, 20]),
  }));

  const getVariantStyle = (): TextStyle => {
    switch (variant) {
      case 'display':
        return {
          fontSize: Typography.fontSize['5xl'],
          fontWeight: '800',
          letterSpacing: Typography.letterSpacing.tight,
        };
      case 'title':
        return {
          fontSize: Typography.fontSize['3xl'],
          fontWeight: '700',
          letterSpacing: Typography.letterSpacing.tight,
        };
      case 'subtitle':
        return {
          fontSize: Typography.fontSize.xl,
          fontWeight: '600',
        };
      case 'body':
        return {
          fontSize: Typography.fontSize.base,
          fontWeight: '400',
        };
      case 'caption':
        return {
          fontSize: Typography.fontSize.sm,
          fontWeight: '400',
          color: Colors.neutral.gray400,
        };
      default:
        return {};
    }
  };

  const getEnteringAnimation = () => {
    switch (animation) {
      case 'fadeIn':
        return FadeIn.delay(delay).duration(duration);
      case 'slideUp':
        return FadeInUp.delay(delay).duration(duration).springify();
      case 'slideDown':
        return FadeInDown.delay(delay).duration(duration).springify();
      case 'zoom':
        return ZoomIn.delay(delay).duration(duration).springify();
      case 'slideRight':
        return SlideInRight.delay(delay).duration(duration).springify();
      default:
        return FadeIn.delay(delay).duration(duration);
    }
  };

  const textContent = (
    <Animated.Text
      entering={getEnteringAnimation()}
      style={[
        styles.base,
        getVariantStyle(),
        animatedStyle,
        animation === 'glow' && glowStyle,
        style,
      ]}
    >
      {children}
    </Animated.Text>
  );

  if (gradient) {
    return (
      <Animated.View entering={getEnteringAnimation()}>
        <MaskedView
          maskElement={
            <Text style={[styles.base, getVariantStyle(), style]}>
              {children}
            </Text>
          }
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={[styles.base, getVariantStyle(), style, { opacity: 0 }]}>
              {children}
            </Text>
          </LinearGradient>
        </MaskedView>
      </Animated.View>
    );
  }

  return textContent;
};

const styles = StyleSheet.create({
  base: {
    color: Colors.neutral.white,
  },
});

export default AnimatedText;
