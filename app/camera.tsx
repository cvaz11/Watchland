import { useRouter } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, X, Zap, RotateCcw, AlertCircle, CheckCircle, Settings } from 'lucide-react-native';
import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, ActivityIndicator, Image, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { useUserStore } from '@/store/user-store';
import { useIdentificationStore } from '@/store/identification-store';
import { useAPIStore } from '@/store/api-store';
import { analyzeWatchImage, validateImageQuality } from '@/services/ai-identification';
import { findMatchingWatches } from '@/services/watch-matching';
import { compressImage } from '@/utils/image-utils';

interface AnalysisStep {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  description: string;
}

export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([]);
  const { incrementIdentifications } = useUserStore();
  const { config } = useAPIStore();
  const { 
    isAnalyzing, 
    setAnalyzing, 
    currentAnalysis, 
    setCurrentAnalysis,
    addToHistory 
  } = useIdentificationStore();

  const initializeAnalysisSteps = (): AnalysisStep[] => [
    {
      id: 'quality',
      title: 'Validando qualidade da imagem',
      status: 'pending',
      description: 'Verificando nitidez, iluminação e enquadramento'
    },
    {
      id: 'processing',
      title: 'Processando com IA avançada',
      status: 'pending',
      description: 'Analisando marca, modelo e características'
    },
    {
      id: 'matching',
      title: 'Buscando correspondências',
      status: 'pending',
      description: 'Comparando com base de dados de relógios'
    },
    {
      id: 'results',
      title: 'Preparando resultados',
      status: 'pending',
      description: 'Organizando informações encontradas'
    }
  ];

  const updateAnalysisStep = (stepId: string, status: AnalysisStep['status'], description?: string) => {
    setAnalysisSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, description: description || step.description }
        : step
    ));
  };

  const handleClose = () => {
    router.back();
  };

  const handleConfigureAI = () => {
    router.push('/ai-settings');
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
    // Check if any API is configured
    if (!config.isConfigured) {
      Alert.alert(
        '🤖 APIs não configuradas',
        'Para usar a identificação automática, configure pelo menos uma API (OpenAI ou Supabase) nas configurações.',
        [
          { text: 'Cancelar', onPress: resetCamera },
          { text: 'Configurar', onPress: handleConfigureAI },
        ]
      );
      return;
    }

    setAnalyzing(true);
    setCurrentAnalysis(null);
    const steps = initializeAnalysisSteps();
    setAnalysisSteps(steps);
    
    try {
      // Step 1: Validate image quality
      updateAnalysisStep('quality', 'processing');
      const compressedBase64 = await compressImage(imageUri);
      
      const qualityCheck = await validateImageQuality(compressedBase64);
      if (!qualityCheck.isValid && qualityCheck.issues.length > 0) {
        updateAnalysisStep('quality', 'completed', `Qualidade: ${qualityCheck.issues.join(', ')}`);
        // Continue anyway but warn user
      } else {
        updateAnalysisStep('quality', 'completed', 'Imagem com boa qualidade para análise');
      }

      // Step 2: AI Analysis
      updateAnalysisStep('processing', 'processing');
      const aiAnalysis = await analyzeWatchImage(compressedBase64);
      setCurrentAnalysis(aiAnalysis);
      updateAnalysisStep('processing', 'completed', 'Análise de IA concluída com sucesso');
      
      // Step 3: Find matches
      updateAnalysisStep('matching', 'processing');
      const matches = findMatchingWatches(aiAnalysis);
      updateAnalysisStep('matching', 'completed', `${matches.length} correspondências encontradas`);
      
      // Step 4: Prepare results
      updateAnalysisStep('results', 'processing');
      
      // Add to history if we have matches
      if (matches.length > 0) {
        const bestMatch = matches[0];
        bestMatch.imageUri = imageUri;
        addToHistory(bestMatch);
        incrementIdentifications();
      }
      
      updateAnalysisStep('results', 'completed', 'Resultados preparados');
      
      // Small delay to show completion
      setTimeout(() => {
        router.push({
          pathname: '/identification-results',
          params: {
            imageUri,
            analysisId: Date.now().toString(),
          },
        });
      }, 1000);
      
    } catch (error) {
      console.error('Erro na análise:', error);
      
      // Update failed step
      const currentStep = analysisSteps.find(step => step.status === 'processing');
      if (currentStep) {
        updateAnalysisStep(currentStep.id, 'error', 'Falha na análise');
      }
      
      Alert.alert(
        'Erro na Análise',
        'Não foi possível analisar a imagem. Verifique sua conexão e configuração das APIs.',
        [
          { text: 'Tentar Novamente', onPress: () => analyzeImage(imageUri) },
          { text: 'Configurar APIs', onPress: handleConfigureAI },
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
    setAnalysisSteps([]);
  };

  const getStepIcon = (status: AnalysisStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} color={Colors.success} />;
      case 'processing':
        return <ActivityIndicator size={20} color={Colors.primary} />;
      case 'error':
        return <AlertCircle size={20} color={Colors.error} />;
      default:
        return <View style={styles.pendingDot} />;
    }
  };

  const getConfigurationStatus = () => {
    const statuses = [];
    if (config.isOpenAIConfigured) {
      statuses.push(config.openaiValid ? '🧠 OpenAI ✅' : '🧠 OpenAI ⚠️');
    }
    if (config.isSupabaseConfigured) {
      statuses.push(config.supabaseValid ? '🗄️ Supabase ✅' : '🗄️ Supabase ⚠️');
    }
    if (statuses.length === 0) {
      return '❌ Nenhuma API configurada';
    }
    return statuses.join(' | ');
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.permissionTitle}>Acesso à Câmera Necessário</Text>
        <Text style={styles.permissionText}>
          Precisamos do acesso à câmera para identificar relógios usando IA avançada. 
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
          {isAnalyzing ? '🤖 Analisando com IA...' : '📸 Identificar Relógio'}
        </Text>
        <Pressable onPress={handleConfigureAI} style={styles.settingsButton}>
          <Settings size={20} color={Colors.white} />
        </Pressable>
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
                Posicione o relógio no centro do quadro
              </Text>
              <Text style={styles.frameSubInstruction}>
                {getConfigurationStatus()}
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
            <Text style={styles.instructionsTitle}>🎯 Dicas para melhor identificação:</Text>
            <Text style={styles.instructionsText}>
              • Posicione o mostrador claramente visível{'
'}
              • Garanta boa iluminação sem reflexos{'
'}
              • Mantenha a câmera estável{'
'}
              • Inclua a marca/logo se possível{'
'}
              • Evite sombras sobre o relógio
            </Text>
            {!config.isConfigured && (
              <View style={styles.apiWarning}>
                <Text style={styles.apiWarningText}>
                  ⚠️ Configure pelo menos uma API para identificação automática
                </Text>
              </View>
            )}
          </View>
        </>
      ) : (
        <View style={styles.resultContainer}>
          <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
          
          {isAnalyzing ? (
            <View style={styles.analyzingContainer}>
              <Text style={styles.analyzingTitle}>🤖 Análise Inteligente em Andamento</Text>
              <Text style={styles.analyzingSubtext}>
                Nossa IA está processando sua imagem com tecnologia avançada
              </Text>
              
              <View style={styles.stepsContainer}>
                {analysisSteps.map((step, index) => (
                  <View key={step.id} style={styles.stepItem}>
                    <View style={styles.stepIcon}>
                      {getStepIcon(step.status)}
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={[
                        styles.stepTitle,
                        step.status === 'completed' && styles.stepTitleCompleted,
                        step.status === 'error' && styles.stepTitleError,
                      ]}>
                        {step.title}
                      </Text>
                      <Text style={styles.stepDescription}>
                        {step.description}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.resultActions}>
              <Button
                title="📸 Tentar Novamente"
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
    backgroundColor: 'rgba(0,0,0,0.8)',
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
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  frameSubInstruction: {
    color: Colors.white,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.8,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.9)',
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
  apiWarning: {
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.warning + '20',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  apiWarningText: {
    fontSize: 14,
    color: Colors.warning,
    fontWeight: '500',
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
    padding: 20,
  },
  analyzingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  analyzingSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  stepsContainer: {
    flex: 1,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray[400],
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  stepTitleCompleted: {
    color: Colors.success,
  },
  stepTitleError: {
    color: Colors.error,
  },
  stepDescription: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  resultActions: {
    padding: 20,
  },
});