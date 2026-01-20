import cv2
import numpy as np
from collections import deque
import tensorflow as tf
import mediapipe as mp
import os

# --- Configuration ---
MODEL_PATH = r"E:\cursor_sign\model\best_model2.keras"
LABEL_MAP_PATH = r"E:\cursor_sign\model\label_mapping2.txt"
SEQUENCE_LENGTH = 30
CONFIDENCE_THRESHOLD = 0.82
INPUT_DIM = 171

# --- Load Model and Labels ---
model = tf.keras.models.load_model(MODEL_PATH)
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
    cap = cv2.VideoCapture(1)
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
