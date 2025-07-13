import { useRouter } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, ActivityIndicator, Image, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { watches } from '@/mocks/watches';
import { useUserStore } from '@/store/user-store';

export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [identifiedWatch, setIdentifiedWatch] = useState<any | null>(null);
  const { incrementIdentifications } = useUserStore();

  const handleClose = () => {
    router.back();
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const takePicture = async () => {
    // In a real app, this would capture a photo
    // For this demo, we'll simulate capturing by setting a random watch image
    const randomIndex = Math.floor(Math.random() * watches.length);
    const randomWatch = watches[randomIndex];
    
    setCapturedImage(randomWatch.imageUrl);
    analyzeImage(randomWatch.imageUrl);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      // In a real app, we would use the selected image
      // For this demo, we'll simulate by using a random watch
      const randomIndex = Math.floor(Math.random() * watches.length);
      const randomWatch = watches[randomIndex];
      
      setCapturedImage(randomWatch.imageUrl);
      analyzeImage(randomWatch.imageUrl);
    }
  };

  const analyzeImage = (imageUri: string) => {
    setAnalyzing(true);
    
    // Simulate API call to identify watch
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * watches.length);
      const identifiedWatch = watches[randomIndex];
      
      setIdentifiedWatch(identifiedWatch);
      setAnalyzing(false);
      incrementIdentifications();
    }, 2000);
  };

  const resetCamera = () => {
    setCapturedImage(null);
    setIdentifiedWatch(null);
  };

  const viewWatchDetails = () => {
    if (identifiedWatch) {
      router.push(`/watch/${identifiedWatch.id}`);
    }
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          We need camera access to identify watches. Please grant permission to continue.
        </Text>
        <Button
          title="Grant Permission"
          onPress={requestPermission}
          variant="primary"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <X size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {identifiedWatch ? 'Watch Identified' : capturedImage ? 'Analyzing Watch' : 'Identify Watch'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {!capturedImage ? (
        <>
          <CameraView
            style={styles.camera}
            facing={facing}
          >
            <View style={styles.cameraOverlay}>
              <View style={styles.cameraFrame} />
            </View>
          </CameraView>

          <View style={styles.cameraControls}>
            <Button
              title="Gallery"
              onPress={pickImage}
              variant="outline"
              icon={<ImageIcon size={20} color={Colors.primary} />}
            />
            <Pressable onPress={takePicture} style={styles.captureButton}>
              <View style={styles.captureButtonInner} />
            </Pressable>
            {Platform.OS !== 'web' && (
              <Button
                title="Flip"
                onPress={toggleCameraFacing}
                variant="outline"
                icon={<Camera size={20} color={Colors.primary} />}
              />
            )}
          </View>

          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>How to get the best results:</Text>
            <Text style={styles.instructionsText}>
              • Position the watch face clearly in the frame{'\n'}
              • Ensure good lighting{'\n'}
              • Hold the camera steady{'\n'}
              • Remove reflections if possible
            </Text>
          </View>
        </>
      ) : (
        <View style={styles.resultContainer}>
          <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
          
          {analyzing ? (
            <View style={styles.analyzingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.analyzingText}>Analyzing watch...</Text>
              <Text style={styles.analyzingSubtext}>
                Our AI is identifying the brand, model, and specifications.
              </Text>
            </View>
          ) : (
            <View style={styles.identificationResult}>
              <Text style={styles.resultTitle}>Watch Identified</Text>
              
              <View style={styles.resultDetails}>
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Brand</Text>
                  <Text style={styles.resultValue}>{identifiedWatch?.brand}</Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Model</Text>
                  <Text style={styles.resultValue}>{identifiedWatch?.model}</Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Reference</Text>
                  <Text style={styles.resultValue}>{identifiedWatch?.reference}</Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Estimated Value</Text>
                  <Text style={styles.resultValue}>{identifiedWatch?.price}</Text>
                </View>
              </View>
              
              <View style={styles.resultActions}>
                <Button
                  title="View Details"
                  onPress={viewWatchDetails}
                  variant="primary"
                  fullWidth
                />
                <View style={styles.spacer} />
                <Button
                  title="Identify Another"
                  onPress={resetCamera}
                  variant="outline"
                  fullWidth
                />
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraFrame: {
    width: 280,
    height: 280,
    borderWidth: 2,
    borderColor: Colors.white,
    borderRadius: 16,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: Colors.white,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.primary,
  },
  captureButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.primary,
  },
  instructions: {
    padding: 20,
    backgroundColor: Colors.white,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 22,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  resultContainer: {
    flex: 1,
  },
  capturedImage: {
    width: '100%',
    height: 300,
    backgroundColor: Colors.gray[200],
  },
  analyzingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  analyzingText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  analyzingSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  identificationResult: {
    flex: 1,
    padding: 20,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 20,
  },
  resultDetails: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  resultLabel: {
    fontSize: 14,
    color: Colors.gray[600],
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  resultActions: {
    marginTop: 'auto',
  },
  spacer: {
    height: 12,
  },
});