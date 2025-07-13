import { PlusCircle } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';
import WatchCard from '@/components/WatchCard';
import Colors from '@/constants/colors';
import { useFavoritesStore } from '@/store/favorites-store';
import { useRouter } from 'expo-router';

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { favorites } = useFavoritesStore();

  const handleAddWatch = () => {
    router.push('/camera');
  };

  if (favorites.length === 0) {
    return (
      <EmptyState
        title="No favorites yet"
        message="Start building your collection by identifying watches or browsing the catalog."
        icon={<PlusCircle size={64} color={Colors.gray[400]} />}
        action={
          <Button
            title="Add Watch"
            onPress={handleAddWatch}
            variant="primary"
            icon={<PlusCircle size={20} color={Colors.white} />}
          />
        }
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <WatchCard watch={item} />}
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
  listContent: {
    padding: 20,
  },
});