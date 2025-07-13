import { ChevronRight, Settings as SettingsIcon } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { useIdentificationStore } from '@/store/identification-store';

const PRECISION_OPTIONS = [
  { value: 'high', label: 'Alta Precisão', description: 'Análise mais detalhada (mais lenta)' },
  { value: 'medium', label: 'Precisão Média', description: 'Equilibrio entre velocidade e precisão' },
  { value: 'fast', label: 'Análise Rápida', description: 'Resultados mais rápidos (menos detalhada)' },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useIdentificationStore();

  const handlePrecisionChange = (precision: 'high' | 'medium' | 'fast') => {
    updateSettings({ precision });
  };

  const handleShowConfidenceChange = (showConfidence: boolean) => {
    updateSettings({ showConfidence });
  };

  const handleSaveHistoryChange = (saveHistory: boolean) => {
    updateSettings({ saveHistory });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <SettingsIcon size={24} color={Colors.primary} />
        <Text style={styles.headerTitle}>⚙️ Configurações da IA</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 20 },
        ]}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Precisão da Análise</Text>
          <Text style={styles.sectionDescription}>
            Escolha o nível de precisão para a identificação de relógios
          </Text>
          
          {PRECISION_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              style={[
                styles.optionItem,
                settings.precision === option.value && styles.optionItemSelected,
              ]}
              onPress={() => handlePrecisionChange(option.value as any)}
            >
              <View style={styles.optionContent}>
                <Text style={[
                  styles.optionTitle,
                  settings.precision === option.value && styles.optionTitleSelected,
                ]}>
                  {option.label}
                </Text>
                <Text style={[
                  styles.optionDescription,
                  settings.precision === option.value && styles.optionDescriptionSelected,
                ]}>
                  {option.description}
                </Text>
              </View>
              {settings.precision === option.value && (
                <View style={styles.selectedIndicator} />
              )}
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Exibição</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Mostrar Nível de Confiança</Text>
              <Text style={styles.settingDescription}>
                Exibir percentual de confiança nos resultados
              </Text>
            </View>
            <Switch
              value={settings.showConfidence}
              onValueChange={handleShowConfidenceChange}
              trackColor={{ false: Colors.gray[300], true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔄 Histórico</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Salvar Histórico de Identificações</Text>
              <Text style={styles.settingDescription}>
                Manter registro das suas identificações
              </Text>
            </View>
            <Switch
              value={settings.saveHistory}
              onValueChange={handleSaveHistoryChange}
              trackColor={{ false: Colors.gray[300], true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>ℹ️ Sobre a IA</Text>
          <Text style={styles.infoText}>
            Nosso sistema utiliza inteligência artificial avançada para analisar imagens de relógios 
            e identificar marca, modelo e características. A precisão pode variar dependendo da 
            qualidade da imagem e da visibilidade dos detalhes do relógio.
          </Text>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 16,
    lineHeight: 20,
  },
  optionItem: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: Colors.gray[200],
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: Colors.primary,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.textLight,
  },
  optionDescriptionSelected: {
    color: Colors.primary,
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    marginLeft: 12,
  },
  settingItem: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.textLight,
  },
  infoSection: {
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
});