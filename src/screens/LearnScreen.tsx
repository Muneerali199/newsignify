import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeInDown,
  FadeInUp,
  Layout,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  GlassCard,
  GradientButton,
  FloatingOrbs,
  HandIcon,
  BookIcon,
  PlayIcon,
  CheckIcon,
  StarIcon,
  ChevronRightIcon,
} from '../components';
import {
  Colors,
  Gradients,
  Shadows,
  Typography,
  Spacing,
  BorderRadius,
  SignLabels,
} from '../theme';

const { width, height } = Dimensions.get('window');

interface LearnScreenProps {
  navigation: any;
}

interface SignItem {
  id: number;
  phrase: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  completed: boolean;
}

const categories = ['All', 'Greetings', 'Questions', 'Responses', 'Common'];

const signData: SignItem[] = SignLabels.map((phrase, index) => ({
  id: index,
  phrase,
  category: index < 4 ? 'Greetings' : index < 8 ? 'Questions' : index < 12 ? 'Responses' : 'Common',
  difficulty: index < 5 ? 'Easy' : index < 10 ? 'Medium' : 'Hard',
  completed: index < 3, // Demo: first 3 are completed
}));

const CategoryPill: React.FC<{
  label: string;
  isActive: boolean;
  onPress: () => void;
}> = ({ label, isActive, onPress }) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={isActive ? Gradients.buttonPrimary : ['transparent', 'transparent']}
          style={[
            styles.categoryPill,
            !isActive && styles.categoryPillInactive,
          ]}
        >
          <Text
            style={[
              styles.categoryText,
              !isActive && styles.categoryTextInactive,
            ]}
          >
            {label}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const SignCard: React.FC<{
  item: SignItem;
  index: number;
  onPress: () => void;
}> = ({ item, index, onPress }) => {
  const scale = useSharedValue(1);
  const rotateX = useSharedValue(0);

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
    rotateX.value = withSpring(3);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    rotateX.value = withSpring(0);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { perspective: 1000 },
      { rotateX: `${rotateX.value}deg` },
    ],
  }));

  const getDifficultyColor = () => {
    switch (item.difficulty) {
      case 'Easy':
        return Colors.success;
      case 'Medium':
        return Colors.warning;
      case 'Hard':
        return Colors.error;
      default:
        return Colors.neutral.gray500;
    }
  };

  const getGradientColors = () => {
    if (item.completed) {
      return ['rgba(0,217,165,0.2)', 'rgba(0,217,165,0.05)'];
    }
    return ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.03)'];
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
      layout={Layout.springify()}
      style={animatedStyle}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <LinearGradient
          colors={getGradientColors()}
          style={styles.signCard}
        >
          {/* Left side - Number */}
          <View style={styles.signNumber}>
            <LinearGradient
              colors={item.completed ? Gradients.buttonSuccess : Gradients.primary}
              style={styles.signNumberGradient}
            >
              {item.completed ? (
                <CheckIcon size={18} color={Colors.neutral.white} />
              ) : (
                <Text style={styles.signNumberText}>{item.id + 1}</Text>
              )}
            </LinearGradient>
          </View>

          {/* Center - Content */}
          <View style={styles.signContent}>
            <Text style={styles.signPhrase}>{item.phrase}</Text>
            <View style={styles.signMeta}>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor() + '30' }]}>
                <View style={[styles.difficultyDot, { backgroundColor: getDifficultyColor() }]} />
                <Text style={[styles.difficultyText, { color: getDifficultyColor() }]}>
                  {item.difficulty}
                </Text>
              </View>
              <Text style={styles.categoryLabel}>{item.category}</Text>
            </View>
          </View>

          {/* Right side - Action */}
          <View style={styles.signAction}>
            {item.completed ? (
              <View style={styles.completedBadge}>
                <StarIcon size={16} color={Colors.accent.gold} filled />
              </View>
            ) : (
              <View style={styles.playButton}>
                <PlayIcon size={16} color={Colors.accent.blue} />
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const LearnScreen: React.FC<LearnScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSigns = signData.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.phrase.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const completedCount = signData.filter((s) => s.completed).length;
  const progressPercentage = (completedCount / signData.length) * 100;

  const handleSignPress = (item: SignItem) => {
    // Navigate to sign detail/practice screen
    navigation.navigate('Camera');
  };

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
        stickyHeaderIndices={[2]}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={styles.header}
        >
          <BookIcon size={32} color={Colors.accent.blue} />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Learn Signs</Text>
            <Text style={styles.headerSubtitle}>
              Master {SignLabels.length} sign language phrases
            </Text>
          </View>
        </Animated.View>

        {/* Progress Card */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <GlassCard style={styles.progressCard} glowColor={Colors.primary[500]}>
            <View style={styles.progressHeader}>
              <View>
                <Text style={styles.progressTitle}>Your Progress</Text>
                <Text style={styles.progressSubtitle}>
                  {completedCount} of {signData.length} phrases completed
                </Text>
              </View>
              <View style={styles.progressPercentage}>
                <Text style={styles.progressNumber}>{Math.round(progressPercentage)}%</Text>
              </View>
            </View>

            <View style={styles.progressBarContainer}>
              <LinearGradient
                colors={Gradients.aurora}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressBar, { width: `${progressPercentage}%` }]}
              />
            </View>

            <View style={styles.progressStats}>
              <View style={styles.progressStat}>
                <Text style={styles.statNumber}>{signData.filter(s => s.difficulty === 'Easy').length}</Text>
                <Text style={styles.statLabel}>Easy</Text>
              </View>
              <View style={styles.progressStat}>
                <Text style={styles.statNumber}>{signData.filter(s => s.difficulty === 'Medium').length}</Text>
                <Text style={styles.statLabel}>Medium</Text>
              </View>
              <View style={styles.progressStat}>
                <Text style={styles.statNumber}>{signData.filter(s => s.difficulty === 'Hard').length}</Text>
                <Text style={styles.statLabel}>Hard</Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Categories */}
        <Animated.View 
          entering={FadeInDown.delay(300).springify()}
          style={styles.categoriesWrapper}
        >
          <LinearGradient
            colors={[Colors.background.primary, Colors.background.primary + '00']}
            style={styles.categoriesBackground}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {categories.map((category) => (
                <CategoryPill
                  key={category}
                  label={category}
                  isActive={selectedCategory === category}
                  onPress={() => setSelectedCategory(category)}
                />
              ))}
            </ScrollView>
          </LinearGradient>
        </Animated.View>

        {/* Signs List */}
        <View style={styles.signsList}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>
              {selectedCategory === 'All' ? 'All Phrases' : selectedCategory}
            </Text>
            <Text style={styles.listCount}>{filteredSigns.length} signs</Text>
          </View>

          {filteredSigns.map((item, index) => (
            <SignCard
              key={item.id}
              item={item}
              index={index}
              onPress={() => handleSignPress(item)}
            />
          ))}
        </View>

        {/* Practice CTA */}
        <Animated.View entering={FadeInUp.delay(500).springify()}>
          <GlassCard style={styles.ctaCard}>
            <View style={styles.ctaContent}>
              <HandIcon size={40} color={Colors.primary[400]} />
              <View style={styles.ctaText}>
                <Text style={styles.ctaTitle}>Ready to Practice?</Text>
                <Text style={styles.ctaSubtitle}>
                  Use the camera to practice your signs
                </Text>
              </View>
            </View>
            <GradientButton
              title="Start Practice"
              onPress={() => navigation.navigate('Camera')}
              variant="primary"
              fullWidth
              icon={<PlayIcon size={18} color={Colors.neutral.white} />}
            />
          </GlassCard>
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
  progressCard: {
    marginBottom: Spacing.xl,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  progressTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.neutral.white,
  },
  progressSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray400,
    marginTop: Spacing.xs,
  },
  progressPercentage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.glass.medium,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary[500],
  },
  progressNumber: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    color: Colors.primary[400],
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.glass.light,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressStat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.neutral.white,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral.gray400,
    marginTop: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: Typography.letterSpacing.wider,
  },
  categoriesWrapper: {
    marginHorizontal: -Spacing.base,
    marginBottom: Spacing.base,
  },
  categoriesBackground: {
    paddingVertical: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  categoriesContainer: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  categoryPill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  categoryPillInactive: {
    borderWidth: 1,
    borderColor: Colors.glass.border,
  },
  categoryText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: Colors.neutral.white,
  },
  categoryTextInactive: {
    color: Colors.neutral.gray400,
  },
  signsList: {
    marginBottom: Spacing.xl,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
    marginTop: Spacing.sm,
  },
  listTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.neutral.white,
  },
  listCount: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray400,
  },
  signCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glass.border,
  },
  signNumber: {
    marginRight: Spacing.md,
  },
  signNumberGradient: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signNumberText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    color: Colors.neutral.white,
  },
  signContent: {
    flex: 1,
  },
  signPhrase: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    color: Colors.neutral.white,
    marginBottom: Spacing.xs,
  },
  signMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
  },
  difficultyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  difficultyText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
  },
  categoryLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral.gray500,
  },
  signAction: {
    marginLeft: Spacing.md,
  },
  completedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.glass.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.glass.light,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.accent.blue + '50',
  },
  ctaCard: {
    marginBottom: Spacing['2xl'],
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  ctaText: {
    flex: 1,
    marginLeft: Spacing.base,
  },
  ctaTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.neutral.white,
    marginBottom: Spacing.xs,
  },
  ctaSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray400,
  },
});

export default LearnScreen;
