# TensorFlow Lite Model Integration Guide for Sign Language App

## Overview
This directory should contain your TensorFlow Lite model for sign language detection.

## Model Requirements

### Input Specifications
- **Shape**: [1, 30, 171] (batch_size=1, sequence_length=30, features=171)
- **Type**: Float32
- **Features**: 
  - 21 hand landmarks × 3 coordinates (x, y, z) = 63 values
  - Additional pose and face landmarks = 108 values
  - Total: 171 features per frame

### Output Specifications
- **Shape**: [1, 200] (batch_size=1, num_classes=200)
- **Type**: Float32
- **Classes**: 200 different sign language gestures

## Model Conversion (If you have a Keras model)

If you have a Keras model (`best_model2.keras`), you can convert it using this script:

```python
import tensorflow as tf
import numpy as np

def convert_keras_to_tflite(keras_model_path, tflite_model_path):
    # Load the Keras model
    model = tf.keras.models.load_model(keras_model_path)
    
    # Convert to TensorFlow Lite
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    
    # Optimize for mobile
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    converter.target_spec.supported_types = [tf.float32]
    
    # Convert
    tflite_model = converter.convert()
    
    # Save the TFLite model
    with open(tflite_model_path, 'wb') as f:
        f.write(tflite_model)
    
    print(f"✅ Model converted successfully!")
    print(f"📁 Saved to: {tflite_model_path}")

# Usage
convert_keras_to_tflite('best_model2.keras', 'sign_language_model.tflite')
```

## Integration Steps

1. **Place your model file here**: Copy your `.tflite` model to this directory
2. **Update the model path**: Ensure the path in `modelUtils.ts` matches your model location
3. **Test the integration**: Run the app and verify model loading

## Testing Without a Real Model

For development and testing, the app will use simulated hand landmark data. To test with a real model:

1. Add your `.tflite` model to this directory
2. Update the model path in `src/utils/modelUtils.ts`
3. Restart the Metro bundler
4. Test on a real device with Expo Go

## Performance Optimization

- **Model Size**: Keep model under 50MB for better performance
- **Quantization**: Consider using quantization for smaller model size
- **Input Preprocessing**: Ensure input data is properly normalized
- **Batch Processing**: Process multiple frames efficiently

## Troubleshooting

### Model Loading Issues
- Check model file exists in the correct location
- Verify model format is compatible with react-native-fast-tflite
- Check console logs for specific error messages

### Inference Issues
- Verify input data shape matches model expectations
- Check data preprocessing steps
- Ensure confidence threshold is appropriate

### Performance Issues
- Profile model inference time
- Consider reducing model complexity
- Optimize input data processing

## Next Steps

1. Add your TensorFlow Lite model to this directory
2. Update the model configuration in `modelUtils.ts`
3. Test the complete integration
4. Fine-tune performance parameters