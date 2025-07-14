import { useRouter } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, X, Zap, RotateCcw } from 'lucide-react-native';
import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, ActivityIndicator, Image, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { useUserStore } from '@/store/user-store';
import { useIdentificationStore } from '@/store/identification-store';
import { analyzeWatchImage } from '@/services/ai-identification';
import { findMatchingWatches } from '@/services/watch-matching';
import { compressImage, convertUriToBase64 } from '@/utils/image-utils';

export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const { incrementIdentifications } = useUserStore();
  const { 
    isAnalyzing, 
    setAnalyzing, 
    currentAnalysis, 
    setCurrentAnalysis,
    addToHistory 
  } = useIdentificationStore();

  const handleClose = () => {
    router.back();
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash(current => !current);
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });
      
      if (photo?.uri) {
        setCapturedImage(photo.uri);
        await analyzeImage(photo.uri);
      }
    } catch (error) {
      console.error('Erro ao capturar foto:', error);
      Alert.alert('Erro', 'Falha ao capturar a foto. Tente novamente.');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setCapturedImage(imageUri);
        await analyzeImage(imageUri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Falha ao selecionar a imagem. Tente novamente.');
    }
  };

  const analyzeImage = async (imageUri: string) => {
    setAnalyzing(true);
    setCurrentAnalysis(null);
    
    try {
      // Compress and convert image to base64
      const compressedBase64 = await compressImage(imageUri);
      
      // Analyze with AI
      const aiAnalysis = await analyzeWatchImage(compressedBase64);
      setCurrentAnalysis(aiAnalysis);
      
      // Find matching watches
      const matches = findMatchingWatches(aiAnalysis);
      
      // Add to history if we have matches
      if (matches.length > 0) {
        const bestMatch = matches[0];
        bestMatch.imageUri = imageUri;
        addToHistory(bestMatch);
        incrementIdentifications();
      }
      
      // Navigate to results
      router.push({
        pathname: '/identification-results',
        params: {
          imageUri,
          analysisId: Date.now().toString(),
        },
      });
      
    } catch (error) {
      console.error('Erro na análise:', error);
      Alert.alert(
        'Erro na Análise',
        'Não foi possível analisar a imagem. Verifique sua conexão e tente novamente.',
        [
          { text: 'Tentar Novamente', onPress: () => analyzeImage(imageUri) },
          { text: 'Cancelar', onPress: resetCamera },
        ]
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const resetCamera = () => {
    setCapturedImage(null);
    setCurrentAnalysis(null);
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.permissionTitle}>Acesso à Câmera Necessário</Text>
        <Text style={styles.permissionText}>
          Precisamos do acesso à câmera para identificar relógios. 
          Por favor, conceda a permissão para continuar.
        </Text>
        <Button
          title="Conceder Permissão"
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
          <X size={24} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {isAnalyzing ? 'Analisando com IA...' : 'Identificar Relógio'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {!capturedImage ? (
        <>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            flash={flash ? 'on' : 'off'}
          >
            <View style={styles.cameraOverlay}>
              <View style={styles.cameraFrame}>
                <View style={styles.frameCorner} />
                <View style={[styles.frameCorner, styles.frameCornerTopRight]} />
                <View style={[styles.frameCorner, styles.frameCornerBottomLeft]} />
                <View style={[styles.frameCorner, styles.frameCornerBottomRight]} />
              </View>
              <Text style={styles.frameInstruction}>
                Posicione o relógio no centro do círculo
              </Text>
            </View>
          </CameraView>

          <View style={styles.cameraControls}>
            <Button
              title="Galeria"
              onPress={pickImage}
              variant="outline"
              icon={<ImageIcon size={20} color={Colors.primary} />}
            />
            
            <View style={styles.captureContainer}>
              <Pressable onPress={takePicture} style={styles.captureButton}>
                <View style={styles.captureButtonInner}>
                  <Camera size={24} color={Colors.white} />
                </View>
              </Pressable>
            </View>

            <View style={styles.controlsRight}>
              {Platform.OS !== 'web' && (
                <Pressable onPress={toggleFlash} style={styles.controlButton}>
                  <Zap size={20} color={flash ? Colors.accent : Colors.white} />
                </Pressable>
              )}
              <Pressable onPress={toggleCameraFacing} style={styles.controlButton}>
                <RotateCcw size={20} color={Colors.white} />
              </Pressable>
            </View>
          </View>

          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>Como obter os melhores resultados:</Text>
            <Text style={styles.instructionsText}>
              • Posicione o mostrador do relógio claramente no quadro{'\n'}
              • Garanta boa iluminação{'\n'}
              • Mantenha a câmera estável{'\n'}
              • Remova reflexos se possível
            </Text>
          </View>
        </>
      ) : (
        <View style={styles.resultContainer}>
          <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
          
          {isAnalyzing ? (
            <View style={styles.analyzingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.analyzingText}>Analisando com IA...</Text>
              <Text style={styles.analyzingSubtext}>
                Nossa IA está identificando a marca, modelo e especificações.
              </Text>
            </View>
          ) : (
            <View style={styles.resultActions}>
              <Button
                title="Tentar Novamente"
                onPress={resetCamera}
                variant="outline"
                fullWidth
              />
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
    backgroundColor: Colors.black,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
  placeholder: {
    width: 40,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraFrame: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 3,
    borderColor: Colors.accent,
    position: 'relative',
  },
  frameCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: Colors.white,
    top: -10,
    left: -10,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  frameCornerTopRight: {
    left: undefined,
    right: -10,
    borderLeftWidth: 0,
    borderRightWidth: 3,
  },
  frameCornerBottomLeft: {
    top: undefined,
    bottom: -10,
    borderTopWidth: 0,
    borderBottomWidth: 3,
  },
  frameCornerBottomRight: {
    top: undefined,
    bottom: -10,
    left: undefined,
    right: -10,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  frameInstruction: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '500',
    marginTop: 20,
    textAlign: 'center',
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  captureContainer: {
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.accent,
  },
  captureButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsRight: {
    flexDirection: 'column',
    gap: 12,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: Colors.background,
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
  resultActions: {
    padding: 20,
  },
});