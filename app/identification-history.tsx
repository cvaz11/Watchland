import { Clock, Trash2 } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View, FlatList, Image, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import EmptyState from '@/components/EmptyState';
import Colors from '@/constants/colors';
import { useIdentificationStore } from '@/store/identification-store';

export default function IdentificationHistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { history, clearHistory } = useIdentificationStore();

  const handleWatchPress = (watchId: string) => {
    router.push(`/watch/${watchId}`);
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Limpar Histórico',
      'Tem certeza que deseja limpar todo o histórico de identificações?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpar', style: 'destructive', onPress: clearHistory },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return Colors.success;
    if (confidence >= 50) return Colors.warning;
    return Colors.error;
  };

  if (history.length === 0) {
    return (
      <EmptyState
        title="Nenhuma identificação ainda"
        message="Suas identificações de relógios aparecerão aqui."
        icon={<Clock size={64} color={Colors.gray[400]} />}
      />
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 Histórico de Identificações</Text>
        <Pressable onPress={handleClearHistory} style={styles.clearButton}>
          <Trash2 size={20} color={Colors.error} />
        </Pressable>
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.historyItem}
            onPress={() => handleWatchPress(item.watch.id)}
          >
            <Image source={{ uri: item.imageUri || item.watch.imageUrl }} style={styles.historyImage} />
            
            <View style={styles.historyContent}>
              <View style={styles.historyHeader}>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyBrand}>{item.watch.brand}</Text>
                  <Text style={styles.historyModel}>{item.watch.model}</Text>
                </View>
                
                <View style={[
                  styles.confidenceBadge,
                  { backgroundColor: getConfidenceColor(item.confidence) }
                ]}>
                  <Text style={styles.confidenceText}>{item.confidence}%</Text>
                </View>
              </View>
              
              <Text style={styles.historyPrice}>{item.watch.price}</Text>
              <Text style={styles.historyDate}>{formatDate(item.timestamp)}</Text>
            </View>
          </Pressable>
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      />
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
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
  },
  historyItem: {
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
  historyImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: Colors.gray[200],
    marginRight: 16,
  },
  historyContent: {
    flex: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  historyInfo: {
    flex: 1,
  },
  historyBrand: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 2,
  },
  historyModel: {
    fontSize: 14,
    color: Colors.text,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  historyPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: Colors.gray[600],
  },
});