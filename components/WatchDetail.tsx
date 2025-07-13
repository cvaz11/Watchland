import { Heart, Share2 } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View, Image, ScrollView, Pressable } from 'react-native';

import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { useFavoritesStore } from '@/store/favorites-store';
import { Watch } from '@/types/watch';

interface WatchDetailProps {
  watch: Watch;
}

export default function WatchDetail({ watch }: WatchDetailProps) {
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const favorite = isFavorite(watch.id);

  const toggleFavorite = () => {
    if (favorite) {
      removeFavorite(watch.id);
    } else {
      addFavorite(watch);
    }
  };

  const handleShare = () => {
    // In a real app, this would use the Share API
    console.log('Sharing watch:', watch.brand, watch.model);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Image source={{ uri: watch.imageUrl }} style={styles.image} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>{watch.brand}</Text>
            <Text style={styles.model}>{watch.model}</Text>
            <Text style={styles.reference}>Ref: {watch.reference}</Text>
          </View>
          <Text style={styles.price}>{watch.price}</Text>
        </View>

        <View style={styles.actions}>
          <Button
            title={favorite ? "Remove from Favorites" : "Add to Favorites"}
            onPress={toggleFavorite}
            variant={favorite ? "outline" : "primary"}
            icon={<Heart size={18} color={favorite ? Colors.primary : Colors.white} fill={favorite ? Colors.primary : 'none'} />}
          />
          <Pressable style={styles.shareButton} onPress={handleShare}>
            <Share2 size={22} color={Colors.primary} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{watch.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specifications</Text>
          <View style={styles.specs}>
            {watch.year && (
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Year</Text>
                <Text style={styles.specValue}>{watch.year}</Text>
              </View>
            )}
            {watch.movement && (
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Movement</Text>
                <Text style={styles.specValue}>{watch.movement}</Text>
              </View>
            )}
            {watch.caseMaterial && (
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Case Material</Text>
                <Text style={styles.specValue}>{watch.caseMaterial}</Text>
              </View>
            )}
            {watch.caseSize && (
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Case Size</Text>
                <Text style={styles.specValue}>{watch.caseSize}</Text>
              </View>
            )}
            {watch.waterResistance && (
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Water Resistance</Text>
                <Text style={styles.specValue}>{watch.waterResistance}</Text>
              </View>
            )}
          </View>
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
  image: {
    width: '100%',
    height: 300,
    backgroundColor: Colors.gray[200],
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  brand: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  model: {
    fontSize: 18,
    color: Colors.text,
    marginBottom: 4,
  },
  reference: {
    fontSize: 14,
    color: Colors.gray[600],
  },
  price: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
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
  description: {
    fontSize: 16,
    color: Colors.textLight,
    lineHeight: 24,
  },
  specs: {
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    padding: 16,
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  specLabel: {
    fontSize: 14,
    color: Colors.gray[600],
  },
  specValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
});