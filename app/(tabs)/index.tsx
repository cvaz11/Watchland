import { useRouter } from 'expo-router';
import { Camera, Search } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View, ScrollView, Image } from 'react-native';

import Button from '@/components/Button';
import WatchCard from '@/components/WatchCard';
import Colors from '@/constants/colors';
import { featuredWatch } from '@/mocks/watches-database';
import { watchesDatabase } from '@/mocks/watches-database';

export default function DiscoverScreen() {
  const router = useRouter();

  const handleIdentifyWatch = () => {
    router.push('/camera');
  };

  const handleBrowseCatalog = () => {
    router.push('/catalog');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>ChronoLab</Text>
        <Text style={styles.subtitle}>Identifique e colecione relógios</Text>
      </View>

      <View style={styles.featuredContainer}>
        <Text style={styles.sectionTitle}>Relógio em Destaque</Text>
        <WatchCard watch={featuredWatch} size="large" />
      </View>

      <View style={styles.actionsContainer}>
        <Button
          title="🔍 Identificar Relógio"
          onPress={handleIdentifyWatch}
          variant="primary"
          size="large"
          icon={<Camera size={20} color={Colors.white} />}
          fullWidth
        />
        <View style={styles.spacer} />
        <Button
          title="📚 Navegar Catálogo"
          onPress={handleBrowseCatalog}
          variant="outline"
          size="large"
          icon={<Search size={20} color={Colors.primary} />}
          fullWidth
        />
      </View>

      <View style={styles.recentContainer}>
        <Text style={styles.sectionTitle}>Relógios Populares</Text>
        <View style={styles.recentGrid}>
          {watchesDatabase.slice(0, 4).map((watch) => (
            <View key={watch.id} style={styles.gridItem}>
              <WatchCard watch={watch} size="small" />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.appInfo}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1524592094857-4a48b078999c?q=80&w=1000' }}
          style={styles.appInfoImage}
        />
        <View style={styles.appInfoContent}>
          <Text style={styles.appInfoTitle}>ChronoLab Brasil</Text>
          <Text style={styles.appInfoText}>
            Identifique relógios com IA, construa sua coleção e mantenha-se atualizado 
            com as últimas novidades da relojoaria mundial.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray[600],
  },
  featuredContainer: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  actionsContainer: {
    padding: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.gray[200],
  },
  spacer: {
    height: 12,
  },
  recentContainer: {
    padding: 20,
  },
  recentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: 16,
  },
  appInfo: {
    margin: 20,
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 40,
  },
  appInfoImage: {
    width: '100%',
    height: 160,
    backgroundColor: Colors.gray[200],
  },
  appInfoContent: {
    padding: 20,
  },
  appInfoTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 8,
  },
  appInfoText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
});