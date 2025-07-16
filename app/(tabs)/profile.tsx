import { Crown, Settings, History, Bot } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View, Image, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { useUserStore } from '@/store/user-store';
import { useIdentificationStore } from '@/store/identification-store';
import { useAPIStore } from '@/store/api-store';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, isLoggedIn, login, logout } = useUserStore();
  const { history } = useIdentificationStore();
  const { config } = useAPIStore();

  const handleLogin = () => {
    login();
  };

  const handleLogout = () => {
    logout();
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  const handleHistory = () => {
    router.push('/identification-history');
  };

  const handleAISettings = () => {
    router.push('/ai-settings');
  };

  const handleUpgrade = () => {
    console.log('Navegar para upgrade premium');
  };

  if (!isLoggedIn || !user) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.title}>Bem-vindo ao ChronoLab</Text>
        <Text style={styles.subtitle}>
          Faça login para salvar sua coleção de relógios e histórico de identificações.
        </Text>
        <Button
          title="Entrar"
          onPress={handleLogin}
          variant="primary"
          size="large"
          fullWidth
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: insets.bottom + 20 },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <View>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
        </View>
        <Pressable onPress={handleSettings} style={styles.settingsButton}>
          <Settings size={24} color={Colors.gray[600]} />
        </Pressable>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.watchesSaved}</Text>
          <Text style={styles.statLabel}>Relógios Salvos</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{history.length}</Text>
          <Text style={styles.statLabel}>Identificações</Text>
        </View>
      </View>

      {!user.isPremium && (
        <View style={styles.premiumCard}>
          <View style={styles.premiumContent}>
            <Crown size={24} color={Colors.accent} />
            <View style={styles.premiumTextContainer}>
              <Text style={styles.premiumTitle}>Upgrade para Premium</Text>
              <Text style={styles.premiumDescription}>
                Tenha identificações ilimitadas, especificações detalhadas e histórico de preços.
              </Text>
            </View>
          </View>
          <Button
            title="Fazer Upgrade"
            onPress={handleUpgrade}
            variant="secondary"
            size="small"
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🤖 Inteligência Artificial</Text>
        <Pressable style={styles.menuItem} onPress={handleAISettings}>
          <View style={styles.menuItemContent}>
            <Bot size={20} color={Colors.primary} />
            <View style={styles.menuItemTextContainer}>
              <Text style={styles.menuItemText}>Configuração de IA</Text>
              <Text style={styles.menuItemSubtext}>
                {config.isConfigured 
                  ? config.isValid 
                    ? '✅ Conectado' 
                    : '⚠️ Erro de conexão'
                  : '❌ Não configurado'
                }
              </Text>
            </View>
          </View>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Identificações</Text>
        <Pressable style={styles.menuItem} onPress={handleHistory}>
          <View style={styles.menuItemContent}>
            <History size={20} color={Colors.primary} />
            <Text style={styles.menuItemText}>Histórico de Identificações</Text>
          </View>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conta</Text>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemText}>Editar Perfil</Text>
        </View>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemText}>Configurações de Notificação</Text>
        </View>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemText}>Configurações de Privacidade</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Suporte</Text>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemText}>Central de Ajuda</Text>
        </View>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemText}>Fale Conosco</Text>
        </View>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemText}>Sobre o ChronoLab</Text>
        </View>
      </View>

      <Button
        title="Sair"
        onPress={handleLogout}
        variant="outline"
        fullWidth
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
    backgroundColor: Colors.gray[200],
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: Colors.gray[600],
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
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
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.gray[600],
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: Colors.gray[300],
    alignSelf: 'center',
  },
  premiumCard: {
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
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  premiumTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  premiumDescription: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  menuItem: {
    backgroundColor: Colors.white,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 2,
  },
  menuItemSubtext: {
    fontSize: 12,
    color: Colors.gray[600],
  },
});