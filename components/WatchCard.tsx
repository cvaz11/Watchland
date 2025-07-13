import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View, Pressable, Image } from 'react-native';

import Colors from '@/constants/colors';
import { useFavoritesStore } from '@/store/favorites-store';
import { Watch } from '@/types/watch';

interface WatchCardProps {
  watch: Watch;
  size?: 'small' | 'medium' | 'large';
}

export default function WatchCard({ watch, size = 'medium' }: WatchCardProps) {
  const router = useRouter();
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const favorite = isFavorite(watch.id);

  const handlePress = () => {
    router.push(`/watch/${watch.id}`);
  };

  const toggleFavorite = (e: any) => {
    e.stopPropagation();
    if (favorite) {
      removeFavorite(watch.id);
    } else {
      addFavorite(watch);
    }
  };

  const cardStyles = {
    small: {
      container: styles.smallContainer,
      image: styles.smallImage,
      content: styles.smallContent,
    },
    medium: {
      container: styles.mediumContainer,
      image: styles.mediumImage,
      content: styles.mediumContent,
    },
    large: {
      container: styles.largeContainer,
      image: styles.largeImage,
      content: styles.largeContent,
    },
  };

  return (
    <Pressable
      style={[styles.container, cardStyles[size].container]}
      onPress={handlePress}
    >
      <Image
        source={{ uri: watch.imageUrl }}
        style={[styles.image, cardStyles[size].image]}
      />
      <View style={[styles.content, cardStyles[size].content]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>{watch.brand}</Text>
            <Text style={styles.model}>{watch.model}</Text>
          </View>
          <Pressable onPress={toggleFavorite} style={styles.favoriteButton}>
            <Heart
              size={22}
              color={favorite ? Colors.accent : Colors.gray[400]}
              fill={favorite ? Colors.accent : 'none'}
            />
          </Pressable>
        </View>
        {size === 'large' && (
          <Text style={styles.description} numberOfLines={2}>
            {watch.description}
          </Text>
        )}
        <View style={styles.footer}>
          <Text style={styles.price}>{watch.price}</Text>
          {size !== 'small' && (
            <Text style={styles.reference}>Ref: {watch.reference}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  smallContainer: {
    width: '48%',
  },
  mediumContainer: {
    width: '100%',
  },
  largeContainer: {
    width: '100%',
  },
  image: {
    width: '100%',
    backgroundColor: Colors.gray[200],
  },
  smallImage: {
    height: 120,
  },
  mediumImage: {
    height: 180,
  },
  largeImage: {
    height: 220,
  },
  content: {
    padding: 12,
  },
  smallContent: {
    padding: 8,
  },
  mediumContent: {
    padding: 12,
  },
  largeContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  brand: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  model: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  price: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  reference: {
    fontSize: 12,
    color: Colors.gray[500],
  },
  favoriteButton: {
    padding: 4,
  },
});