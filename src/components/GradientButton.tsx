import React from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  StyleProp,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  interpolate,
} from 'react-native-reanimated';
import { Colors, Gradients, Shadows, BorderRadius, Typography, Spacing } from '../theme';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = false,
}) => {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    translateY.value = withSpring(3);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    translateY.value = withSpring(0);
  };

  const animatedStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(scale.value, [0.95, 1], [0.2, 0.5]);
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
      ],
      shadowOpacity,
    };
  });

  const getGradientColors = () => {
    if (disabled) return ['#4A4A6A', '#3A3A5A'];
    switch (variant) {
      case 'primary':
        return Gradients.buttonPrimary;
      case 'secondary':
        return Gradients.buttonSecondary;
      case 'success':
        return Gradients.buttonSuccess;
      case 'danger':
        return Gradients.buttonDanger;
      case 'outline':
      case 'ghost':
        return ['transparent', 'transparent'];
      default:
        return Gradients.buttonPrimary;
    }
  };

  const getGlowColor = () => {
    if (disabled) return 'transparent';
    switch (variant) {
      case 'primary':
        return Colors.primary[500];
      case 'secondary':
        return Colors.secondary[500];
      case 'success':
        return Colors.success;
      case 'danger':
        return Colors.error;
      default:
        return Colors.primary[500];
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: Spacing.sm,
          paddingHorizontal: Spacing.base,
          fontSize: Typography.fontSize.sm,
        };
      case 'large':
        return {
          paddingVertical: Spacing.lg,
          paddingHorizontal: Spacing['2xl'],
          fontSize: Typography.fontSize.lg,
        };
      default:
        return {
          paddingVertical: Spacing.md,
          paddingHorizontal: Spacing.xl,
          fontSize: Typography.fontSize.base,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.9}
      style={[
        styles.container,
        animatedStyle,
        {
          shadowColor: getGlowColor(),
          width: fullWidth ? '100%' : 'auto',
        },
        style,
      ]}
    >
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          {
            paddingVertical: sizeStyles.paddingVertical,
            paddingHorizontal: sizeStyles.paddingHorizontal,
          },
          isOutline && styles.outline,
          isGhost && styles.ghost,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={Colors.neutral.white} size="small" />
        ) : (
          <>
            {icon && iconPosition === 'left' && icon}
            <Text
              style={[
                styles.text,
                { fontSize: sizeStyles.fontSize },
                (isOutline || isGhost) && styles.outlineText,
                disabled && styles.disabledText,
                textStyle,
              ]}
            >
              {title}
            </Text>
            {icon && iconPosition === 'right' && icon}
          </>
        )}
      </LinearGradient>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    ...Shadows.medium,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 15,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.xl,
    gap: Spacing.sm,
  },
  text: {
    color: Colors.neutral.white,
    fontWeight: '700',
    letterSpacing: Typography.letterSpacing.wide,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary[500],
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  outlineText: {
    color: Colors.primary[400],
  },
  disabledText: {
    color: Colors.neutral.gray500,
  },
});

export default GradientButton;
