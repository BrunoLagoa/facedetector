import { useEffect, useState } from 'react';
import { ImageSourcePropType, View } from 'react-native';
import { Camera, CameraType, FaceDetectionResult } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

import neutral from '../assets/neutral.png';
import winking from '../assets/winking.png';
import grinning from '../assets/grinning.png';

import { styles } from './styles';

export function Home() {
  const [faceDetected, setFaceDetected] = useState(false);
  const [emoji, setEmoji] = useState<ImageSourcePropType>(neutral);
  const [permission, requestPermission] = Camera.useCameraPermissions();

  const faceValues = useSharedValue({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });

  function handleFaceDetection({ faces }: FaceDetectionResult) {
    // console.log(faces);

    const face = faces[0] as any;

    if (face) {
      const { size, origin } = face.bounds;

      faceValues.value = {
        width: size.width,
        height: size.height,
        x: origin.x,
        y: origin.y,
      };

      setFaceDetected(true);

      if (face.smilingProbability > 0.5) {
        return setEmoji(grinning);
      }

      if (
        face.rightEyeOpenProbability > 0.5 &&
        face.leftEyeOpenProbability < 0.5
      ) {
        return setEmoji(winking);
      }

      setEmoji(neutral);
    } else {
      setFaceDetected(false);
    }
  }

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    zIndex: 1,
    width: faceValues.value.width,
    height: faceValues.value.height,
    transform: [
      { translateX: faceValues.value.x },
      { translateY: faceValues.value.y - 200 },
    ],
    // borderColor: 'blue',
    // borderWidth: 10,
  }));

  useEffect(() => {
    requestPermission();
  }, []);

  if (!permission?.granted) {
    return;
  }

  return (
    <View style={styles.container}>
      {faceDetected && <Animated.Image source={emoji} style={animatedStyle} />}
      <Camera
        style={styles.camera}
        type={CameraType.front}
        onFacesDetected={handleFaceDetection}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
          runClassifications: FaceDetector.FaceDetectorClassifications.all,
          minDetectionInterval: 100,
          tracking: true,
        }}
      />
    </View>
  );
}
