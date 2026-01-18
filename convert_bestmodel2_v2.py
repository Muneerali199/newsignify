import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import tensorflow as tf
import numpy as np

print(f"TensorFlow version: {tf.__version__}")
print(f"Keras version: {tf.keras.__version__}")

print("\nLoading best_model2_new.keras...")
model = tf.keras.models.load_model('best_model2_new.keras', compile=False)

print("\nModel summary:")
model.summary()

# Get input/output shapes
print(f"\nInput shape: {model.input_shape}")
print(f"Output shape: {model.output_shape}")

# Build with dummy input
dummy_input = np.zeros((1,) + model.input_shape[1:], dtype=np.float32)
_ = model(dummy_input)

# Save as SavedModel
print("\nSaving as SavedModel...")
saved_model_path = 'saved_model_bestmodel2'
tf.saved_model.save(model, saved_model_path)

# Convert to TensorFlow Lite
print("Converting to TensorFlow Lite...")
converter = tf.lite.TFLiteConverter.from_saved_model(saved_model_path)

# Optimizations for mobile speed
converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.target_spec.supported_ops = [
    tf.lite.OpsSet.TFLITE_BUILTINS,
    tf.lite.OpsSet.SELECT_TF_OPS
]
converter.target_spec.supported_types = [tf.float16]
converter.experimental_new_converter = True

print("Converting...")
tflite_model = converter.convert()

# Save TFLite model
output_path = 'sign_language_bestmodel2.tflite'
with open(output_path, 'wb') as f:
    f.write(tflite_model)

print(f"\n✓ TensorFlow Lite model saved: {output_path}")
print(f"✓ Model size: {len(tflite_model) / 1024:.2f} KB")

# Test the model
print("\nTesting TFLite model...")
interpreter = tf.lite.Interpreter(model_content=tflite_model)
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

print(f"Input shape: {input_details[0]['shape']}")
print(f"Output shape: {output_details[0]['shape']}")

# Test inference
test_input = np.random.randn(*input_details[0]['shape']).astype(np.float32)
interpreter.set_tensor(input_details[0]['index'], test_input)
interpreter.invoke()
output = interpreter.get_tensor(output_details[0]['index'])

print(f"Test inference successful! Output shape: {output.shape}")
print(f"Output sum: {np.sum(output):.4f}")
print("✓ Model ready for mobile deployment!")
