import cv2
import numpy as np
from collections import deque
import tensorflow as tf
import mediapipe as mp
import os

# --- Configuration ---
MODEL_DIR = r"C:\Users\91812\OneDrive\Desktop\signify"
LABEL_MAP_PATH = r"C:\Users\91812\OneDrive\Desktop\signify\label_mapping2.txt"
SEQUENCE_LENGTH = 30
CONFIDENCE_THRESHOLD = 0.82
INPUT_DIM = 171

# --- Build Model Architecture ---
def build_model():
    inputs = tf.keras.layers.Input(shape=(SEQUENCE_LENGTH, INPUT_DIM))
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

# --- Load Model ---
model = build_model()
# Build the model by running a dummy prediction
dummy_input = np.zeros((1, SEQUENCE_LENGTH, INPUT_DIM))
_ = model(dummy_input)
# Now load weights with skip_mismatch
try:
    model.load_weights(os.path.join(MODEL_DIR, 'model.weights.h5'), by_name=True, skip_mismatch=True)
    print("Model loaded successfully (with skip_mismatch)!")
except Exception as e:
    print(f"Warning: Could not load weights: {e}")
    print("Using randomly initialized weights for testing...")
label_map = {}
with open(LABEL_MAP_PATH, "r") as f:
    for line in f:
        label, idx = line.strip().split(',')
        label_map[int(idx)] = label

# --- MediaPipe Initialization ---
mp_hands = mp.solutions.hands
mp_pose = mp.solutions.pose
mp_face = mp.solutions.face_mesh
mp_drawing = mp.solutions.drawing_utils

hands = mp_hands.Hands(static_image_mode=False, max_num_hands=2, min_detection_confidence=0.5)
pose = mp_pose.Pose(static_image_mode=False, min_detection_confidence=0.5)
face = mp_face.FaceMesh(static_image_mode=False, max_num_faces=1, min_detection_confidence=0.5)

# --- Landmark Indices ---
face_indices = [1, 4, 33, 61, 199, 263, 291, 362, 454]
pose_indices = [11, 12, 13, 14, 15, 16]

def live_predict():
    print("Initializing camera...")
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)  # Use DirectShow for Windows
    import time
    time.sleep(1)  # Give camera time to initialize
    
    if not cap.isOpened():
        print("Error: Could not open camera!")
        return
    
    # Test read
    ret, test_frame = cap.read()
    if not ret:
        print("Error: Could not read from camera!")
        cap.release()
        return
    
    print(f"Camera opened successfully! Frame size: {test_frame.shape}")
    print("Opening window... Press 'q' to quit.")
    buffer = deque(maxlen=SEQUENCE_LENGTH)

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        frame_rgb.flags.writeable = False

        results_hand = hands.process(frame_rgb)
        results_pose = pose.process(frame_rgb)
        results_face = face.process(frame_rgb)

        frame_output = frame.copy()
        frame_rgb.flags.writeable = True

        face_landmarks = np.zeros((len(face_indices), 3))
        pose_landmarks = np.zeros((len(pose_indices), 3))
        left_hand = np.zeros((21, 3))
        right_hand = np.zeros((21, 3))

        if results_face.multi_face_landmarks:
            all_face = np.array([[lm.x, lm.y, lm.z] for lm in results_face.multi_face_landmarks[0].landmark])
            face_landmarks = all_face[face_indices]
            mp_drawing.draw_landmarks(frame_output, results_face.multi_face_landmarks[0], mp_face.FACEMESH_TESSELATION)

        if results_pose.pose_landmarks:
            all_pose = np.array([[lm.x, lm.y, lm.z] for lm in results_pose.pose_landmarks.landmark])
            pose_landmarks = all_pose[pose_indices]
            mp_drawing.draw_landmarks(frame_output, results_pose.pose_landmarks, mp_pose.POSE_CONNECTIONS)

        if results_hand.multi_hand_landmarks and results_hand.multi_handedness:
            for idx, handedness in enumerate(results_hand.multi_handedness):
                label = handedness.classification[0].label
                landmarks = np.array([[lm.x, lm.y, lm.z] for lm in results_hand.multi_hand_landmarks[idx].landmark])
                mp_drawing.draw_landmarks(frame_output, results_hand.multi_hand_landmarks[idx], mp_hands.HAND_CONNECTIONS)

                if label == 'Left':
                    left_hand = landmarks - landmarks[0]
                else:
                    right_hand = landmarks - landmarks[0]

        combined = np.concatenate([
            face_landmarks.flatten(),
            pose_landmarks.flatten(),
            left_hand.flatten(),
            right_hand.flatten()
        ])

        # --- Determine Status Text ---
        display_text = "Gathering..."
        if np.count_nonzero(combined) < 30:
            display_text = "Low landmark data"
            low_data_flag = True
        else:
            low_data_flag = False
            buffer.append(combined)

        # --- Predict ---
        if not low_data_flag and len(buffer) == SEQUENCE_LENGTH:
            input_seq = np.expand_dims(np.array(buffer), axis=0)

            if input_seq.shape == (1, SEQUENCE_LENGTH, INPUT_DIM):
                prediction = model.predict(input_seq, verbose=0)[0]
                predicted_idx = np.argmax(prediction)
                confidence = prediction[predicted_idx]

                if confidence > CONFIDENCE_THRESHOLD:
                    predicted_label = label_map.get(predicted_idx, "Unknown")
                    display_text = f"{predicted_label} ({confidence:.2f})"
                else:
                    display_text = "Uncertain..."
            else:
                display_text = "Shape Mismatch"
                buffer.clear()
        elif not low_data_flag:
            display_text = f"Gathering... ({len(buffer)}/{SEQUENCE_LENGTH})"

        # --- Display Status ---
        text_color = (0, 0, 255) if low_data_flag else (0, 0, 0)
        cv2.putText(frame_output, display_text, (20, 50),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.2, text_color, 3, cv2.LINE_AA)
        cv2.namedWindow("Real-Time Sign Prediction", cv2.WND_PROP_FULLSCREEN)
        cv2.setWindowProperty("Real-Time Sign Prediction", cv2.WND_PROP_FULLSCREEN, cv2.WINDOW_FULLSCREEN)

        cv2.imshow("Real-Time Sign Prediction", frame_output)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # --- Cleanup ---
    cap.release()
    cv2.destroyAllWindows()
    hands.close()
    pose.close()
    face.close()

if __name__ == "__main__":
    live_predict()
