import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  FadeInDown,
  FadeInUp,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  GlassCard,
  GradientButton,
  FloatingOrbs,
  HandIcon,
  CameraIcon,
  BookIcon,
  TranslateIcon,
  ChevronRightIcon,
  WaveIcon,
  StarIcon,
} from '../components';
import { Colors, Gradients, Shadows, Typography, Spacing, BorderRadius } from '../theme';

const { width, height } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: any;
}

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string[];
  delay: number;
  onPress: () => void;
}> = ({ icon, title, description, gradient, delay, onPress }) => {
  const scale = useSharedValue(1);
  const rotateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { perspective: 1000 },
      { rotateY: `${rotateY.value}deg` },
    ],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
    rotateY.value = withSpring(5);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    rotateY.value = withSpring(0);
    onPress();
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify()}
      style={[styles.featureCard, animatedStyle]}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.featureGradient}
      >
        <View style={styles.featureIconContainer}>{icon}</View>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
        <View style={styles.featureArrow}>
          <ChevronRightIcon size={20} color={Colors.neutral.white} />
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const StatCard: React.FC<{
  value: string;
  label: string;
  delay: number;
}> = ({ value, label, delay }) => (
  <Animated.View entering={FadeInUp.delay(delay).springify()}>
    <GlassCard style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </GlassCard>
  </Animated.View>
);

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const logoRotate = useSharedValue(0);
  const logoPulse = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);

  useEffect(() => {
    logoRotate.value = withRepeat(
      withSequence(
        withTiming(10, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-10, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    logoPulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 2000 }),
        withTiming(0.4, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${logoRotate.value}deg` },
      { scale: logoPulse.value },
    ],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={Gradients.darkBackground}
        style={StyleSheet.absoluteFill}
      />
      <FloatingOrbs />
      
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
          <View style={styles.logoContainer}>
            <Animated.View style={[styles.logoGlow, glowAnimatedStyle]} />
            <Animated.View style={[styles.logoInner, logoAnimatedStyle]}>
              <LinearGradient
                colors={Gradients.cosmic}
                style={styles.logoGradient}
              >
                <HandIcon size={40} color={Colors.neutral.white} />
              </LinearGradient>
            </Animated.View>
          </View>
          
          <View style={styles.headerText}>
            <Text style={styles.appName}>Signify</Text>
            <Text style={styles.tagline}>Break the silence barrier</Text>
          </View>
        </Animated.View>

        {/* Welcome Card */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <GlassCard style={styles.welcomeCard} glowColor={Colors.primary[500]}>
            <View style={styles.welcomeContent}>
              <View style={styles.welcomeTextContainer}>
                <Text style={styles.welcomeTitle}>Welcome Back!</Text>
                <Text style={styles.welcomeSubtitle}>
                  Ready to translate sign language in real-time?
                </Text>
              </View>
              <View style={styles.welcomeIcon}>
                <WaveIcon size={48} color={Colors.accent.blue} />
              </View>
            </View>
            
            <GradientButton
              title="Start Translating"
              onPress={() => navigation.navigate('Camera')}
              variant="primary"
              size="large"
              fullWidth
              icon={<CameraIcon size={22} color={Colors.neutral.white} />}
            />
            
            <View style={styles.demoModeContainer}>
              <Text style={styles.demoModeText}>Or try with Expo Go:</Text>
              <GradientButton
                title="Expo Camera Mode"
                onPress={() => navigation.navigate('ExpoCamera')}
                variant="secondary"
                size="medium"
                fullWidth
                icon={<CameraIcon size={18} color={Colors.neutral.white} />}
              />
            </View>
          </GlassCard>
        </Animated.View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <StatCard value="15" label="Signs Learned" delay={300} />
          <StatCard value="98%" label="Accuracy" delay={400} />
          <StatCard value="∞" label="Real-time" delay={500} />
        </View>

        {/* Features Grid */}
        <Text style={styles.sectionTitle}>Explore Features</Text>
        
        <View style={styles.featuresGrid}>
          <FeatureCard
            icon={<CameraIcon size={32} color={Colors.neutral.white} gradient />}
            title="Live Detection"
            description="Real-time sign language recognition"
            gradient={['#667eea', '#764ba2']}
            delay={400}
            onPress={() => navigation.navigate('Camera')}
          />
          
          <FeatureCard
            icon={<BookIcon size={32} color={Colors.neutral.white} />}
            title="Learn Signs"
            description="Interactive tutorials for beginners"
            gradient={['#00D4FF', '#0097A7']}
            delay={500}
            onPress={() => navigation.navigate('Learn')}
          />
          
          <FeatureCard
            icon={<TranslateIcon size={32} color={Colors.neutral.white} gradient />}
            title="Translation"
            description="Convert signs to text instantly"
            gradient={['#FF6B9D', '#FF9F43']}
            delay={600}
            onPress={() => navigation.navigate('Camera')}
          />
          
          <FeatureCard
            icon={<StarIcon size={32} color={Colors.neutral.white} filled />}
            title="Favorites"
            description="Quick access to saved phrases"
            gradient={['#00D9A5', '#00BCD4']}
            delay={700}
            onPress={() => navigation.navigate('Learn')}
          />
        </View>

        {/* Supported Signs Preview */}
        <Text style={styles.sectionTitle}>Supported Phrases</Text>
        
        <Animated.View entering={FadeInUp.delay(800).springify()}>
          <GlassCard style={styles.phrasesCard}>
            <View style={styles.phrasesHeader}>
              <Text style={styles.phrasesTitle}>15 Sign Phrases</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Learn')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.phrasesList}>
              {['Thank You', 'I love you', 'Help Me Please', 'How are you'].map((phrase, index) => (
                <View key={phrase} style={styles.phraseItem}>
                  <LinearGradient
                    colors={[Colors.primary[500], Colors.accent.pink]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.phraseNumber}
                  >
                    <Text style={styles.phraseNumberText}>{index + 1}</Text>
                  </LinearGradient>
                  <Text style={styles.phraseText}>{phrase}</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <GradientButton
            title="Practice Mode"
            onPress={() => navigation.navigate('Learn')}
            variant="secondary"
            size="medium"
            style={{ flex: 1, marginRight: Spacing.sm }}
          />
          <GradientButton
            title="Settings"
            onPress={() => navigation.navigate('Settings')}
            variant="outline"
            size="medium"
            style={{ flex: 1, marginLeft: Spacing.sm }}
          />
        </View>
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
    marginBottom: Spacing['2xl'],
  },
  logoContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary[500],
    ...Shadows.glowPurple,
  },
  logoInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    ...Shadows.card3D,
  },
  logoGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: Spacing.base,
    flex: 1,
  },
  appName: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: '800',
    color: Colors.neutral.white,
    letterSpacing: Typography.letterSpacing.tight,
  },
  tagline: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral.gray400,
    marginTop: Spacing.xs,
  },
  welcomeCard: {
    marginBottom: Spacing.xl,
  },
  welcomeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
    color: Colors.neutral.white,
    marginBottom: Spacing.xs,
  },
  welcomeSubtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.neutral.gray400,
    lineHeight: 22,
  },
  welcomeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.glass.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.base,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing['2xl'],
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  statValue: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '800',
    color: Colors.accent.blue,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral.gray400,
    textTransform: 'uppercase',
    letterSpacing: Typography.letterSpacing.wider,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.neutral.white,
    marginBottom: Spacing.base,
    marginTop: Spacing.sm,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  featureCard: {
    width: (width - Spacing.base * 3) / 2,
    marginBottom: Spacing.base,
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    ...Shadows.card3D,
  },
  featureGradient: {
    padding: Spacing.base,
    minHeight: 160,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  featureTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    color: Colors.neutral.white,
    marginBottom: Spacing.xs,
  },
  featureDescription: {
    fontSize: Typography.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18,
  },
  featureArrow: {
    position: 'absolute',
    top: Spacing.base,
    right: Spacing.base,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phrasesCard: {
    marginBottom: Spacing.xl,
  },
  phrasesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  phrasesTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.neutral.white,
  },
  viewAllText: {
    fontSize: Typography.fontSize.md,
    color: Colors.accent.blue,
    fontWeight: '600',
  },
  phrasesList: {
    gap: Spacing.md,
  },
  phraseItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phraseNumber: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  phraseNumberText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.neutral.white,
  },
  phraseText: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral.white,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    marginBottom: Spacing.xl,
  },
  demoModeContainer: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  demoModeText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray400,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
});

export default HomeScreen;
