import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle, XCircle, Search, ArrowLeft } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { useIdentificationStore } from '@/store/identification-store';
import { findMatchingWatches } from '@/services/watch-matching';

export default function IdentificationResultsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const { currentAnalysis, settings } = useIdentificationStore();

  const matches = useMemo(() => {
    if (!currentAnalysis) return [];
    return findMatchingWatches(currentAnalysis);
  }, [currentAnalysis]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return Colors.success;
    if (confidence >= 50) return Colors.warning;
    return Colors.error;
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 70) return 'Alta Confiança';
    if (confidence >= 50) return 'Média Confiança';
    return 'Baixa Confiança';
  };

  const handleWatchPress = (watchId: string) => {
    router.push(`/watch/${watchId}`);
  };

  const handleNoneOfThese = () => {
    Alert.alert(
      'Nos ajude a melhorar!',
      'Qual era o relógio correto?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Buscar Manualmente',
          onPress: () => router.push('/catalog'),
        },
      ]
    );
  };

  const handleSearchManually = () => {
    router.push('/catalog');
  };

  const handleBack = () => {
    router.back();
  };

  if (!currentAnalysis) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Erro ao carregar resultados</Text>
        <Button title="Voltar" onPress={handleBack} variant="outline" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>🔍 IDENTIFICAÇÃO COMPLETA</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.capturedImage} />
        )}

        <View style={styles.analysisSection}>
          <Text style={styles.sectionTitle}>Análise da IA</Text>
          <View style={styles.analysisCard}>
            <Text style={styles.analysisText}>{currentAnalysis.description}</Text>
            {currentAnalysis.confidence && (
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>
                  Confiança: {currentAnalysis.confidence}
                </Text>
              </View>
            )}
          </View>
        </View>

        {matches.length > 0 ? (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>Possíveis Correspondências</Text>
            
            {matches.map((match, index) => (
              <Pressable
                key={match.id}
                style={styles.resultCard}
                onPress={() => handleWatchPress(match.watch.id)}
              >
                <Image 
                  source={{ uri: match.watch.imageUrl }} 
                  style={styles.resultImage} 
                />
                
                <View style={styles.resultContent}>
                  <View style={styles.resultHeader}>
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultBrand}>{match.watch.brand}</Text>
                      <Text style={styles.resultModel}>{match.watch.model}</Text>
                      {match.watch.reference && (
                        <Text style={styles.resultReference}>
                          Ref: {match.watch.reference}
                        </Text>
                      )}
                    </View>
                    
                    {settings.showConfidence && (
                      <View style={[
                        styles.confidenceIndicator,
                        { backgroundColor: getConfidenceColor(match.confidence) }
                      ]}>
                        <CheckCircle size={16} color={Colors.white} />
                        <Text style={styles.confidencePercentage}>
                          {match.confidence}%
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  <Text style={styles.resultPrice}>{match.watch.price}</Text>
                  
                  {settings.showConfidence && (
                    <Text style={[
                      styles.confidenceLabel,
                      { color: getConfidenceColor(match.confidence) }
                    ]}>
                      {getConfidenceText(match.confidence)}
                    </Text>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.noResultsSection}>
            <XCircle size={64} color={Colors.gray[400]} />
            <Text style={styles.noResultsTitle}>Nenhuma correspondência encontrada</Text>
            <Text style={styles.noResultsText}>
              Não conseguimos identificar este relógio em nossa base de dados.
            </Text>
          </View>
        )}

        <View style={styles.actionsSection}>
          <Button
            title="❌ Nenhum destes"
            onPress={handleNoneOfThese}
            variant="outline"
            fullWidth
          />
          <View style={styles.spacer} />
          <Button
            title="🔍 Buscar Manualmente"
            onPress={handleSearchManually}
            variant="primary"
            icon={<Search size={20} color={Colors.white} />}
            fullWidth
          />
        </View>
      </ScrollView>
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
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  backButton: {
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
    color: Colors.primary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  capturedImage: {
    width: '100%',
    height: 250,
    backgroundColor: Colors.gray[200],
  },
  analysisSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  analysisCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  analysisText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
    marginBottom: 12,
  },
  confidenceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.gray[200],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  resultsSection: {
    padding: 20,
    paddingTop: 0,
  },
  resultCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    flexDirection: 'row',
  },
  resultImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: Colors.gray[200],
    marginRight: 16,
  },
  resultContent: {
    flex: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  resultInfo: {
    flex: 1,
  },
  resultBrand: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 2,
  },
  resultModel: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 2,
  },
  resultReference: {
    fontSize: 12,
    color: Colors.gray[600],
  },
  confidenceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  confidencePercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
    marginLeft: 4,
  },
  resultPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  confidenceLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  noResultsSection: {
    alignItems: 'center',
    padding: 40,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionsSection: {
    padding: 20,
    paddingBottom: 40,
  },
  spacer: {
    height: 12,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    marginBottom: 20,
  },
});