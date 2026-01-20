import tensorflow as tf
import numpy as np
import os

def create_sample_sign_language_model():
    """
    Create a sample sign language detection model for testing.
    This is a simple LSTM-based model that can be replaced with your actual model.
    """
    model = tf.keras.Sequential([
        tf.keras.layers.LSTM(128, return_sequences=True, input_shape=(30, 171)),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.LSTM(64, return_sequences=True),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.LSTM(32),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(200, activation='softmax')  # 200 sign classes
    ])
    
    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def convert_keras_to_tflite(keras_model_path, tflite_model_path):
    """
    Convert a Keras model to TensorFlow Lite format.
    
    Args:
        keras_model_path: Path to the Keras model (.keras or .h5)
        tflite_model_path: Output path for the TFLite model
    """
    try:
        # Load the Keras model
        print(f"📁 Loading Keras model from: {keras_model_path}")
        model = tf.keras.models.load_model(keras_model_path)
        print("✅ Model loaded successfully!")
        
        # Display model info
        print(f"📊 Model input shape: {model.input_shape}")
        print(f"📊 Model output shape: {model.output_shape}")
        print(f"📊 Model parameters: {model.count_params():,}")
        
    except Exception as e:
        print(f"❌ Error loading Keras model: {e}")
        print("🔄 Creating sample model for testing...")
        model = create_sample_sign_language_model()
    
    # Convert to TensorFlow Lite
    print("🔄 Converting to TensorFlow Lite...")
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    
    # Optimization settings
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    converter.target_spec.supported_types = [tf.float32]
    
    # Optional: Add quantization for smaller model size
    # converter.optimizations = [tf.lite.Optimize.DEFAULT]
    # converter.target_spec.supported_types = [tf.float16]
    
    try:
        tflite_model = converter.convert()
        print("✅ Conversion successful!")
        
        # Save the TFLite model
        with open(tflite_model_path, 'wb') as f:
            f.write(tflite_model)
        
        # Get file size
        file_size = os.path.getsize(tflite_model_path) / (1024 * 1024)  # MB
        print(f"📁 Saved TFLite model to: {tflite_model_path}")
        print(f"📊 Model size: {file_size:.2f} MB")
        
        return True
        
    except Exception as e:
        print(f"❌ Conversion failed: {e}")
        return False

def test_model_conversion(tflite_model_path):
    """
    Test the converted TFLite model.
    """
    try:
        # Load the TFLite model
        interpreter = tf.lite.Interpreter(model_path=tflite_model_path)
        interpreter.allocate_tensors()
        
        # Get input and output details
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        
        print("📊 Model Details:")
        print(f"   Input shape: {input_details[0]['shape']}")
        print(f"   Input dtype: {input_details[0]['dtype']}")
        print(f"   Output shape: {output_details[0]['shape']}")
        print(f"   Output dtype: {output_details[0]['dtype']}")
        
        # Test inference
        print("🧪 Testing inference...")
        
        # Create sample input data
        input_shape = input_details[0]['shape']
        sample_input = np.random.random_sample(input_shape).astype(np.float32)
        
        # Set input tensor
        interpreter.set_tensor(input_details[0]['index'], sample_input)
        
        # Run inference
        interpreter.invoke()
        
        # Get output
        output_data = interpreter.get_tensor(output_details[0]['index'])
        
        print(f"✅ Inference successful!")
        print(f"   Output shape: {output_data.shape}")
        print(f"   Output range: [{output_data.min():.4f}, {output_data.max():.4f}]")
        
        return True
        
    except Exception as e:
        print(f"❌ Model testing failed: {e}")
        return False

def main():
    """
    Main function to handle model conversion.
    """
    print("🚀 TensorFlow Lite Model Converter for Sign Language App")
    print("=" * 60)
    
    # Check for existing model files
    possible_models = [
        'best_model2.keras',
        'best_model.h5',
        'model.keras',
        'model.h5'
    ]
    
    input_model = None
    for model_file in possible_models:
        if os.path.exists(model_file):
            input_model = model_file
            break
    
    if input_model:
        print(f"📁 Found existing model: {input_model}")
        convert_choice = input("Convert existing model? (y/n): ").lower().strip()
        
        if convert_choice == 'y':
            output_model = "sign_language_model.tflite"
            
            # Convert the model
            if convert_keras_to_tflite(input_model, output_model):
                # Test the converted model
                print("\n" + "=" * 60)
                if test_model_conversion(output_model):
                    print("\n✅ Model conversion and testing completed successfully!")
                    print(f"🎯 Ready to use: {output_model}")
                else:
                    print("\n⚠️  Model converted but testing failed. Check the model file.")
            else:
                print("\n❌ Model conversion failed.")
        else:
            print("🔄 Creating sample model for testing...")
            sample_model = create_sample_sign_language_model()
            
            # Save sample model
            sample_model.save("sample_sign_model.keras")
            print("✅ Sample model created: sample_sign_model.keras")
            
            # Convert sample model
            if convert_keras_to_tflite("sample_sign_model.keras", "sign_language_model.tflite"):
                print("\n✅ Sample model converted successfully!")
            else:
                print("\n❌ Sample model conversion failed.")
    
    else:
        print("📁 No existing model found. Creating sample model...")
        sample_model = create_sample_sign_language_model()
        
        # Save sample model
        sample_model.save("sample_sign_model.keras")
        print("✅ Sample model created: sample_sign_model.keras")
        
        # Convert sample model
        if convert_keras_to_tflite("sample_sign_model.keras", "sign_language_model.tflite"):
            print("\n✅ Sample model converted successfully!")
            print("🎯 You can now test the app with the sample model.")
        else:
            print("\n❌ Sample model conversion failed.")

if __name__ == "__main__":
    main()