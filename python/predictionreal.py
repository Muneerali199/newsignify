# Original prediction script from predictionreal.py
# This script demonstrates the hand landmark detection and prediction pipeline

import mediapipe as mp
import cv2
import numpy as np
from tensorflow.keras.models import load_model
import json

class SignLanguagePredictor:
    def __init__(self, model_path='best_model2.keras', label_path='label_encoder.json'):
        # Initialize MediaPipe
        self.mp_hands = mp.solutions.hands
        self.mp_drawing = mp.solutions.drawing_utils
        
        # Load model and label encoder
        self.model = load_model(model_path)
        with open(label_path, 'r') as f:
            self.label_classes = json.load(f)
        
        # Initialize hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=2,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5
        )
        
        # Frame buffer for sequence
        self.frame_buffer = []
        self.sequence_length = 30
        
    def extract_landmarks(self, image):
        """Extract hand landmarks from image"""
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = self.hands.process(image_rgb)
        
        if results.multi_hand_landmarks:
            # Get first hand
            hand_landmarks = results.multi_hand_landmarks[0]
            
            # Extract coordinates
            landmarks = []
            for landmark in hand_landmarks.landmark:
                landmarks.extend([landmark.x, landmark.y, landmark.z])
            
            return np.array(landmarks), hand_landmarks
        
        return None, None
    
    def preprocess_landmarks(self, landmarks):
        """Preprocess landmarks for model input"""
        # Reshape to expected format
        landmarks = landmarks.reshape(1, -1, 63)  # 21 landmarks * 3 coordinates
        return landmarks
    
    def predict_sign(self, landmarks):
        """Predict sign language from landmarks"""
        if landmarks is None:
            return None, 0.0
        
        # Preprocess
        processed_landmarks = self.preprocess_landmarks(landmarks)
        
        # Make prediction
        predictions = self.model.predict(processed_landmarks, verbose=0)
        predicted_class = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class])
        
        # Get sign name
        sign_name = self.label_classes[predicted_class]
        
        return sign_name, confidence
    
    def process_frame(self, frame):
        """Process a single frame"""
        # Extract landmarks
        landmarks, hand_landmarks = self.extract_landmarks(frame)
        
        if landmarks is not None:
            # Add to frame buffer
            self.frame_buffer.append(landmarks)
            
            # Keep only last N frames
            if len(self.frame_buffer) > self.sequence_length:
                self.frame_buffer.pop(0)
            
            # Predict if we have enough frames
            if len(self.frame_buffer) == self.sequence_length:
                # Stack frames
                sequence = np.array(self.frame_buffer)
                sign, confidence = self.predict_sign(sequence)
                return sign, confidence, hand_landmarks
        
        return None, 0.0, None
    
    def draw_landmarks(self, image, hand_landmarks):
        """Draw landmarks on image"""
        if hand_landmarks:
            self.mp_drawing.draw_landmarks(
                image, hand_landmarks, self.mp_hands.HAND_CONNECTIONS
            )
    
    def run_webcam(self):
        """Run prediction on webcam"""
        cap = cv2.VideoCapture(0)
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # Flip frame horizontally for selfie view
            frame = cv2.flip(frame, 1)
            
            # Process frame
            sign, confidence, hand_landmarks = self.process_frame(frame)
            
            # Draw landmarks
            self.draw_landmarks(frame, hand_landmarks)
            
            # Display prediction
            if sign and confidence > 0.7:
                cv2.putText(frame, f"{sign} ({confidence:.2f})", 
                           (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 
                           1, (0, 255, 0), 2)
            
            # Show frame
            cv2.imshow('Sign Language Detection', frame)
            
            # Break on 'q' key
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        
        cap.release()
        cv2.destroyAllWindows()

def main():
    """Main function"""
    print("Sign Language Detection")
    print("=" * 40)
    print("Press 'q' to quit")
    
    predictor = SignLanguagePredictor()
    predictor.run_webcam()

if __name__ == "__main__":
    main()