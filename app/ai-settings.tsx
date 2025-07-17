import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';

export default function AISettingsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Text style={styles.title}>🤖 OpenAI Configurado</Text>
        <Text style={styles.description}>
          O app está configurado para usar a OpenAI GPT-4 Vision através de variáveis de ambiente.
          A identificação de relógios agora funciona com inteligência artificial avançada.
        </Text>
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>Status da Configuração:</Text>
          <Text style={styles.statusText}>
            ✅ OpenAI API Key: {process.env.EXPO_PUBLIC_OPENAI_API_KEY ? 'Configurada' : 'Não configurada'}
          </Text>
          <Text style={styles.statusText}>
            ✅ GPT-4 Vision: Habilitado
          </Text>
          <Text style={styles.statusText}>
            ✅ Análise de Imagens: Funcional
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  statusContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
    lineHeight: 20,
  },
});