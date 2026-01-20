import tensorflow as tf
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import mediapipe as mp
import cv2
import os
import json
from typing import List, Tuple, Dict

class SignLanguageModelTrainer:
    def __init__(self):
        self.model = None
        self.label_encoder = LabelEncoder()
        self.sequence_length = 30
        self.num_landmarks = 21
        self.num_features = 3  # x, y, z coordinates
        
    def create_model(self, num_classes: int) -> tf.keras.Model:
        """Create LSTM model for sign language detection"""
        model = tf.keras.Sequential([
            tf.keras.layers.LSTM(64, return_sequences=True, input_shape=(self.sequence_length, self.num_landmarks * self.num_features)),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.LSTM(128, return_sequences=True),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.LSTM(64, return_sequences=False),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(64, activation='relu'),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(num_classes, activation='softmax')
        ])
        
        model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        return model
    
    def preprocess_data(self, data: np.ndarray) -> np.ndarray:
        """Preprocess landmark data"""
        # Normalize coordinates
        data = data.astype('float32')
        
        # Flatten landmarks for each frame
        if len(data.shape) == 4:  # (samples, frames, landmarks, coordinates)
            data = data.reshape(data.shape[0], data.shape[1], -1)
        
        return data
    
    def generate_synthetic_data(self, num_samples: int = 1000) -> Tuple[np.ndarray, np.ndarray]:
        """Generate synthetic training data for demo purposes"""
        signs = ['Hello', 'Thank You', 'Please', 'Goodbye', 'Yes', 'No', 'Love', 'Help']
        
        X = []
        y = []
        
        for i in range(num_samples):
            sign_class = np.random.choice(len(signs))
            
            # Generate synthetic landmark sequences
            sequence = []
            for frame in range(self.sequence_length):
                # Create realistic hand landmark patterns
                landmarks = []
                for landmark in range(self.num_landmarks):
                    # Base position with some noise
                    base_x = np.random.normal(0.5, 0.1)
                    base_y = np.random.normal(0.5, 0.1)
                    base_z = np.random.normal(0.0, 0.05)
                    
                    # Add sign-specific patterns
                    if signs[sign_class] == 'Hello':
                        base_y += 0.2 * np.sin(frame * 0.2)
                    elif signs[sign_class] == 'Thank You':
                        base_x += 0.1 * np.cos(frame * 0.15)
                    elif signs[sign_class] == 'Love':
                        # Heart shape pattern
                        t = frame * 0.2
                        base_x += 0.1 * np.sin(t) * np.sin(t)
                        base_y += 0.1 * np.cos(t) * np.cos(t)
                    
                    landmarks.extend([base_x, base_y, base_z])
                
                sequence.append(landmarks)
            
            X.append(sequence)
            y.append(sign_class)
        
        X = np.array(X)
        y = np.array(y)
        
        return X, y
    
    def train_model(self, X: np.ndarray, y: np.ndarray, epochs: int = 50, batch_size: int = 32):
        """Train the sign language model"""
        # Preprocess data
        X = self.preprocess_data(X)
        
        # Encode labels
        y_encoded = self.label_encoder.fit_transform(y)
        y_categorical = tf.keras.utils.to_categorical(y_encoded)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_categorical, test_size=0.2, random_state=42
        )
        
        # Create model
        num_classes = len(np.unique(y))
        self.model = self.create_model(num_classes)
        
        # Train model
        print("Training model...")
        history = self.model.fit(
            X_train, y_train,
            validation_data=(X_test, y_test),
            epochs=epochs,
            batch_size=batch_size,
            verbose=1
        )
        
        # Evaluate model
        test_loss, test_accuracy = self.model.evaluate(X_test, y_test, verbose=0)
        print(f"Test accuracy: {test_accuracy:.4f}")
        
        return history
    
    def save_model(self, model_path: str = 'best_model2.keras'):
        """Save the trained model"""
        if self.model:
            self.model.save(model_path)
            print(f"Model saved to {model_path}")
            
            # Save label encoder
            with open('label_encoder.json', 'w') as f:
                json.dump(self.label_encoder.classes_.tolist(), f)
        else:
            print("No model to save. Train a model first.")
    
    def load_model(self, model_path: str = 'best_model2.keras'):
        """Load a trained model"""
        try:
            self.model = tf.keras.models.load_model(model_path)
            
            # Load label encoder
            with open('label_encoder.json', 'r') as f:
                classes = json.load(f)
                self.label_encoder.classes_ = np.array(classes)
            
            print(f"Model loaded from {model_path}")
            return True
        except Exception as e:
            print(f"Error loading model: {e}")
            return False
    
    def predict(self, landmarks: np.ndarray) -> Tuple[str, float]:
        """Make prediction on landmark data"""
        if self.model is None:
            return "No model loaded", 0.0
        
        # Preprocess input
        landmarks = self.preprocess_data(landmarks)
        
        # Make prediction
        predictions = self.model.predict(landmarks, verbose=0)
        predicted_class = np.argmax(predictions[0])
        confidence = predictions[0][predicted_class]
        
        # Get sign name
        sign_name = self.label_encoder.inverse_transform([predicted_class])[0]
        
        return sign_name, float(confidence)

def main():
    """Main training function"""
    print("Sign Language Model Training")
    print("=" * 40)
    
    # Initialize trainer
    trainer = SignLanguageModelTrainer()
    
    # Generate synthetic data for demo
    print("Generating synthetic training data...")
    X, y = trainer.generate_synthetic_data(num_samples=2000)
    
    # Train model
    history = trainer.train_model(X, y, epochs=30, batch_size=32)
    
    # Save model
    trainer.save_model('best_model2.keras')
    
    print("\nTraining completed!")
    print("Model saved as 'best_model2.keras'")
    print("Label encoder saved as 'label_encoder.json'")
    
    # Test prediction
    print("\nTesting model...")
    test_data, _ = trainer.generate_synthetic_data(num_samples=1)
    sign, confidence = trainer.predict(test_data)
    print(f"Predicted: {sign} (confidence: {confidence:.2f})")

if __name__ == "__main__":
    main()