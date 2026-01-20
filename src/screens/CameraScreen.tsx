import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
  Alert,
  NativeModules,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  SlideInUp,
  interpolate,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {
  GlassCard,
  GradientButton,
  FloatingOrbs,
  CameraIcon,
  CloseIcon,
  HandIcon,
  CheckIcon,
  WaveIcon,
  PlayIcon,
  PauseIcon,
} from '../components';
import {
  Colors,
  Gradients,
  Shadows,
  Typography,
  Spacing,
  BorderRadius,
} from '../theme';
import { 
  useSignLanguageModel, 
  simulateLandmarksForDemo,
  extractLandmarks,
  hasEnoughLandmarkData,
  validateInputData,
  preprocessInputData,
  MODEL_CONFIG
} from '../utils/modelUtils';

const { width, height } = Dimensions.get('window');

interface CameraScreenProps {
  navigation: any;
}

const PulsingRing: React.FC<{ color: string; delay: number }> = ({ color, delay }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 2000, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 0 })
      ),
      -1,
      false
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 2000 }),
        withTiming(0.6, { duration: 0 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.pulsingRing,
        animatedStyle,
        { borderColor: color },
      ]}
    />
  );
};

const DetectionOverlay: React.FC<{
  isDetecting: boolean;
  detectedSign: string | null;
  confidence: number;
}> = ({ isDetecting, detectedSign, confidence }) => {
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);

  useEffect(() => {
    if (detectedSign) {
      pulseScale.value = withSequence(
        withSpring(1.1),
        withSpring(1)
      );
      glowOpacity.value = withSequence(
        withTiming(1),
        withTiming(0.5, { duration: 500 })
      );
    }
  }, [detectedSign]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  if (!isDetecting) return null;

  return (
    <View style={styles.detectionOverlay}>
      {/* Scanning animation */}
      <View style={styles.scannerContainer}>
        <PulsingRing color={Colors.accent.blue} delay={0} />
        <PulsingRing color={Colors.primary[500]} delay={500} />
        <View style={styles.scannerInner}>
          <HandIcon size={40} color={Colors.accent.blue} />
        </View>
      </View>

      {/* Detection result */}
      {detectedSign && (
        <Animated.View
          entering={SlideInUp.springify()}
          style={[styles.detectionResult, containerStyle]}
        >
          <Animated.View style={[styles.resultGlow, glowStyle]} />
          <LinearGradient
            colors={confidence > 0.8 ? Gradients.buttonSuccess : Gradients.buttonSecondary}
            style={styles.resultGradient}
          >
            <View style={styles.resultIconContainer}>
              <CheckIcon size={28} color={Colors.neutral.white} />
            </View>
            <View style={styles.resultTextContainer}>
              <Text style={styles.resultLabel}>Detected Sign</Text>
              <Text style={styles.resultText}>{detectedSign}</Text>
              <View style={styles.confidenceBar}>
                <View
                  style={[
                    styles.confidenceFill,
                    { width: `${confidence * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.confidenceText}>
                {Math.round(confidence * 100)}% confidence
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>
      )}
    </View>
  );
};

// Constants for model (imported from modelUtils)

const CameraScreen: React.FC<CameraScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front');
  const cameraRef = useRef<Camera>(null);
  
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedSign, setDetectedSign] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const frameBufferRef = useRef<number[][]>([]);

  // Load TensorFlow Lite model using custom hook
  const { model, isReady: isModelReady, isLoading, error, runInference } = useSignLanguageModel();

  // Animation values
  const buttonScale = useSharedValue(1);
  const borderRotation = useSharedValue(0);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  useEffect(() => {
    borderRotation.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  // Run inference when we have enough frames
  const performInference = useCallback(async () => {
    if (!isModelReady || !model || frameBufferRef.current.length < MODEL_CONFIG.SEQUENCE_LENGTH) {
      return;
    }

    try {
      // Prepare and validate input data
      const inputData = frameBufferRef.current.slice(-MODEL_CONFIG.SEQUENCE_LENGTH);
      if (!validateInputData(inputData)) {
        console.warn('Invalid input data for inference');
        return;
      }

      // Run inference using the model utility
      const result = await runInference(preprocessInputData(inputData));
      
      if (result) {
        setDetectedSign(result.sign);
        setConfidence(result.confidence);
      } else {
        setDetectedSign(null);
        setConfidence(0);
      }
    } catch (error) {
      console.error('❌ Inference error:', error);
      setDetectedSign(null);
      setConfidence(0);
    }
  }, [isModelReady, model, runInference]);

  // Demo mode: simulate landmark data collection exactly like predictionreal.py
  const processFrame = useCallback(() => {
    if (!isDetecting) return;

    // Generate simulated landmark data that matches predictionreal.py format
    const simulatedLandmarks = simulateLandmarksForDemo();
    
    // Check if we have enough landmark data (like predictionreal.py)
    if (hasEnoughLandmarkData(simulatedLandmarks)) {
      frameBufferRef.current.push(simulatedLandmarks);
      if (frameBufferRef.current.length > MODEL_CONFIG.SEQUENCE_LENGTH) {
        frameBufferRef.current.shift();
      }
    }
    
    setFrameCount(frameBufferRef.current.length);

    // Run inference when buffer is full
    if (frameBufferRef.current.length === MODEL_CONFIG.SEQUENCE_LENGTH) {
      performInference();
    }
  }, [isDetecting, performInference]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isDetecting) {
      interval = setInterval(processFrame, 100); // Process at ~10fps
    }
    return () => clearInterval(interval);
  }, [isDetecting, processFrame]);

  const handleStartDetection = () => {
    frameBufferRef.current = []; // Clear buffer on start
    setFrameCount(0);
    setIsDetecting(true);
    buttonScale.value = withSpring(0.9);
    setTimeout(() => {
      buttonScale.value = withSpring(1);
    }, 150);
  };

  const handleStopDetection = () => {
    setIsDetecting(false);
    setDetectedSign(null);
    setConfidence(0);
    frameBufferRef.current = [];
    setFrameCount(0);
  };

  const borderAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${borderRotation.value}deg` }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <LinearGradient
          colors={Gradients.darkBackground}
          style={StyleSheet.absoluteFill}
        />
        <FloatingOrbs variant="minimal" />
        <GlassCard style={styles.permissionCard}>
          <CameraIcon size={64} color={Colors.primary[500]} />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            We need camera access to detect sign language in real-time.
          </Text>
          <GradientButton
            title="Grant Permission"
            onPress={requestPermission}
            variant="primary"
            size="large"
          />
        </GlassCard>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.permissionContainer}>
        <LinearGradient
          colors={Gradients.darkBackground}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.errorText}>No camera device found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={false}
        video={false}
      />

      {/* Gradient Overlay */}
      <LinearGradient
        colors={['rgba(10,10,26,0.3)', 'transparent', 'rgba(10,10,26,0.8)']}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Animated Border Frame */}
      <View style={styles.frameContainer}>
        <Animated.View style={[styles.animatedBorder, borderAnimatedStyle]}>
          <LinearGradient
            colors={isDetecting ? Gradients.aurora : Gradients.cosmic}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.borderGradient}
          />
        </Animated.View>
        <View style={styles.frameInner}>
          {/* Corner decorations */}
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
      </View>

      {/* Detection Overlay */}
      <DetectionOverlay
        isDetecting={isDetecting}
        detectedSign={detectedSign}
        confidence={confidence}
      />

      {/* Header */}
      <Animated.View
        entering={FadeInDown.delay(100)}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <GlassCard style={styles.backButtonInner}>
            <CloseIcon size={24} color={Colors.neutral.white} />
          </GlassCard>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={[styles.statusDot, isDetecting && styles.statusDotActive, !isModelReady && {backgroundColor: Colors.warning}]} />
          <Text style={styles.statusText}>
            {isLoading 
              ? 'Loading model...' 
              : error 
                ? 'Model Error' 
                : isDetecting 
                  ? `Detecting... (${frameCount}/${MODEL_CONFIG.SEQUENCE_LENGTH})` 
                  : 'Ready'}
          </Text>
        </View>

        <View style={styles.headerRight} />
      </Animated.View>

      {/* Bottom Controls */}
      <Animated.View
        entering={FadeInUp.delay(200)}
        style={[styles.bottomControls, { paddingBottom: insets.bottom + 20 }]}
      >
        <GlassCard style={styles.controlsCard}>
          <View style={styles.controlsRow}>
            {/* Info Button */}
            <TouchableOpacity style={styles.sideButton}>
              <LinearGradient
                colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                style={styles.sideButtonGradient}
              >
                <WaveIcon size={24} color={Colors.neutral.white} />
              </LinearGradient>
            </TouchableOpacity>

            {/* Main Capture Button */}
            <Animated.View style={buttonAnimatedStyle}>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={isDetecting ? handleStopDetection : handleStartDetection}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isDetecting ? Gradients.buttonDanger : Gradients.buttonPrimary}
                  style={styles.captureGradient}
                >
                  <View style={styles.captureInner}>
                    {isDetecting ? (
                      <PauseIcon size={32} color={Colors.neutral.white} />
                    ) : (
                      <PlayIcon size={32} color={Colors.neutral.white} />
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* History Button */}
            <TouchableOpacity
              style={styles.sideButton}
              onPress={() => navigation.navigate('Learn')}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                style={styles.sideButtonGradient}
              >
                <HandIcon size={24} color={Colors.neutral.white} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={styles.instructionText}>
            {isDetecting
              ? 'Show sign language gestures to the camera'
              : 'Tap play to start real-time detection'}
          </Text>
        </GlassCard>
      </Animated.View>

      {/* Detection History */}
      {detectedSign && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={styles.historyContainer}
        >
          <GlassCard style={styles.historyCard} variant="dark">
            <Text style={styles.historyLabel}>Last Detection</Text>
            <Text style={styles.historyText}>{detectedSign}</Text>
          </GlassCard>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  permissionCard: {
    alignItems: 'center',
    padding: Spacing['2xl'],
    maxWidth: 320,
  },
  permissionTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
    color: Colors.neutral.white,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral.gray400,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 24,
  },
  errorText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.error,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    zIndex: 10,
  },
  backButton: {
    width: 48,
    height: 48,
  },
  backButtonInner: {
    padding: Spacing.md,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.neutral.gray500,
    marginRight: Spacing.sm,
  },
  statusDotActive: {
    backgroundColor: Colors.success,
  },
  statusText: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral.white,
    fontWeight: '600',
  },
  headerRight: {
    width: 48,
  },
  frameContainer: {
    position: 'absolute',
    top: height * 0.15,
    left: width * 0.1,
    right: width * 0.1,
    height: height * 0.45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animatedBorder: {
    position: 'absolute',
    width: '110%',
    height: '110%',
    borderRadius: BorderRadius['3xl'],
    padding: 3,
  },
  borderGradient: {
    flex: 1,
    borderRadius: BorderRadius['3xl'],
    opacity: 0.6,
  },
  frameInner: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius['2xl'],
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: Colors.accent.blue,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: BorderRadius.lg,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: BorderRadius.lg,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: BorderRadius.lg,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: BorderRadius.lg,
  },
  detectionOverlay: {
    position: 'absolute',
    top: height * 0.15,
    left: width * 0.1,
    right: width * 0.1,
    height: height * 0.45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  pulsingRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
  },
  scannerInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,212,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detectionResult: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
  },
  resultGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: BorderRadius['2xl'] + 10,
    backgroundColor: Colors.success,
    ...Shadows.glowCyan,
  },
  resultGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    borderRadius: BorderRadius['2xl'],
  },
  resultIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultLabel: {
    fontSize: Typography.fontSize.xs,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: Typography.letterSpacing.wider,
  },
  resultText: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.neutral.white,
    marginVertical: Spacing.xs,
  },
  confidenceBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: Colors.neutral.white,
    borderRadius: 2,
  },
  confidenceText: {
    fontSize: Typography.fontSize.xs,
    color: 'rgba(255,255,255,0.8)',
    marginTop: Spacing.xs,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.base,
  },
  controlsCard: {
    padding: Spacing.lg,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  sideButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  sideButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: Colors.glass.border,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    ...Shadows.card3D,
  },
  captureGradient: {
    flex: 1,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  captureInner: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray400,
    textAlign: 'center',
  },
  historyContainer: {
    position: 'absolute',
    top: height * 0.62,
    left: Spacing.base,
    right: Spacing.base,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  historyLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray400,
    marginRight: Spacing.md,
  },
  historyText: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral.white,
    fontWeight: '600',
  },
});

export default CameraScreen;
