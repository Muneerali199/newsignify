import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Linking,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  GlassCard,
  FloatingOrbs,
  SettingsIcon,
  CameraIcon,
  HandIcon,
  ChevronRightIcon,
  StarIcon,
} from '../components';
import {
  Colors,
  Gradients,
  Typography,
  Spacing,
  BorderRadius,
} from '../theme';

interface SettingsScreenProps {
  navigation: any;
}

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  value?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
  showArrow?: boolean;
  showBadge?: boolean;
  badgeText?: string;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  subtitle,
  value,
  onToggle,
  onPress,
  showArrow = false,
  showBadge = false,
  badgeText,
}) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const content = (
    <Animated.View style={animatedStyle}>
      <View style={styles.settingItem}>
        <View style={styles.settingIcon}>{icon}</View>
        <View style={styles.settingContent}>
          <View style={styles.settingTitleRow}>
            <Text style={styles.settingTitle}>{title}</Text>
            {showBadge && badgeText && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badgeText}</Text>
              </View>
            )}
          </View>
          {subtitle && (
            <Text style={styles.settingSubtitle}>{subtitle}</Text>
          )}
        </View>
        {onToggle && (
          <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{ false: Colors.glass.light, true: Colors.primary[500] + '80' }}
            thumbColor={value ? Colors.primary[400] : Colors.neutral.gray400}
            ios_backgroundColor={Colors.glass.light}
          />
        )}
        {showArrow && (
          <ChevronRightIcon size={20} color={Colors.neutral.gray500} />
        )}
      </View>
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  
  // Settings state
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [autoDetect, setAutoDetect] = useState(false);
  const [highAccuracyMode, setHighAccuracyMode] = useState(true);
  const [saveHistory, setSaveHistory] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={Gradients.darkBackground}
        style={StyleSheet.absoluteFill}
      />
      <FloatingOrbs variant="minimal" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={styles.header}
        >
          <SettingsIcon size={32} color={Colors.accent.blue} />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Settings</Text>
            <Text style={styles.headerSubtitle}>
              Customize your experience
            </Text>
          </View>
        </Animated.View>

        {/* App Info Card */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <GlassCard style={styles.appInfoCard} glowColor={Colors.primary[500]}>
            <View style={styles.appInfoContent}>
              <LinearGradient
                colors={Gradients.cosmic}
                style={styles.appLogo}
              >
                <HandIcon size={32} color={Colors.neutral.white} />
              </LinearGradient>
              <View style={styles.appInfoText}>
                <Text style={styles.appName}>Signify</Text>
                <Text style={styles.appVersion}>Version 1.0.0</Text>
              </View>
            </View>
            <View style={styles.appStats}>
              <View style={styles.appStat}>
                <Text style={styles.appStatNumber}>15</Text>
                <Text style={styles.appStatLabel}>Signs</Text>
              </View>
              <View style={styles.appStatDivider} />
              <View style={styles.appStat}>
                <Text style={styles.appStatNumber}>98%</Text>
                <Text style={styles.appStatLabel}>Accuracy</Text>
              </View>
              <View style={styles.appStatDivider} />
              <View style={styles.appStat}>
                <Text style={styles.appStatNumber}>TFLite</Text>
                <Text style={styles.appStatLabel}>AI Model</Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Detection Settings */}
        <Text style={styles.sectionTitle}>Detection</Text>
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <GlassCard style={styles.settingsCard}>
            <SettingItem
              icon={<CameraIcon size={22} color={Colors.accent.blue} />}
              title="Auto-detect Signs"
              subtitle="Automatically start detection when camera opens"
              value={autoDetect}
              onToggle={setAutoDetect}
            />
            <View style={styles.settingDivider} />
            <SettingItem
              icon={<StarIcon size={22} color={Colors.accent.gold} />}
              title="High Accuracy Mode"
              subtitle="Use more processing power for better results"
              value={highAccuracyMode}
              onToggle={setHighAccuracyMode}
            />
          </GlassCard>
        </Animated.View>

        {/* Preferences */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <GlassCard style={styles.settingsCard}>
            <SettingItem
              icon={
                <View style={styles.iconCircle}>
                  <Text style={styles.iconEmoji}>📳</Text>
                </View>
              }
              title="Haptic Feedback"
              subtitle="Vibrate on detection"
              value={hapticFeedback}
              onToggle={setHapticFeedback}
            />
            <View style={styles.settingDivider} />
            <SettingItem
              icon={
                <View style={styles.iconCircle}>
                  <Text style={styles.iconEmoji}>🔊</Text>
                </View>
              }
              title="Sound Effects"
              subtitle="Play sounds on successful detection"
              value={soundEffects}
              onToggle={setSoundEffects}
            />
            <View style={styles.settingDivider} />
            <SettingItem
              icon={
                <View style={styles.iconCircle}>
                  <Text style={styles.iconEmoji}>📝</Text>
                </View>
              }
              title="Save History"
              subtitle="Keep a record of detected signs"
              value={saveHistory}
              onToggle={setSaveHistory}
            />
            <View style={styles.settingDivider} />
            <SettingItem
              icon={
                <View style={styles.iconCircle}>
                  <Text style={styles.iconEmoji}>🌙</Text>
                </View>
              }
              title="Dark Mode"
              subtitle="Always enabled for best experience"
              value={darkMode}
              onToggle={setDarkMode}
            />
          </GlassCard>
        </Animated.View>

        {/* About */}
        <Text style={styles.sectionTitle}>About</Text>
        <Animated.View entering={FadeInDown.delay(500).springify()}>
          <GlassCard style={styles.settingsCard}>
            <SettingItem
              icon={
                <View style={styles.iconCircle}>
                  <Text style={styles.iconEmoji}>📖</Text>
                </View>
              }
              title="How to Use"
              subtitle="Learn how to use the app"
              onPress={() => navigation.navigate('Learn')}
              showArrow
            />
            <View style={styles.settingDivider} />
            <SettingItem
              icon={
                <View style={styles.iconCircle}>
                  <Text style={styles.iconEmoji}>⭐</Text>
                </View>
              }
              title="Rate App"
              subtitle="Help us improve"
              onPress={() => {}}
              showArrow
            />
            <View style={styles.settingDivider} />
            <SettingItem
              icon={
                <View style={styles.iconCircle}>
                  <Text style={styles.iconEmoji}>📧</Text>
                </View>
              }
              title="Contact Support"
              subtitle="Get help or send feedback"
              onPress={() => Linking.openURL('mailto:support@signify.app')}
              showArrow
            />
            <View style={styles.settingDivider} />
            <SettingItem
              icon={
                <View style={styles.iconCircle}>
                  <Text style={styles.iconEmoji}>📜</Text>
                </View>
              }
              title="Privacy Policy"
              onPress={() => {}}
              showArrow
            />
            <View style={styles.settingDivider} />
            <SettingItem
              icon={
                <View style={styles.iconCircle}>
                  <Text style={styles.iconEmoji}>📋</Text>
                </View>
              }
              title="Terms of Service"
              onPress={() => {}}
              showArrow
            />
          </GlassCard>
        </Animated.View>

        {/* Model Info */}
        <Animated.View entering={FadeInUp.delay(600).springify()}>
          <GlassCard style={styles.modelCard}>
            <Text style={styles.modelTitle}>AI Model Information</Text>
            <View style={styles.modelInfo}>
              <View style={styles.modelRow}>
                <Text style={styles.modelLabel}>Framework</Text>
                <Text style={styles.modelValue}>TensorFlow Lite</Text>
              </View>
              <View style={styles.modelRow}>
                <Text style={styles.modelLabel}>Input Shape</Text>
                <Text style={styles.modelValue}>30 × 171</Text>
              </View>
              <View style={styles.modelRow}>
                <Text style={styles.modelLabel}>Output Classes</Text>
                <Text style={styles.modelValue}>15 signs</Text>
              </View>
              <View style={styles.modelRow}>
                <Text style={styles.modelLabel}>Architecture</Text>
                <Text style={styles.modelValue}>CNN + Bi-LSTM + Attention</Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Footer */}
        <Animated.View entering={FadeInUp.delay(700).springify()}>
          <View style={styles.footer}>
            <Text style={styles.footerText}>Made with 💜 for the deaf community</Text>
            <Text style={styles.footerCopyright}>© 2024 Signify. All rights reserved.</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  headerText: {
    marginLeft: Spacing.base,
  },
  headerTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: '800',
    color: Colors.neutral.white,
    letterSpacing: Typography.letterSpacing.tight,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral.gray400,
    marginTop: Spacing.xs,
  },
  appInfoCard: {
    marginBottom: Spacing.xl,
  },
  appInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  appLogo: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appInfoText: {
    marginLeft: Spacing.base,
  },
  appName: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
    color: Colors.neutral.white,
  },
  appVersion: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray400,
    marginTop: Spacing.xs,
  },
  appStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.glass.border,
  },
  appStat: {
    alignItems: 'center',
  },
  appStatNumber: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.accent.blue,
  },
  appStatLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral.gray400,
    marginTop: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: Typography.letterSpacing.wider,
  },
  appStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.glass.border,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    color: Colors.neutral.white,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  settingsCard: {
    marginBottom: Spacing.lg,
    padding: 0,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
  },
  settingIcon: {
    marginRight: Spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    color: Colors.neutral.white,
  },
  settingSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray400,
    marginTop: 2,
  },
  settingDivider: {
    height: 1,
    backgroundColor: Colors.glass.border,
    marginHorizontal: Spacing.base,
  },
  badge: {
    backgroundColor: Colors.primary[500] + '30',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.sm,
  },
  badgeText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.primary[400],
    fontWeight: '600',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.glass.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 16,
  },
  modelCard: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  modelTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    color: Colors.neutral.white,
    marginBottom: Spacing.base,
  },
  modelInfo: {
    gap: Spacing.md,
  },
  modelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modelLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray400,
  },
  modelValue: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.white,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  footerText: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral.gray400,
    marginBottom: Spacing.sm,
  },
  footerCopyright: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray500,
  },
});

export default SettingsScreen;
