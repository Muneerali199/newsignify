# Sign Language Detection App

A real-time sign language detection mobile application built with React Native, Expo, and TensorFlow Lite. This app uses computer vision and machine learning to recognize sign language gestures through your device's camera.

## 🚀 Features

- **Real-time Detection**: Live sign language recognition using camera
- **TensorFlow Lite Integration**: Fast, on-device inference
- **Confidence Scoring**: Shows prediction confidence percentage
- **Expo Go Compatible**: Easy development and testing
- **Cross-platform**: Works on both iOS and Android
- **Demo Mode**: Includes random predictions for testing

## 📱 Screenshots

*Camera interface with real-time detection overlay*

## 🛠️ Technology Stack

### Frontend
- **React Native**: Mobile app framework
- **Expo**: Development platform and tooling
- **TypeScript**: Type-safe JavaScript
- **React Navigation**: Screen navigation

### Machine Learning
- **TensorFlow Lite**: On-device ML inference
- **MediaPipe**: Hand landmark detection (ready for integration)
- **Python**: Model training and conversion scripts

### Build Tools
- **EAS Build**: Expo Application Services for building
- **Metro Bundler**: JavaScript bundler for React Native

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Python 3.8+ (for model training)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/sign-language-app.git
cd sign-language-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm start
# or
expo start
```

### 4. Run on Device
- **Expo Go**: Scan the QR code with Expo Go app
- **Android**: Press `a` in the terminal
- **iOS**: Press `i` in the terminal

## 🔧 Building APK

### Development Build
```bash
eas build --platform android --profile development
```

### Production APK
```bash
eas build --platform android --profile preview
```

## 🧠 Machine Learning Setup

### Model Training (Python)
The app includes Python scripts for training your own sign language model:

```bash
cd python
pip install -r requirements.txt
python train_model.py
```

### Model Conversion
Convert your trained model to TensorFlow Lite:

```bash
python convert_to_tflite.py
```

### Demo Mode
The app currently runs in demo mode with random predictions. To use your real model:

1. Train your model using the Python scripts
2. Convert to TensorFlow Lite format
3. Place the `.tflite` file in `assets/models/`
4. Update the model loading code in `src/utils/modelUtils.ts`

## 📁 Project Structure

```
sign-language-app/
├── src/
│   ├── screens/
│   │   ├── ExpoCameraScreen.tsx    # Main camera screen
│   │   └── HomeScreen.tsx          # Home/welcome screen
│   ├── utils/
│   │   └── modelUtils.ts           # TensorFlow Lite utilities
│   └── navigation/
│       └── AppNavigator.tsx        # Navigation setup
├── python/
│   ├── train_model.py              # Model training script
│   ├── convert_to_tflite.py        # TFLite conversion
│   ├── predictionreal.py           # Original prediction script
│   └── requirements.txt            # Python dependencies
├── assets/
│   └── models/                     # Place your .tflite models here
├── android/                        # Android native code
├── ios/                           # iOS native code
├── app.json                       # Expo configuration
├── eas.json                       # EAS build configuration
└── metro.config.js               # Metro bundler config
```

## 🔧 Configuration

### Camera Settings
- Uses front camera for sign language detection
- 640x480 resolution for optimal performance
- Auto-focus enabled

### Model Configuration
- Input shape: `[1, 30, 21, 3]` (30 frames, 21 hand landmarks, 3D coordinates)
- Output: 8 sign language classes
- Confidence threshold: 0.7

## 🎯 Sign Language Classes

The app recognizes 8 basic signs:
- Hello
- Thank You  
- Please
- Goodbye
- Yes
- No
- Love
- Help

## 🚀 Deployment

### Android APK
1. Build using EAS: `eas build --platform android --profile preview`
2. Download the APK from the build link
3. Install on Android device (enable "Install from unknown sources")

### App Store/Play Store
1. Update app.json with your app details
2. Build for production: `eas build --platform android --profile production`
3. Follow store submission guidelines

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- TensorFlow Lite team for on-device ML
- Expo team for amazing development tools
- React Native community
- MediaPipe for hand tracking capabilities

## 📞 Support

For support, please open an issue in the GitHub repository or contact: [your-email@example.com]

---

**Made with ❤️ by [Your Name]**