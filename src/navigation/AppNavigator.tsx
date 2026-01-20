import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  HomeScreen,
  CameraScreen,
  ExpoCameraScreen,
  LearnScreen,
  SettingsScreen,
} from '../screens';
import {
  HomeIcon,
  CameraIcon,
  BookIcon,
  SettingsIcon,
} from '../components';
import {
  Colors,
  Gradients,
  Shadows,
  BorderRadius,
  Spacing,
} from '../theme';

const { width } = Dimensions.get('window');

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Custom Tab Bar Button with animation
interface TabButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  accessibilityState: { selected: boolean };
  isCenter?: boolean;
}

const TabButton: React.FC<TabButtonProps> = ({
  children,
  onPress,
  accessibilityState,
  isCenter = false,
}) => {
  const focused = accessibilityState.selected;
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
    translateY.value = withSpring(isCenter ? -2 : 2);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    translateY.value = withSpring(0);
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  if (isCenter) {
    return (
      <Animated.View style={[styles.centerButtonContainer, animatedStyle]}>
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
          style={styles.centerButton}
        >
          <LinearGradient
            colors={Gradients.buttonPrimary}
            style={styles.centerGradient}
          >
            {children}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.tabButton, animatedStyle]}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
        style={styles.tabButtonInner}
      >
        {children}
        {focused && <View style={styles.activeIndicator} />}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Custom Tab Bar
const CustomTabBar: React.FC<any> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={['rgba(30,30,63,0.95)', 'rgba(18,18,42,0.98)']}
        style={styles.tabBarGradient}
      >
        <View style={styles.tabBarContent}>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const isCenter = route.name === 'Camera';

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const getIcon = () => {
              const color = isFocused
                ? isCenter
                  ? Colors.neutral.white
                  : Colors.primary[400]
                : Colors.neutral.gray500;
              const size = isCenter ? 28 : 24;

              switch (route.name) {
                case 'Home':
                  return <HomeIcon size={size} color={color} />;
                case 'Camera':
                  return <CameraIcon size={size} color={color} />;
                case 'Learn':
                  return <BookIcon size={size} color={color} />;
                case 'Settings':
                  return <SettingsIcon size={size} color={color} />;
                default:
                  return null;
              }
            };

            return (
              <TabButton
                key={route.key}
                onPress={onPress}
                accessibilityState={{ selected: isFocused }}
                isCenter={isCenter}
              >
                {getIcon()}
              </TabButton>
            );
          })}
        </View>
      </LinearGradient>
    </View>
  );
};

// Tab Navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Learn" component={LearnScreen} />
      <Tab.Screen name="Camera" component={CameraScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

// Custom Navigation Theme
const NavigationTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary[500],
    background: Colors.background.primary,
    card: Colors.background.card,
    text: Colors.neutral.white,
    border: Colors.glass.border,
    notification: Colors.accent.pink,
  },
};

// Main App Navigator
const AppNavigator = () => {
  return (
    <NavigationContainer theme={NavigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
          contentStyle: { backgroundColor: Colors.background.primary },
        }}
      >
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen
          name="CameraFull"
          component={CameraScreen}
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="ExpoCamera"
          component={ExpoCameraScreen}
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBarGradient: {
    marginHorizontal: Spacing.base,
    marginBottom: Platform.OS === 'ios' ? 0 : Spacing.base,
    borderRadius: BorderRadius['3xl'],
    borderWidth: 1,
    borderColor: Colors.glass.border,
    ...Shadows.large,
  },
  tabBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
  },
  tabButtonInner: {
    alignItems: 'center',
    padding: Spacing.sm,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary[400],
  },
  centerButtonContainer: {
    marginTop: -30,
  },
  centerButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    ...Shadows.glowPurple,
    shadowOpacity: 0.6,
  },
  centerGradient: {
    flex: 1,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.background.secondary,
  },
});

export default AppNavigator;
