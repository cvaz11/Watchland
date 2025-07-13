import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import WatchDetail from '@/components/WatchDetail';
import { watches } from '@/mocks/watches';

export default function WatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const watch = watches.find((w) => w.id === id);

  if (!watch) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <WatchDetail watch={watch} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});