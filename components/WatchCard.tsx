import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View, Pressable, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import Colors from '@/constants/colors';
import { useFavoritesStore } from '@/store/favorites-store';
import { Watch } from '@/types/watch';

interface WatchCardProps {
  watch: Watch;
  size?: 'small' | 'medium' | 'large';
  showRarity?: boolean;
}

export default function WatchCard({ watch, size = 'medium', showRarity = false }: WatchCardProps) {
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

  const getRarityInfo = () => {
    if (!watch.rarity) return null;
    
    const rarityConfig = {
      common: { 
        emoji: '🟢', 
        text: 'Comum',
        gradientColors: ['rgba(34, 197, 94, 0.9)', 'rgba(22, 163, 74, 0.85)'] as const,
        shadowColor: 'rgba(34, 197, 94, 0.4)',
      },
      rare: { 
        emoji: '🟡', 
        text: 'Raro',
        gradientColors: ['rgba(251, 191, 36, 0.9)', 'rgba(245, 158, 11, 0.85)'] as const,
        shadowColor: 'rgba(251, 191, 36, 0.4)',
      },
      very_rare: { 
        emoji: '🟠', 
        text: 'Muito Raro',
        gradientColors: ['rgba(249, 115, 22, 0.9)', 'rgba(234, 88, 12, 0.85)'] as const,
        shadowColor: 'rgba(249, 115, 22, 0.4)',
      },
      unicorn: { 
        emoji: '🔴', 
        text: 'Unicórnio',
        gradientColors: ['rgba(239, 68, 68, 0.9)', 'rgba(220, 38, 38, 0.85)'] as const,
        shadowColor: 'rgba(239, 68, 68, 0.4)',
      },
    };
    
    return rarityConfig[watch.rarity];
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

  const rarityInfo = getRarityInfo();

  return (
    <Pressable
      style={[styles.container, cardStyles[size].container]}
      onPress={handlePress}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: watch.imageUrl }}
          style={[styles.image, cardStyles[size].image]}
        />
        
        {showRarity && rarityInfo && (
          <View style={styles.rarityBadgeContainer}>
            <LinearGradient
              colors={rarityInfo.gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.rarityBadge,
                {
                  shadowColor: rarityInfo.shadowColor,
                }
              ]}
            >
              <View style={styles.rarityBadgeInner}>
                <Text style={styles.rarityText}>
                  {rarityInfo.emoji} {rarityInfo.text}
                </Text>
              </View>
            </LinearGradient>
          </View>
        )}
      </View>
      
      <View style={[styles.content, cardStyles[size].content]}>
        <View style={styles.header}>
          <View style={styles.watchInfo}>
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
        
        {size === 'large' && watch.description && (
          <Text style={styles.description} numberOfLines={2}>
            {watch.description}
          </Text>
        )}
        
        <View style={styles.footer}>
          <Text style={styles.price}>{watch.price}</Text>
          {size !== 'small' && watch.reference && (
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
  imageContainer: {
    position: 'relative',
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
  rarityBadgeContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  rarityBadge: {
    borderRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  rarityBadgeInner: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  rarityText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
  watchInfo: {
    flex: 1,
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
    marginTop: 4,
  },
  price: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  reference: {
    fontSize: 12,
    color: Colors.gray[500],
  },
  favoriteButton: {
    padding: 4,
  },
});