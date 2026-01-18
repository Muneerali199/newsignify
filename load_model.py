import tensorflow as tf
import os

def build_model():
    """Build the model architecture from scratch"""
    inputs = tf.keras.layers.Input(shape=(30, 171), name='input_layer')
    
    # Conv1D + BatchNorm
    x = tf.keras.layers.Conv1D(64, 3, activation='gelu', name='conv1d')(inputs)
    x = tf.keras.layers.BatchNormalization(name='batch_normalization')(x)
    
    # Bidirectional LSTM
    x = tf.keras.layers.Bidirectional(
        tf.keras.layers.LSTM(128, return_sequences=True, name='forward_lstm'),
        name='bidirectional'
    )(x)
    
    # Multi-Head Attention
    x = tf.keras.layers.MultiHeadAttention(
        num_heads=2, key_dim=64, value_dim=64, name='multi_head_attention'
    )(x, x)
    
    # Layer Normalization
    x = tf.keras.layers.LayerNormalization(name='layer_normalization')(x)
    
    # Global Average Pooling
    x = tf.keras.layers.GlobalAveragePooling1D(name='global_average_pooling1d')(x)
    
    # Dense layers
    x = tf.keras.layers.Dense(256, activation='silu', 
                               kernel_regularizer=tf.keras.regularizers.l2(0.01),
                               name='dense')(x)
    x = tf.keras.layers.Dropout(0.4, name='dropout_1')(x)
    outputs = tf.keras.layers.Dense(15, activation='softmax', name='dense_1')(x)
    
    model = tf.keras.Model(inputs=inputs, outputs=outputs, name='functional')
    return model

# Build and load weights
model = build_model()
model.load_weights('model.weights.h5')
print("Model loaded successfully!")
print(model.summary())
