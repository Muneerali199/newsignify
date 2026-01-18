/**
 * Signify - Sign Language Translation App
 * Real-time sign language detection using TensorFlow Lite
 * 
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, LogBox, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator } from './src/navigation';
import { Colors } from './src/theme';

// Ignore specific warnings
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
]);

function App(): React.JSX.Element {
  useEffect(() => {
    // Set navigation bar color on Android
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(Colors.background.primary);
      StatusBar.setBarStyle('light-content');
    }
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor={Colors.background.primary}
          translucent={true}
        />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
});

export default App;
