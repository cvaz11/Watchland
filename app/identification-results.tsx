import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle, XCircle, Search, ArrowLeft, Sparkles, Brain, Target } from 'lucide-react-native';
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

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 70) return <Target size={16} color={Colors.white} />;
    if (confidence >= 50) return <Brain size={16} color={Colors.white} />;
    return <Sparkles size={16} color={Colors.white} />;
  };

  const handleWatchPress = (watchId: string) => {
    router.push(`/watch/${watchId}`);
  };

  const handleNoneOfThese = () => {
    Alert.alert(
      '🤔 Nos ajude a melhorar!',
      'Qual era o relógio correto? Sua resposta nos ajuda a treinar melhor nossa IA.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: '🔍 Buscar Manualmente',
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

  const renderAnalysisDetails = () => {
    if (!currentAnalysis) return null;

    const details = [
      { label: 'Marca', value: currentAnalysis.brand || 'Não identificada', icon: '🏷️' },
      { label: 'Modelo', value: currentAnalysis.model || 'Não identificado', icon: '⌚' },
      { label: 'Material', value: currentAnalysis.caseMaterial || 'Não determinado', icon: '🔧' },
      { label: 'Mostrador', value: currentAnalysis.dialColor || 'Não determinado', icon: '🎨' },
      { label: 'Pulseira', value: currentAnalysis.braceletType || 'Não determinada', icon: '📿' },
      { label: 'Tamanho', value: currentAnalysis.estimatedSize || 'Não determinado', icon: '📏' },
    ];

    return (
      <View style={styles.analysisDetails}>
        <Text style={styles.detailsTitle}>🤖 Análise Detalhada da IA</Text>
        <View style={styles.detailsGrid}>
          {details.map((detail, index) => (
            <View key={index} style={styles.detailItem}>
              <Text style={styles.detailIcon}>{detail.icon}</Text>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{detail.label}</Text>
                <Text style={styles.detailValue}>{detail.value}</Text>
              </View>
            </View>
          ))}
        </View>
        
        {currentAnalysis.complications && currentAnalysis.complications.length > 0 && (
          <View style={styles.complicationsContainer}>
            <Text style={styles.complicationsTitle}>⚙️ Complicações Identificadas:</Text>
            <View style={styles.complicationsList}>
              {currentAnalysis.complications.map((comp, index) => (
                <View key={index} style={styles.complicationChip}>
                  <Text style={styles.complicationText}>{comp}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  if (!currentAnalysis) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <XCircle size={64} color={Colors.error} />
        <Text style={styles.errorText}>Erro ao carregar resultados da análise</Text>
        <Text style={styles.errorSubtext}>
          Não foi possível recuperar os dados da identificação
        </Text>
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
        <Text style={styles.headerTitle}>🎯 IDENTIFICAÇÃO COMPLETA</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {imageUri && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.capturedImage} />
            <View style={styles.imageOverlay}>
              <Text style={styles.imageLabel}>📸 Imagem Analisada</Text>
            </View>
          </View>
        )}

        {renderAnalysisDetails()}

        <View style={styles.analysisSection}>
          <Text style={styles.sectionTitle}>💭 Observações da IA</Text>
          <View style={styles.analysisCard}>
            <Text style={styles.analysisText}>{currentAnalysis.description}</Text>
            {currentAnalysis.confidence && (
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>
                  Nível de Confiança: {currentAnalysis.confidence}
                </Text>
              </View>
            )}
          </View>
        </View>

        {matches.length > 0 ? (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>
              🎯 Possíveis Correspondências ({matches.length})
            </Text>
            <Text style={styles.sectionSubtitle}>
              Relógios similares encontrados em nossa base de dados
            </Text>
            
            {matches.map((match, index) => (
              <Pressable
                key={match.id}
                style={[
                  styles.resultCard,
                  index === 0 && styles.bestMatchCard
                ]}
                onPress={() => handleWatchPress(match.watch.id)}
              >
                {index === 0 && (
                  <View style={styles.bestMatchBadge}>
                    <Text style={styles.bestMatchText}>🏆 MELHOR CORRESPONDÊNCIA</Text>
                  </View>
                )}
                
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
                        {getConfidenceIcon(match.confidence)}
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
                  
                  {match.watch.description && (
                    <Text style={styles.resultDescription} numberOfLines={2}>
                      {match.watch.description}
                    </Text>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.noResultsSection}>
            <XCircle size={64} color={Colors.gray[400]} />
            <Text style={styles.noResultsTitle}>🔍 Nenhuma correspondência encontrada</Text>
            <Text style={styles.noResultsText}>
              Nossa IA analisou a imagem mas não encontrou relógios similares em nossa base de dados. 
              Isso pode acontecer com modelos muito raros ou imagens com pouca visibilidade.
            </Text>
            <View style={styles.noResultsSuggestions}>
              <Text style={styles.suggestionsTitle}>💡 Sugestões:</Text>
              <Text style={styles.suggestionText}>• Tente uma foto com melhor iluminação</Text>
              <Text style={styles.suggestionText}>• Posicione o mostrador mais claramente</Text>
              <Text style={styles.suggestionText}>• Busque manualmente no catálogo</Text>
            </View>
          </View>
        )}

        <View style={styles.actionsSection}>
          <Button
            title="❌ Nenhum destes está correto"
            onPress={handleNoneOfThese}
            variant="outline"
            fullWidth
          />
          <View style={styles.spacer} />
          <Button
            title="🔍 Buscar Manualmente no Catálogo"
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
  imageContainer: {
    position: 'relative',
  },
  capturedImage: {
    width: '100%',
    height: 250,
    backgroundColor: Colors.gray[200],
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  imageLabel: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  analysisDetails: {
    padding: 20,
    backgroundColor: Colors.white,
    marginBottom: 8,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: '45%',
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.gray[600],
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  complicationsContainer: {
    marginTop: 16,
  },
  complicationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  complicationsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  complicationChip: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  complicationText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '600',
  },
  analysisSection: {
    padding: 20,
    backgroundColor: Colors.white,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 16,
  },
  analysisCard: {
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    padding: 16,
  },
  analysisText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
    marginBottom: 12,
  },
  confidenceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  resultsSection: {
    padding: 20,
    backgroundColor: Colors.white,
    marginBottom: 8,
  },
  bestMatchCard: {
    borderWidth: 2,
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '05',
  },
  bestMatchBadge: {
    position: 'absolute',
    top: -8,
    left: 16,
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  bestMatchText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.5,
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
    position: 'relative',
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
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 12,
    color: Colors.textLight,
    lineHeight: 16,
  },
  noResultsSection: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: Colors.white,
    marginBottom: 8,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  noResultsSuggestions: {
    alignSelf: 'stretch',
    backgroundColor: Colors.gray[100],
    padding: 16,
    borderRadius: 12,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 4,
  },
  actionsSection: {
    padding: 20,
    paddingBottom: 40,
  },
  spacer: {
    height: 12,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.error,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 20,
    textAlign: 'center',
  },
});