import cv2
import time

print("Opening camera...")
cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)  # Use DirectShow on Windows
time.sleep(2)  # Give camera time to initialize

if not cap.isOpened():
    print("ERROR: Cannot open camera!")
    exit()

print("Camera opened! Reading frame...")
ret, frame = cap.read()
print(f"Frame read success: {ret}")
if ret:
    print(f"Frame shape: {frame.shape}")

print("Showing window... Press 'q' to quit")
while True:
    ret, frame = cap.read()
    if not ret:
        print("ERROR: Can't receive frame")
        break
    
    cv2.imshow('Camera Test', frame)
    
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
print("Done!")
