import { ArrowLeft, CheckCircle, XCircle, Loader, AlertCircle, Key, Zap, Database } from 'lucide-react-native';
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
  const { 
    config, 
    isLoading, 
    updateConfig, 
    testOpenAIConnection, 
    testSupabaseConnection,
    clearOpenAIConfig,
    clearSupabaseConfig 
  } = useAPIStore();
  
  const [openaiKey, setOpenaiKey] = useState(config.openaiApiKey || '');
  const [supabaseUrl, setSupabaseUrl] = useState(config.supabaseUrl || '');
  const [supabaseKey, setSupabaseKey] = useState(config.supabaseAnonKey || '');
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showSupabaseKey, setShowSupabaseKey] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleSaveOpenAIConfig = () => {
    if (!openaiKey.trim()) {
      Alert.alert('Erro', 'Por favor, insira uma chave de API válida.');
      return;
    }

    updateConfig({
      openaiApiKey: openaiKey.trim(),
      isOpenAIConfigured: true,
    });

    Alert.alert('Sucesso', 'Configuração OpenAI salva! Teste a conexão para verificar se está funcionando.');
  };

  const handleSaveSupabaseConfig = () => {
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      Alert.alert('Erro', 'Por favor, insira a URL e chave anônima do Supabase.');
      return;
    }

    updateConfig({
      supabaseUrl: supabaseUrl.trim(),
      supabaseAnonKey: supabaseKey.trim(),
      isSupabaseConfigured: true,
    });

    Alert.alert('Sucesso', 'Configuração Supabase salva! Teste a conexão para verificar se está funcionando.');
  };

  const handleTestOpenAI = async () => {
    if (!openaiKey.trim()) {
      Alert.alert('Erro', 'Por favor, salve uma chave de API primeiro.');
      return;
    }

    const isValid = await testOpenAIConnection();
    
    if (isValid) {
      Alert.alert('✅ Sucesso', 'Conexão com OpenAI estabelecida com sucesso!');
    } else {
      Alert.alert('❌ Erro', 'Falha ao conectar com OpenAI. Verifique sua chave e conexão com a internet.');
    }
  };

  const handleTestSupabase = async () => {
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      Alert.alert('Erro', 'Por favor, salve as configurações do Supabase primeiro.');
      return;
    }

    const isValid = await testSupabaseConnection();
    
    if (isValid) {
      Alert.alert('✅ Sucesso', 'Conexão com Supabase estabelecida com sucesso!');
    } else {
      Alert.alert('❌ Erro', 'Falha ao conectar com Supabase. Verifique suas configurações e conexão com a internet.');
    }
  };

  const handleClearOpenAI = () => {
    Alert.alert(
      'Limpar Configuração OpenAI',
      'Tem certeza que deseja remover a configuração da OpenAI?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: () => {
            clearOpenAIConfig();
            setOpenaiKey('');
            Alert.alert('Sucesso', 'Configuração OpenAI removida.');
          },
        },
      ]
    );
  };

  const handleClearSupabase = () => {
    Alert.alert(
      'Limpar Configuração Supabase',
      'Tem certeza que deseja remover a configuração do Supabase?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: () => {
            clearSupabaseConfig();
            setSupabaseUrl('');
            setSupabaseKey('');
            Alert.alert('Sucesso', 'Configuração Supabase removida.');
          },
        },
      ]
    );
  };

  const getOpenAIStatusColor = () => {
    if (config.openaiValid === true) return Colors.success;
    if (config.openaiValid === false) return Colors.error;
    return Colors.gray[400];
  };

  const getSupabaseStatusColor = () => {
    if (config.supabaseValid === true) return Colors.success;
    if (config.supabaseValid === false) return Colors.error;
    return Colors.gray[400];
  };

  const getOpenAIStatusText = () => {
    if (isLoading) return 'Testando...';
    if (config.openaiValid === true) return 'Conectado';
    if (config.openaiValid === false) return 'Erro de conexão';
    if (config.isOpenAIConfigured) return 'Não testado';
    return 'Não configurado';
  };

  const getSupabaseStatusText = () => {
    if (isLoading) return 'Testando...';
    if (config.supabaseValid === true) return 'Conectado';
    if (config.supabaseValid === false) return 'Erro de conexão';
    if (config.isSupabaseConfigured) return 'Não testado';
    return 'Não configurado';
  };

  const getStatusIcon = (isValid?: boolean) => {
    if (isLoading) return <Loader size={16} color={Colors.gray[400]} />;
    if (isValid === true) return <CheckCircle size={16} color={Colors.success} />;
    if (isValid === false) return <XCircle size={16} color={Colors.error} />;
    return <AlertCircle size={16} color={Colors.gray[400]} />;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>🤖 Configuração de APIs</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 20 },
        ]}
      >
        {/* OpenAI Section */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>🧠 OpenAI GPT-4 Vision</Text>
            <View style={styles.statusIndicator}>
              {getStatusIcon(config.openaiValid)}
              <Text style={[styles.statusText, { color: getOpenAIStatusColor() }]}>
                {getOpenAIStatusText()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔑 Configuração OpenAI</Text>
          <Text style={styles.sectionDescription}>
            Configure sua chave da API OpenAI para habilitar a identificação automática de relógios com IA.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Chave da API OpenAI</Text>
            <View style={styles.inputWrapper}>
              <Key size={20} color={Colors.gray[500]} />
              <TextInput
                style={styles.input}
                value={openaiKey}
                onChangeText={setOpenaiKey}
                placeholder="sk-..."
                placeholderTextColor={Colors.gray[500]}
                secureTextEntry={!showOpenAIKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Pressable
                onPress={() => setShowOpenAIKey(!showOpenAIKey)}
                style={styles.toggleButton}
              >
                <Text style={styles.toggleText}>{showOpenAIKey ? 'Ocultar' : 'Mostrar'}</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.buttonGroup}>
            <Button
              title="💾 Salvar OpenAI"
              onPress={handleSaveOpenAIConfig}
              variant="primary"
              fullWidth
            />
            <View style={styles.buttonSpacing} />
            <Button
              title="🧪 Testar OpenAI"
              onPress={handleTestOpenAI}
              variant="outline"
              loading={isLoading}
              disabled={!openaiKey.trim()}
              fullWidth
            />
          </View>

          {config.isOpenAIConfigured && (
            <Button
              title="🗑️ Limpar OpenAI"
              onPress={handleClearOpenAI}
              variant="outline"
              fullWidth
            />
          )}
        </View>

        {/* Supabase Section */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>🗄️ Supabase Database</Text>
            <View style={styles.statusIndicator}>
              {getStatusIcon(config.supabaseValid)}
              <Text style={[styles.statusText, { color: getSupabaseStatusColor() }]}>
                {getSupabaseStatusText()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗄️ Configuração Supabase</Text>
          <Text style={styles.sectionDescription}>
            Configure sua conexão com Supabase para armazenar dados de identificações e histórico.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>URL do Projeto Supabase</Text>
            <View style={styles.inputWrapper}>
              <Database size={20} color={Colors.gray[500]} />
              <TextInput
                style={styles.input}
                value={supabaseUrl}
                onChangeText={setSupabaseUrl}
                placeholder="https://seu-projeto.supabase.co"
                placeholderTextColor={Colors.gray[500]}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Chave Anônima (anon key)</Text>
            <View style={styles.inputWrapper}>
              <Key size={20} color={Colors.gray[500]} />
              <TextInput
                style={styles.input}
                value={supabaseKey}
                onChangeText={setSupabaseKey}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                placeholderTextColor={Colors.gray[500]}
                secureTextEntry={!showSupabaseKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Pressable
                onPress={() => setShowSupabaseKey(!showSupabaseKey)}
                style={styles.toggleButton}
              >
                <Text style={styles.toggleText}>{showSupabaseKey ? 'Ocultar' : 'Mostrar'}</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.buttonGroup}>
            <Button
              title="💾 Salvar Supabase"
              onPress={handleSaveSupabaseConfig}
              variant="primary"
              fullWidth
            />
            <View style={styles.buttonSpacing} />
            <Button
              title="🧪 Testar Supabase"
              onPress={handleTestSupabase}
              variant="outline"
              loading={isLoading}
              disabled={!supabaseUrl.trim() || !supabaseKey.trim()}
              fullWidth
            />
          </View>

          {config.isSupabaseConfigured && (
            <Button
              title="🗑️ Limpar Supabase"
              onPress={handleClearSupabase}
              variant="outline"
              fullWidth
            />
          )}
        </View>

        {config.lastTested && (
          <View style={styles.lastTestedCard}>
            <Text style={styles.lastTested}>
              Último teste: {new Date(config.lastTested).toLocaleString('pt-BR')}
            </Text>
          </View>
        )}

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>ℹ️ Como obter as chaves</Text>
          <View style={styles.infoSteps}>
            <Text style={styles.infoSubtitle}>OpenAI:</Text>
            <Text style={styles.infoStep}>1. Acesse platform.openai.com</Text>
            <Text style={styles.infoStep}>2. Faça login ou crie uma conta</Text>
            <Text style={styles.infoStep}>3. Vá para "API Keys" no menu</Text>
            <Text style={styles.infoStep}>4. Clique em "Create new secret key"</Text>
            <Text style={styles.infoStep}>5. Copie e cole a chave aqui</Text>
            
            <Text style={[styles.infoSubtitle, { marginTop: 16 }]}>Supabase:</Text>
            <Text style={styles.infoStep}>1. Acesse supabase.com</Text>
            <Text style={styles.infoStep}>2. Crie um projeto ou acesse existente</Text>
            <Text style={styles.infoStep}>3. Vá para Settings → API</Text>
            <Text style={styles.infoStep}>4. Copie a URL e anon key</Text>
            <Text style={styles.infoStep}>5. Cole as informações aqui</Text>
          </View>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>⚡ Recursos Disponíveis</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Zap size={16} color={Colors.primary} />
              <Text style={styles.featureText}>Identificação automática com OpenAI</Text>
            </View>
            <View style={styles.featureItem}>
              <Zap size={16} color={Colors.primary} />
              <Text style={styles.featureText}>Armazenamento seguro com Supabase</Text>
            </View>
            <View style={styles.featureItem}>
              <Zap size={16} color={Colors.primary} />
              <Text style={styles.featureText}>Histórico sincronizado na nuvem</Text>
            </View>
            <View style={styles.featureItem}>
              <Zap size={16} color={Colors.primary} />
              <Text style={styles.featureText}>Backup automático dos dados</Text>
            </View>
          </View>
        </View>

        <View style={styles.warningSection}>
          <Text style={styles.warningTitle}>⚠️ Importante</Text>
          <Text style={styles.warningText}>
            • Suas chaves são armazenadas localmente no dispositivo{"\n"}
            • Nunca compartilhe suas chaves com terceiros{"\n"}
            • O uso das APIs pode gerar custos{"\n"}
            • Sem as APIs, você ainda pode usar busca manual{"\n"}
            • Supabase oferece tier gratuito generoso
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
    marginBottom: 16,
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
  lastTestedCard: {
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  lastTested: {
    fontSize: 12,
    color: Colors.gray[600],
    textAlign: 'center',
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
    marginBottom: 16,
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
    gap: 4,
  },
  infoSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 8,
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