import { ArrowLeft, CheckCircle, XCircle, Loader, AlertCircle, Key, Zap } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { useAPIStore } from '@/store/api-store';

export default function AISettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { config, isLoading, updateConfig, testConnection, clearConfig } = useAPIStore();
  const [apiKey, setApiKey] = useState(config.openaiApiKey || '');
  const [showKey, setShowKey] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleSaveConfig = () => {
    if (!apiKey.trim()) {
      Alert.alert('Erro', 'Por favor, insira uma chave de API válida.');
      return;
    }

    updateConfig({
      openaiApiKey: apiKey.trim(),
      isConfigured: true,
    });

    Alert.alert('Sucesso', 'Configuração salva! Teste a conexão para verificar se está funcionando.');
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Erro', 'Por favor, salve uma chave de API primeiro.');
      return;
    }

    const isValid = await testConnection();
    
    if (isValid) {
      Alert.alert('✅ Sucesso', 'Conexão com a API estabelecida com sucesso!');
    } else {
      Alert.alert('❌ Erro', 'Falha ao conectar com a API. Verifique sua chave e conexão com a internet.');
    }
  };

  const handleClearConfig = () => {
    Alert.alert(
      'Limpar Configuração',
      'Tem certeza que deseja remover a configuração da API?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: () => {
            clearConfig();
            setApiKey('');
            Alert.alert('Sucesso', 'Configuração removida.');
          },
        },
      ]
    );
  };

  const getStatusColor = () => {
    if (config.isValid === true) return Colors.success;
    if (config.isValid === false) return Colors.error;
    return Colors.gray[400];
  };

  const getStatusText = () => {
    if (isLoading) return 'Testando...';
    if (config.isValid === true) return 'Conectado';
    if (config.isValid === false) return 'Erro de conexão';
    if (config.isConfigured) return 'Não testado';
    return 'Não configurado';
  };

  const getStatusIcon = () => {
    if (isLoading) return <Loader size={16} color={Colors.gray[400]} />;
    if (config.isValid === true) return <CheckCircle size={16} color={Colors.success} />;
    if (config.isValid === false) return <XCircle size={16} color={Colors.error} />;
    return <AlertCircle size={16} color={Colors.gray[400]} />;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>🤖 Configuração de IA</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 20 },
        ]}
      >
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Status da Conexão</Text>
            <View style={styles.statusIndicator}>
              {getStatusIcon()}
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusText()}
              </Text>
            </View>
          </View>
          
          {config.lastTested && (
            <Text style={styles.lastTested}>
              Último teste: {new Date(config.lastTested).toLocaleString('pt-BR')}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔑 Configuração da API</Text>
          <Text style={styles.sectionDescription}>
            Configure sua chave da API OpenAI para habilitar a identificação automática de relógios com IA.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Chave da API OpenAI</Text>
            <View style={styles.inputWrapper}>
              <Key size={20} color={Colors.gray[500]} />
              <TextInput
                style={styles.input}
                value={apiKey}
                onChangeText={setApiKey}
                placeholder="sk-..."
                placeholderTextColor={Colors.gray[500]}
                secureTextEntry={!showKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Pressable
                onPress={() => setShowKey(!showKey)}
                style={styles.toggleButton}
              >
                <Text style={styles.toggleText}>{showKey ? 'Ocultar' : 'Mostrar'}</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.buttonGroup}>
            <Button
              title="💾 Salvar Configuração"
              onPress={handleSaveConfig}
              variant="primary"
              fullWidth
            />
            <View style={styles.buttonSpacing} />
            <Button
              title="🧪 Testar Conexão"
              onPress={handleTestConnection}
              variant="outline"
              loading={isLoading}
              disabled={!apiKey.trim()}
              fullWidth
            />
          </View>

          {config.isConfigured && (
            <Button
              title="🗑️ Limpar Configuração"
              onPress={handleClearConfig}
              variant="outline"
              fullWidth
            />
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>ℹ️ Como obter uma chave da API</Text>
          <View style={styles.infoSteps}>
            <Text style={styles.infoStep}>1. Acesse platform.openai.com</Text>
            <Text style={styles.infoStep}>2. Faça login ou crie uma conta</Text>
            <Text style={styles.infoStep}>3. Vá para "API Keys" no menu</Text>
            <Text style={styles.infoStep}>4. Clique em "Create new secret key"</Text>
            <Text style={styles.infoStep}>5. Copie e cole a chave aqui</Text>
          </View>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>⚡ Recursos da IA</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Zap size={16} color={Colors.primary} />
              <Text style={styles.featureText}>Identificação automática de marca e modelo</Text>
            </View>
            <View style={styles.featureItem}>
              <Zap size={16} color={Colors.primary} />
              <Text style={styles.featureText}>Análise de materiais e características</Text>
            </View>
            <View style={styles.featureItem}>
              <Zap size={16} color={Colors.primary} />
              <Text style={styles.featureText}>Estimativa de tamanho e complicações</Text>
            </View>
            <View style={styles.featureItem}>
              <Zap size={16} color={Colors.primary} />
              <Text style={styles.featureText}>Nível de confiança da identificação</Text>
            </View>
          </View>
        </View>

        <View style={styles.warningSection}>
          <Text style={styles.warningTitle}>⚠️ Importante</Text>
          <Text style={styles.warningText}>
            • Sua chave da API é armazenada localmente no dispositivo{'\n'}
            • Nunca compartilhe sua chave com terceiros{'\n'}
            • O uso da API pode gerar custos na OpenAI{'\n'}
            • Sem a API, você ainda pode usar busca manual
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
  contentContainer: {
    padding: 20,
  },
  statusCard: {
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
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  lastTested: {
    fontSize: 12,
    color: Colors.gray[600],
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
    marginBottom: 20,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.gray[300],
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.gray[200],
    borderRadius: 6,
  },
  toggleText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  buttonGroup: {
    marginBottom: 16,
  },
  buttonSpacing: {
    height: 12,
  },
  infoSection: {
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  infoSteps: {
    gap: 8,
  },
  infoStep: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  featuresSection: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 12,
    flex: 1,
  },
  warningSection: {
    backgroundColor: Colors.warning + '20',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
});