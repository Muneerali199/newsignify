import tensorflow as tf
import numpy as np
import json
from typing import Tuple, Dict, Any

class TensorFlowLiteConverter:
    def __init__(self):
        self.interpreter = None
        self.input_details = None
        self.output_details = None
        
    def convert_model_to_tflite(self, model_path: str, output_path: str = 'model.tflite') -> bool:
        """Convert Keras model to TensorFlow Lite"""
        try:
            # Load the Keras model
            print(f"Loading model from {model_path}...")
            model = tf.keras.models.load_model(model_path)
            
            # Convert to TFLite
            print("Converting to TensorFlow Lite...")
            converter = tf.lite.TFLiteConverter.from_keras_model(model)
            
            # Optimize for mobile devices
            converter.optimizations = [tf.lite.Optimize.DEFAULT]
            converter.target_spec.supported_types = [tf.float16]
            
            # Convert
            tflite_model = converter.convert()
            
            # Save the TFLite model
            with open(output_path, 'wb') as f:
                f.write(tflite_model)
            
            print(f"Model converted and saved to {output_path}")
            return True
            
        except Exception as e:
            print(f"Error converting model: {e}")
            return False
    
    def load_tflite_model(self, model_path: str) -> bool:
        """Load TensorFlow Lite model"""
        try:
            self.interpreter = tf.lite.Interpreter(model_path=model_path)
            self.interpreter.allocate_tensors()
            
            self.input_details = self.interpreter.get_input_details()
            self.output_details = self.interpreter.get_output_details()
            
            print(f"TFLite model loaded from {model_path}")
            print(f"Input shape: {self.input_details[0]['shape']}")
            print(f"Output shape: {self.output_details[0]['shape']}")
            return True
            
        except Exception as e:
            print(f"Error loading TFLite model: {e}")
            return False
    
    def predict(self, input_data: np.ndarray) -> Tuple[np.ndarray, float]:
        """Make prediction using TFLite model"""
        if self.interpreter is None:
            raise ValueError("No TFLite model loaded")
        
        # Ensure input data has correct shape
        expected_shape = self.input_details[0]['shape']
        if input_data.shape != tuple(expected_shape):
            print(f"Reshaping input from {input_data.shape} to {expected_shape}")
            input_data = input_data.reshape(expected_shape)
        
        # Set input tensor
        self.interpreter.set_tensor(self.input_details[0]['index'], input_data.astype(np.float32))
        
        # Run inference
        self.interpreter.invoke()
        
        # Get output
        output_data = self.interpreter.get_tensor(self.output_details[0]['index'])
        
        # Get prediction and confidence
        predicted_class = np.argmax(output_data[0])
        confidence = float(output_data[0][predicted_class])
        
        return output_data, confidence
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the loaded model"""
        if self.interpreter is None:
            return {"error": "No model loaded"}
        
        return {
            "input_shape": self.input_details[0]['shape'].tolist(),
            "output_shape": self.output_details[0]['shape'].tolist(),
            "input_dtype": str(self.input_details[0]['dtype']),
            "output_dtype": str(self.output_details[0]['dtype']),
            "num_inputs": len(self.input_details),
            "num_outputs": len(self.output_details)
        }

def main():
    """Main conversion function"""
    print("TensorFlow Lite Model Converter")
    print("=" * 40)
    
    converter = TensorFlowLiteConverter()
    
    # Convert model
    success = converter.convert_model_to_tflite('best_model2.keras', 'model.tflite')
    
    if success:
        # Test loading
        if converter.load_tflite_model('model.tflite'):
            # Get model info
            info = converter.get_model_info()
            print(f"\nModel Information:")
            for key, value in info.items():
                print(f"  {key}: {value}")
            
            # Test prediction
            print("\nTesting model...")
            # Create dummy input
            dummy_input = np.random.randn(1, 30, 63).astype(np.float32)  # 30 frames, 21 landmarks * 3 coords
            output, confidence = converter.predict(dummy_input)
            print(f"Prediction shape: {output.shape}")
            print(f"Confidence: {confidence:.4f}")
    else:
        print("Model conversion failed!")

if __name__ == "__main__":
    main()