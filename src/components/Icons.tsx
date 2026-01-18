import React from 'react';
import Svg, { Path, Circle, G, Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from 'react-native-svg';
import { Colors, Gradients } from '../theme';

interface IconProps {
  size?: number;
  color?: string;
  gradient?: boolean;
}

export const HandIcon: React.FC<IconProps> = ({ size = 24, color = Colors.neutral.white, gradient = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {gradient && (
      <Defs>
        <SvgLinearGradient id="handGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={Colors.primary[500]} />
          <Stop offset="100%" stopColor={Colors.accent.pink} />
        </SvgLinearGradient>
      </Defs>
    )}
    <Path
      d="M6.5 8.5V15C6.5 17.21 8.29 19 10.5 19H13.5C15.71 19 17.5 17.21 17.5 15V8.5"
      stroke={gradient ? "url(#handGrad)" : color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M6.5 8.5V6C6.5 4.9 7.4 4 8.5 4C9.6 4 10.5 4.9 10.5 6V8.5"
      stroke={gradient ? "url(#handGrad)" : color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10.5 7V5C10.5 3.9 11.4 3 12.5 3C13.6 3 14.5 3.9 14.5 5V8.5"
      stroke={gradient ? "url(#handGrad)" : color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14.5 7.5V6C14.5 4.9 15.4 4 16.5 4C17.6 4 18.5 4.9 18.5 6V15"
      stroke={gradient ? "url(#handGrad)" : color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CameraIcon: React.FC<IconProps> = ({ size = 24, color = Colors.neutral.white, gradient = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {gradient && (
      <Defs>
        <SvgLinearGradient id="camGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={Colors.secondary[500]} />
          <Stop offset="100%" stopColor={Colors.accent.blue} />
        </SvgLinearGradient>
      </Defs>
    )}
    <Path
      d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z"
      stroke={gradient ? "url(#camGrad)" : color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle
      cx="12"
      cy="13"
      r="4"
      stroke={gradient ? "url(#camGrad)" : color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const HomeIcon: React.FC<IconProps> = ({ size = 24, color = Colors.neutral.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 22V12H15V22"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const BookIcon: React.FC<IconProps> = ({ size = 24, color = Colors.neutral.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ size = 24, color = Colors.neutral.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
    <Path
      d="M19.4 15C19.2 15.3 19.2 15.7 19.4 16L20.3 17.5C20.5 17.8 20.4 18.2 20.1 18.4L18.4 20.1C18.2 20.4 17.8 20.5 17.5 20.3L16 19.4C15.7 19.2 15.3 19.2 15 19.4L13.5 20.3C13.2 20.5 12.9 20.5 12.7 20.3L12 19.6C11.7 19.3 11.3 19.1 10.9 19.2L9 19.5C8.6 19.6 8.2 19.4 8 19.1L7.3 17.5C7.1 17.1 6.7 16.9 6.3 16.9H4.5C4.2 16.9 4 16.6 4 16.4V14.3C4 14 4.1 13.7 4.3 13.5L5.2 12.5C5.4 12.2 5.4 11.8 5.2 11.5L4.3 10.5C4.1 10.3 4 10 4 9.7V7.6C4 7.4 4.2 7.1 4.5 7.1H6.3C6.7 7.1 7.1 6.9 7.3 6.5L8 4.9C8.2 4.6 8.6 4.4 9 4.5L10.9 4.8C11.3 4.9 11.7 4.7 12 4.4L12.7 3.7C12.9 3.5 13.2 3.5 13.5 3.7L15 4.6C15.3 4.8 15.7 4.8 16 4.6L17.5 3.7C17.8 3.5 18.2 3.6 18.4 3.9L20.1 5.6C20.4 5.8 20.5 6.2 20.3 6.5L19.4 8C19.2 8.3 19.2 8.7 19.4 9L20.3 10.5C20.5 10.8 20.5 11.2 20.3 11.5L19.4 13C19.2 13.3 19 13.7 19.2 14L19.4 15Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const TranslateIcon: React.FC<IconProps> = ({ size = 24, color = Colors.neutral.white, gradient = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {gradient && (
      <Defs>
        <SvgLinearGradient id="transGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={Colors.accent.green} />
          <Stop offset="100%" stopColor={Colors.secondary[500]} />
        </SvgLinearGradient>
      </Defs>
    )}
    <Path
      d="M5 8L10 3M5 8H10M5 8V3H10V8"
      stroke={gradient ? "url(#transGrad)" : color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2 12H7L5 16L7 20H2"
      stroke={gradient ? "url(#transGrad)" : color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14 4L19 21M14 4L9 21M14 4H19M11 12H22"
      stroke={gradient ? "url(#transGrad)" : color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const MicIcon: React.FC<IconProps> = ({ size = 24, color = Colors.neutral.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 1C11.2044 1 10.4413 1.31607 9.87868 1.87868C9.31607 2.44129 9 3.20435 9 4V12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12V4C15 3.20435 14.6839 2.44129 14.1213 1.87868C13.5587 1.31607 12.7956 1 12 1Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M19 10V12C19 13.8565 18.2625 15.637 16.9497 16.9497C15.637 18.2625 13.8565 19 12 19C10.1435 19 8.36301 18.2625 7.05025 16.9497C5.7375 15.637 5 13.8565 5 12V10"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M12 19V23" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M8 23H16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const WaveIcon: React.FC<IconProps> = ({ size = 24, color = Colors.neutral.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2 12H4C5.1 12 6 11.1 6 10V8C6 6.9 6.9 6 8 6C9.1 6 10 6.9 10 8V16C10 17.1 10.9 18 12 18C13.1 18 14 17.1 14 16V8C14 6.9 14.9 6 16 6C17.1 6 18 6.9 18 8V10C18 11.1 18.9 12 20 12H22"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const PlayIcon: React.FC<IconProps> = ({ size = 24, color = Colors.neutral.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 3L19 12L5 21V3Z"
      fill={color}
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const PauseIcon: React.FC<IconProps> = ({ size = 24, color = Colors.neutral.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="6" y="4" width="4" height="16" rx="1" fill={color} />
    <Rect x="14" y="4" width="4" height="16" rx="1" fill={color} />
  </Svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({ size = 24, color = Colors.neutral.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18L15 12L9 6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CheckIcon: React.FC<IconProps> = ({ size = 24, color = Colors.success }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6L9 17L4 12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CloseIcon: React.FC<IconProps> = ({ size = 24, color = Colors.neutral.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6L18 18"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const StarIcon: React.FC<IconProps & { filled?: boolean }> = ({ size = 24, color = Colors.accent.gold, filled = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : "none"}>
    <Path
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const HistoryIcon: React.FC<IconProps> = ({ size = 24, color = Colors.neutral.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 8V12L15 15"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
    <Path
      d="M3.05 11A9 9 0 0 1 12 3"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);
