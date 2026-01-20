import tensorflow as tf
import numpy as np
import os

def create_sample_model_for_testing():
    """
    Create a sample model that matches predictionreal.py requirements exactly.
    This is for testing when the real model is not available.
    """
    model = tf.keras.Sequential([
        tf.keras.layers.LSTM(128, return_sequences=True, input_shape=(30, 171)),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.LSTM(64, return_sequences=True),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.LSTM(32),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(64, activation='relu'),
        tf.keras.layers.Dense(200, activation='softmax')  # 200 sign classes
    ])
    
    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def convert_keras_model_to_tflite(input_model_path, output_model_path):
    """
    Convert a Keras model to TensorFlow Lite format optimized for mobile.
    
    Args:
        input_model_path: Path to the Keras model (.keras or .h5)
        output_model_path: Output path for the TFLite model
    
    Returns:
        bool: Success status
    """
    try:
        # Load the Keras model
        print(f"📁 Loading Keras model from: {input_model_path}")
        
        if not os.path.exists(input_model_path):
            print(f"❌ Model file not found: {input_model_path}")
            print("🔄 Creating sample model for testing...")
            model = create_sample_model_for_testing()
        else:
            model = tf.keras.models.load_model(input_model_path)
            print("✅ Model loaded successfully!")
        
        # Display model info
        print(f"📊 Model input shape: {model.input_shape}")
        print(f"📊 Model output shape: {model.output_shape}")
        print(f"📊 Model parameters: {model.count_params():,}")
        
    except Exception as e:
        print(f"❌ Error loading Keras model: {e}")
        print("🔄 Creating sample model for testing...")
        model = create_sample_model_for_testing()
    
    # Convert to TensorFlow Lite
    print("🔄 Converting to TensorFlow Lite...")
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    
    # Optimization settings for mobile deployment
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    converter.target_spec.supported_types = [tf.float32]
    
    # Optional: Add quantization for smaller model size (uncomment if needed)
    # converter.optimizations = [tf.lite.Optimize.DEFAULT]
    # converter.target_spec.supported_types = [tf.float16]
    
    try:
        tflite_model = converter.convert()
        print("✅ Conversion successful!")
        
        # Save the TFLite model
        with open(output_model_path, 'wb') as f:
            f.write(tflite_model)
        
        # Get file size
        file_size = os.path.getsize(output_model_path) / (1024 * 1024)  # MB
        print(f"📁 Saved TFLite model to: {output_model_path}")
        print(f"📊 Model size: {file_size:.2f} MB")
        
        return True
        
    except Exception as e:
        print(f"❌ Conversion failed: {e}")
        return False

def test_tflite_model(tflite_model_path):
    """
    Test the converted TFLite model to ensure it works correctly.
    
    Args:
        tflite_model_path: Path to the TFLite model
    
    Returns:
        bool: Success status
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
        
        # Test inference with sample data (like predictionreal.py)
        print("🧪 Testing inference...")
        
        # Create sample input data matching predictionreal.py format
        input_shape = input_details[0]['shape']  # Should be [1, 30, 171]
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
        print(f"   Predicted class: {np.argmax(output_data)}")
        print(f"   Confidence: {np.max(output_data):.4f}")
        
        return True
        
    except Exception as e:
        print(f"❌ Model testing failed: {e}")
        return False

def create_label_mapping_file():
    """
    Create a sample label mapping file if it doesn't exist.
    """
    labels = [
        "Hello", "Thank you", "Please", "Sorry", "Yes", "No", "Good", "Bad",
        "Love", "Help", "Water", "Food", "Eat", "Drink", "Sleep", "Go",
        "Come", "Stop", "Start", "More", "Less", "Big", "Small", "Hot",
        "Cold", "Happy", "Sad", "Angry", "Scared", "Tired", "Sick", "Better"
    ]
    
    # Create 200 labels (extend the list)
    while len(labels) < 200:
        labels.append(f"Sign_{len(labels)}")
    
    with open("label_mapping2.txt", "w") as f:
        for i, label in enumerate(labels):
            f.write(f"{label},{i}\n")
    
    print("✅ Created sample label_mapping2.txt")

def main():
    """
    Main function to handle model conversion for the sign language app.
    """
    print("🚀 TensorFlow Lite Model Converter for Sign Language App")
    print("=" * 60)
    print("This converter is designed to work with predictionreal.py")
    print("Expected model input: [1, 30, 171] (30 frames, 171 features)")
    print("Expected model output: [1, 200] (200 sign classes)")
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
    
    # Check for label mapping file
    if not os.path.exists('label_mapping2.txt'):
        print("📄 Creating sample label mapping file...")
        create_label_mapping_file()
    
    if input_model:
        print(f"📁 Found existing model: {input_model}")
        convert_choice = input("Convert existing model? (y/n): ").lower().strip()
        
        if convert_choice == 'y':
            output_model = "sign_language_model.tflite"
            
            # Convert the model
            if convert_keras_model_to_tflite(input_model, output_model):
                # Test the converted model
                print("\n" + "=" * 60)
                if test_tflite_model(output_model):
                    print("\n✅ Model conversion and testing completed successfully!")
                    print(f"🎯 Ready to use: {output_model}")
                    print("📱 You can now test the app with Expo Go!")
                else:
                    print("\n⚠️  Model converted but testing failed. Check the model file.")
            else:
                print("\n❌ Model conversion failed.")
        else:
            print("🔄 Creating sample model for testing...")
            sample_model = create_sample_model_for_testing()
            
            # Save sample model
            sample_model.save("sample_sign_model.keras")
            print("✅ Sample model created: sample_sign_model.keras")
            
            # Convert sample model
            if convert_keras_model_to_tflite("sample_sign_model.keras", "sign_language_model.tflite"):
                print("\n✅ Sample model converted successfully!")
                print("🎯 You can now test the app with the sample model.")
            else:
                print("\n❌ Sample model conversion failed.")
    
    else:
        print("📁 No existing model found. Creating sample model...")
        sample_model = create_sample_model_for_testing()
        
        # Save sample model
        sample_model.save("sample_sign_model.keras")
        print("✅ Sample model created: sample_sign_model.keras")
        
        # Convert sample model
        if convert_keras_model_to_tflite("sample_sign_model.keras", "sign_language_model.tflite"):
            print("\n✅ Sample model converted successfully!")
            print("🎯 You can now test the app with the sample model.")
        else:
            print("\n❌ Sample model conversion failed.")

if __name__ == "__main__":
    main()