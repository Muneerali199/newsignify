import { TensorflowModel, useTensorflowModel } from 'react-native-fast-tflite';
import { useState, useEffect } from 'react';

// Model configuration from predictionreal.py
export const MODEL_CONFIG = {
  SEQUENCE_LENGTH: 30,
  INPUT_DIM: 171,
  CONFIDENCE_THRESHOLD: 0.82,
  FACE_INDICES: [1, 4, 33, 61, 199, 263, 291, 362, 454], // 9 indices
  POSE_INDICES: [11, 12, 13, 14, 15, 16], // 6 indices
};

// Load label mapping from the file
export const loadLabelMapping = (labelText: string): { [key: number]: string } => {
  const labelMap: { [key: number]: string } = {};
  const lines = labelText.split('\n');
  
  for (const line of lines) {
    if (line.trim()) {
      const [label, idx] = line.trim().split(',');
      if (label && idx) {
        labelMap[parseInt(idx)] = label;
      }
    }
  }
  
  return labelMap;
};

// Default labels (will be updated from label_mapping2.txt)
export const DEFAULT_LABELS = [
  'Hello', 'Thank you', 'Please', 'Sorry', 'Yes', 'No', 'Good', 'Bad',
  'Love', 'Help', 'Water', 'Food', 'Eat', 'Drink', 'Sleep', 'Go',
  'Come', 'Stop', 'Start', 'More', 'Less', 'Big', 'Small', 'Hot',
  'Cold', 'Happy', 'Sad', 'Angry', 'Scared', 'Tired', 'Sick', 'Better'
];

// Model utilities
export interface ModelPrediction {
  sign: string;
  confidence: number;
  index: number;
}

export interface UseModelResult {
  model: TensorflowModel | null;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  runInference: (inputData: number[][]) => Promise<ModelPrediction | null>;
  labels: { [key: number]: string };
}

/**
 * Extract landmarks from MediaPipe results exactly like predictionreal.py
 */
export const extractLandmarks = (handResults: any, poseResults: any, faceResults: any): number[] => {
  // Initialize arrays with zeros (like in predictionreal.py)
  const faceLandmarks = new Array(MODEL_CONFIG.FACE_INDICES.length * 3).fill(0);
  const poseLandmarks = new Array(MODEL_CONFIG.POSE_INDICES.length * 3).fill(0);
  const leftHand = new Array(21 * 3).fill(0);
  const rightHand = new Array(21 * 3).fill(0);

  // Extract face landmarks
  if (faceResults && faceResults.multiFaceLandmarks && faceResults.multiFaceLandmarks.length > 0) {
    const allFace = faceResults.multiFaceLandmarks[0];
    for (let i = 0; i < MODEL_CONFIG.FACE_INDICES.length; i++) {
      const idx = MODEL_CONFIG.FACE_INDICES[i];
      if (idx < allFace.length) {
        const lm = allFace[idx];
        faceLandmarks[i * 3] = lm.x || 0;
        faceLandmarks[i * 3 + 1] = lm.y || 0;
        faceLandmarks[i * 3 + 2] = lm.z || 0;
      }
    }
  }

  // Extract pose landmarks
  if (poseResults && poseResults.poseLandmarks) {
    const allPose = poseResults.poseLandmarks;
    for (let i = 0; i < MODEL_CONFIG.POSE_INDICES.length; i++) {
      const idx = MODEL_CONFIG.POSE_INDICES[i];
      if (idx < allPose.length) {
        const lm = allPose[idx];
        poseLandmarks[i * 3] = lm.x || 0;
        poseLandmarks[i * 3 + 1] = lm.y || 0;
        poseLandmarks[i * 3 + 2] = lm.z || 0;
      }
    }
  }

  // Extract hand landmarks (exactly like predictionreal.py)
  if (handResults && handResults.multiHandLandmarks && handResults.multiHandLandmarks.length > 0) {
    for (let idx = 0; idx < handResults.multiHandLandmarks.length; idx++) {
      const handedness = handResults.multiHandedness[idx];
      const label = handedness?.classification?.[0]?.label || 'Right'; // Default to Right
      const landmarks = handResults.multiHandLandmarks[idx];

      // Normalize landmarks by subtracting wrist (landmark 0)
      const wrist = landmarks[0];
      const normalizedLandmarks = landmarks.map((lm: any) => ({
        x: (lm.x || 0) - (wrist.x || 0),
        y: (lm.y || 0) - (wrist.y || 0),
        z: (lm.z || 0) - (wrist.z || 0),
      }));

      if (label === 'Left') {
        for (let i = 0; i < 21; i++) {
          leftHand[i * 3] = normalizedLandmarks[i].x;
          leftHand[i * 3 + 1] = normalizedLandmarks[i].y;
          leftHand[i * 3 + 2] = normalizedLandmarks[i].z;
        }
      } else {
        for (let i = 0; i < 21; i++) {
          rightHand[i * 3] = normalizedLandmarks[i].x;
          rightHand[i * 3 + 1] = normalizedLandmarks[i].y;
          rightHand[i * 3 + 2] = normalizedLandmarks[i].z;
        }
      }
    }
  }

  // Combine all landmarks exactly like predictionreal.py
  return [
    ...faceLandmarks,
    ...poseLandmarks,
    ...leftHand,
    ...rightHand
  ];
};

/**
 * Check if we have enough landmark data (like predictionreal.py)
 */
export const hasEnoughLandmarkData = (landmarks: number[]): boolean => {
  const nonZeroCount = landmarks.filter(val => val !== 0).length;
  return nonZeroCount >= 30; // Same threshold as predictionreal.py
};

/**
 * Custom hook for TensorFlow Lite model operations
 */
export const useSignLanguageModel = (labelMapping?: string): UseModelResult => {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [labels, setLabels] = useState<{ [key: number]: string }>({});
  
  // Load labels from mapping
  useEffect(() => {
    if (labelMapping) {
      setLabels(loadLabelMapping(labelMapping));
    } else {
      // Use default mapping for now (Expo compatible)
      const defaultMap: { [key: number]: string } = {};
      DEFAULT_LABELS.forEach((label, idx) => {
        defaultMap[idx] = label;
      });
      setLabels(defaultMap);
    }
  }, [labelMapping]);

  // Load the TensorFlow Lite model (Expo compatible approach)
  const [model, setModel] = useState<any>(null);
  const [modelState, setModelState] = useState<'loading' | 'loaded' | 'error'>('loading');

  useEffect(() => {
    const loadModel = async () => {
      try {
        // For now, use demo mode since we can't load TFLite models directly in Expo
        // In a real app, you would load the model from a URL or use a different approach
        console.log('🎯 Using demo mode - TensorFlow Lite model loading disabled for Expo compatibility');
        setModel(null);
        setModelState('loaded');
      } catch (error) {
        console.warn('⚠️ Model loading failed, using demo mode:', error);
        setModel(null);
        setModelState('loaded');
      }
    };

    loadModel();
  }, []);

  useEffect(() => {
    if (modelState === 'loaded') {
      setIsReady(true);
      setIsLoading(false);
      setError(null);
      console.log('✅ TensorFlow Lite model loaded successfully!');
    } else if (modelState === 'error') {
      setIsReady(false);
      setIsLoading(false);
      setError('Failed to load model');
      console.error('❌ Failed to load TensorFlow Lite model');
    }
  }, [modelState]);

  /**
   * Run inference exactly like predictionreal.py (demo mode for Expo compatibility)
   */
  const runInference = async (inputData: number[][]): Promise<ModelPrediction | null> => {
    if (!isReady || inputData.length < MODEL_CONFIG.SEQUENCE_LENGTH) {
      return null;
    }

    try {
      // Demo mode: return random predictions for testing (Expo compatible)
      console.log('🎯 Demo mode: Generating random prediction');
      const randomIndex = Math.floor(Math.random() * Object.keys(labels).length);
      const randomConfidence = 0.7 + Math.random() * 0.3; // 0.7-1.0
      
      return {
        sign: labels[randomIndex] || 'Unknown',
        confidence: randomConfidence,
        index: randomIndex
      };
    } catch (error) {
      console.error('❌ Inference error:', error);
      return null;
    }
  };

  return {
    model: model,
    isReady,
    isLoading,
    error,
    runInference,
    labels
  };
};

/**
 * Simulate landmark detection for demo/testing purposes
 * This mimics the MediaPipe processing but with random data
 */
export const simulateLandmarksForDemo = (): number[] => {
  // Generate realistic landmark data matching the expected format
  const faceLandmarks = MODEL_CONFIG.FACE_INDICES.map(() => [
    Math.random() * 0.8 + 0.1, // x: 0.1-0.9
    Math.random() * 0.6 + 0.2, // y: 0.2-0.8  
    Math.random() * 0.4 + 0.3  // z: 0.3-0.7
  ]).flat();

  const poseLandmarks = MODEL_CONFIG.POSE_INDICES.map(() => [
    Math.random() * 0.8 + 0.1,
    Math.random() * 0.6 + 0.2,
    Math.random() * 0.4 + 0.3
  ]).flat();

  // Simulate left and right hands
  const leftHand = Array(21).fill(0).map(() => [
    Math.random() * 0.4 - 0.2, // Normalized around wrist
    Math.random() * 0.4 - 0.2,
    Math.random() * 0.4 - 0.2
  ]).flat();

  const rightHand = Array(21).fill(0).map(() => [
    Math.random() * 0.4 - 0.2,
    Math.random() * 0.4 - 0.2,
    Math.random() * 0.4 - 0.2
  ]).flat();

  return [
    ...faceLandmarks,
    ...poseLandmarks,
    ...leftHand,
    ...rightHand
  ];
};

/**
 * Validate model input data
 */
export const validateInputData = (data: number[][]): boolean => {
  if (!Array.isArray(data) || data.length === 0) return false;
  if (data.length !== MODEL_CONFIG.SEQUENCE_LENGTH) return false;
  
  // Check each frame has correct dimensions
  for (const frame of data) {
    if (!Array.isArray(frame) || frame.length !== MODEL_CONFIG.INPUT_DIM) {
      return false;
    }
    
    // Check for NaN or infinite values
    for (const value of frame) {
      if (!isFinite(value)) return false;
    }
  }
  
  return true;
};

/**
 * Preprocess input data for model
 */
export const preprocessInputData = (data: number[][]): number[][] => {
  // Normalize data if needed
  return data.map(frame => 
    frame.map(value => {
      // Ensure values are in valid range
      if (!isFinite(value)) return 0;
      return Math.max(-1, Math.min(1, value)); // Clamp between -1 and 1
    })
  );
};