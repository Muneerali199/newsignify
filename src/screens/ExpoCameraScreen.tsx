import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Camera } from 'expo-camera';

const { width, height } = Dimensions.get('window');

interface ExpoCameraScreenProps {
  navigation: any;
}

const ExpoCameraScreen: React.FC<ExpoCameraScreenProps> = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [currentPrediction, setCurrentPrediction] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(0);

  // Request camera permission
  useEffect(() => {
    const requestPermission = async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
        
        if (status !== 'granted') {
          Alert.alert(
            'Camera Permission Required',
            'This app needs camera permission to detect sign language.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        }
      } catch (error) {
        console.error('Error requesting camera permission:', error);
        setHasPermission(false);
      }
    };
    
    requestPermission();
  }, [navigation]);

  // Simulate sign language detection
  useEffect(() => {
    if (!isDetecting) return;
    
    const interval = setInterval(() => {
      // Demo mode: generate random predictions
      const signs = ['Hello', 'Thank You', 'Please', 'Goodbye', 'Yes', 'No', 'Love', 'Help'];
      const randomSign = signs[Math.floor(Math.random() * signs.length)];
      const randomConfidence = 0.7 + Math.random() * 0.3; // 0.7-1.0
      
      setCurrentPrediction(randomSign);
      setConfidence(randomConfidence);
    }, 1000); // Detect every 1000ms
    
    return () => clearInterval(interval);
  }, [isDetecting]);

  const handleStartDetection = () => {
    setIsDetecting(true);
    setCurrentPrediction('');
    setConfidence(0);
  };

  const handleStopDetection = () => {
    setIsDetecting(false);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No access to camera</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={Camera.Constants.Type.front}>
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.title}>Sign Language Detection</Text>
            <Text style={styles.subtitle}>TensorFlow Lite + Expo</Text>
          </View>

          <View style={styles.predictionContainer}>
            {currentPrediction ? (
              <>
                <Text style={styles.predictionText}>{currentPrediction}</Text>
                <Text style={styles.confidenceText}>
                  Confidence: {(confidence * 100).toFixed(1)}%
                </Text>
              </>
            ) : (
              <Text style={styles.waitingText}>Start detection to begin...</Text>
            )}
          </View>

          <View style={styles.controls}>
            {!isDetecting ? (
              <TouchableOpacity style={styles.startButton} onPress={handleStartDetection}>
                <Text style={styles.buttonText}>Start Detection</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.stopButton} onPress={handleStopDetection}>
                <Text style={styles.buttonText}>Stop Detection</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.buttonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.8,
    marginTop: 5,
  },
  predictionContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 20,
  },
  predictionText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  confidenceText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.9,
  },
  waitingText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.7,
  },
  controls: {
    alignItems: 'center',
    marginBottom: 40,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 10,
  },
  stopButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 10,
  },
  backButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ExpoCameraScreen;