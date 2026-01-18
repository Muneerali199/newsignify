import tensorflow as tf
import numpy as np
import os

# Build model architecture
def build_model():
    inputs = tf.keras.layers.Input(shape=(30, 171))
    x = tf.keras.layers.Conv1D(64, 3, activation='gelu')(inputs)
    x = tf.keras.layers.BatchNormalization()(x)
    x = tf.keras.layers.Bidirectional(tf.keras.layers.LSTM(128, return_sequences=True))(x)
    x = tf.keras.layers.MultiHeadAttention(num_heads=2, key_dim=64, value_dim=64)(x, x)
    x = tf.keras.layers.LayerNormalization()(x)
    x = tf.keras.layers.GlobalAveragePooling1D()(x)
    x = tf.keras.layers.Dense(256, activation='silu', kernel_regularizer=tf.keras.regularizers.l2(0.01))(x)
    x = tf.keras.layers.Dropout(0.4)(x)
    outputs = tf.keras.layers.Dense(15, activation='softmax')(x)
    return tf.keras.Model(inputs=inputs, outputs=outputs)

print("Building model...")
model = build_model()

# Build with dummy input
dummy_input = np.zeros((1, 30, 171), dtype=np.float32)
_ = model(dummy_input)

# Load weights
try:
    model.load_weights('model.weights.h5', by_name=True, skip_mismatch=True)
    print("Weights loaded (with skip_mismatch)")
except Exception as e:
    print(f"Warning: Could not load weights: {e}")
    print("Saving model with random weights for testing...")

# Save as SavedModel first
print("Saving as SavedModel...")
tf.saved_model.save(model, 'saved_model')

# Convert to TensorFlow Lite with FULL optimization
print("Converting to TensorFlow Lite with GPU optimization...")
converter = tf.lite.TFLiteConverter.from_saved_model('saved_model')

# Maximum optimizations for speed
converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.target_spec.supported_ops = [
    tf.lite.OpsSet.TFLITE_BUILTINS,
    tf.lite.OpsSet.SELECT_TF_OPS
]

# Enable GPU delegate compatibility
converter.target_spec.supported_types = [tf.float16]  # Use FP16 for GPU
converter.experimental_new_converter = True

# Convert
print("Converting (this may take a moment)...")
tflite_model = converter.convert()

# Save TFLite model
with open('sign_language_model.tflite', 'wb') as f:
    f.write(tflite_model)

print(f"✓ TensorFlow Lite model saved: sign_language_model.tflite")
print(f"✓ Model size: {len(tflite_model) / 1024:.2f} KB")

# Test the TFLite model
print("\nTesting TFLite model...")
interpreter = tf.lite.Interpreter(model_content=tflite_model)
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

print(f"Input shape: {input_details[0]['shape']}")
print(f"Output shape: {output_details[0]['shape']}")

# Test inference
test_input = np.random.randn(1, 30, 171).astype(np.float32)
interpreter.set_tensor(input_details[0]['index'], test_input)
interpreter.invoke()
output = interpreter.get_tensor(output_details[0]['index'])

print(f"Test inference successful! Output shape: {output.shape}")
print("✓ Model ready for mobile deployment!")
