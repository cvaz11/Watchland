import { useRouter } from 'expo-router';
import { Camera, Search } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';

import Button from '@/components/Button';
import Colors from '@/constants/colors';

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
        <Text style={styles.title}>Descobrir</Text>
        <Text style={styles.subtitle}>Identifique e colecione relógios</Text>
      </View>

      <View style={styles.actionsContainer}>
        <Button
          title="Identificar Relógio"
          onPress={handleIdentifyWatch}
          variant="primary"
          size="large"
          icon={<Camera size={20} color={Colors.white} />}
          fullWidth
        />
        <View style={styles.buttonSpacing} />
        <Button
          title="Navegar Catálogo"
          onPress={handleBrowseCatalog}
          variant="outline"
          size="large"
          icon={<Search size={20} color={Colors.primary} />}
          fullWidth
        />
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
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.gray[600],
    textAlign: 'center',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  buttonSpacing: {
    height: 20,
  },
});