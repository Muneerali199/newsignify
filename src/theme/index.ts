/**
 * Signify App Theme System
 * Modern 3D-inspired design with glassmorphism and gradients
 */

export const Colors = {
  // Primary Palette - Deep Purple to Cyan Gradient
  primary: {
    50: '#F3E5F5',
    100: '#E1BEE7',
    200: '#CE93D8',
    300: '#BA68C8',
    400: '#AB47BC',
    500: '#9C27B0',
    600: '#8E24AA',
    700: '#7B1FA2',
    800: '#6A1B9A',
    900: '#4A148C',
  },
  
  // Secondary Palette - Teal/Cyan
  secondary: {
    50: '#E0F7FA',
    100: '#B2EBF2',
    200: '#80DEEA',
    300: '#4DD0E1',
    400: '#26C6DA',
    500: '#00BCD4',
    600: '#00ACC1',
    700: '#0097A7',
    800: '#00838F',
    900: '#006064',
  },
  
  // Accent Colors
  accent: {
    pink: '#FF6B9D',
    orange: '#FF9F43',
    green: '#00D9A5',
    blue: '#00D4FF',
    purple: '#A855F7',
    gold: '#FFD700',
  },
  
  // Neutrals
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    gray50: '#FAFAFA',
    gray100: '#F5F5F5',
    gray200: '#EEEEEE',
    gray300: '#E0E0E0',
    gray400: '#BDBDBD',
    gray500: '#9E9E9E',
    gray600: '#757575',
    gray700: '#616161',
    gray800: '#424242',
    gray900: '#212121',
  },
  
  // Semantic Colors
  success: '#00D9A5',
  warning: '#FFB800',
  error: '#FF4757',
  info: '#00D4FF',
  
  // Dark Theme Background
  background: {
    primary: '#0A0A1A',
    secondary: '#12122A',
    tertiary: '#1A1A3A',
    card: '#1E1E3F',
    elevated: '#252550',
  },
  
  // Glass Effect Colors
  glass: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.15)',
    heavy: 'rgba(255, 255, 255, 0.2)',
    border: 'rgba(255, 255, 255, 0.18)',
    glow: 'rgba(156, 39, 176, 0.3)',
  },
};

export const Gradients = {
  // Main App Gradient
  primary: ['#667eea', '#764ba2'],
  primaryDark: ['#4A148C', '#7B1FA2', '#9C27B0'],
  
  // Accent Gradients
  sunset: ['#FF6B9D', '#FF9F43'],
  ocean: ['#00D4FF', '#00BCD4', '#0097A7'],
  aurora: ['#00D9A5', '#00BCD4', '#667eea'],
  cosmic: ['#667eea', '#764ba2', '#FF6B9D'],
  neon: ['#A855F7', '#00D4FF'],
  fire: ['#FF4757', '#FF9F43', '#FFD700'],
  
  // Background Gradients
  darkBackground: ['#0A0A1A', '#12122A', '#1A1A3A'],
  cardGradient: ['#1E1E3F', '#252550'],
  
  // Glass Gradients
  glassLight: ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)'],
  glassDark: ['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.1)'],
  
  // Button Gradients
  buttonPrimary: ['#9C27B0', '#E040FB'],
  buttonSecondary: ['#00BCD4', '#00D4FF'],
  buttonSuccess: ['#00D9A5', '#00E5A9'],
  buttonDanger: ['#FF4757', '#FF6B7A'],
};

export const Shadows = {
  // 3D Elevated Shadows
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },
  
  // Glow Effects
  glowPurple: {
    shadowColor: '#9C27B0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  glowCyan: {
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  glowPink: {
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  
  // 3D Card Shadow
  card3D: {
    shadowColor: '#9C27B0',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 20,
  },
};

export const Typography = {
  // Font Families (System fonts with fallbacks)
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },
  
  // Font Sizes
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
    '7xl': 72,
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.1,
    normal: 1.4,
    relaxed: 1.6,
    loose: 2,
  },
  
  // Letter Spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
  '6xl': 80,
};

export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
  full: 9999,
};

export const Animation = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 800,
  },
  easing: {
    easeIn: 'easeIn',
    easeOut: 'easeOut',
    easeInOut: 'easeInOut',
    spring: { damping: 15, stiffness: 150 },
  },
};

// Sign Language Labels from model
export const SignLabels = [
  'Are you Free Today',
  'Can you repeat that please',
  'Congratulations',
  'Help Me Please',
  'I am fine',
  'I love you',
  'Please come Welcome',
  'Talk slower please',
  'Thank You',
  'What Happened',
  'What are you doing',
  'What do you do',
  'how are you',
  'no',
  'yes',
];

export default {
  Colors,
  Gradients,
  Shadows,
  Typography,
  Spacing,
  BorderRadius,
  Animation,
  SignLabels,
};
