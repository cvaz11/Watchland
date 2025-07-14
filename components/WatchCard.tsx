import { useRouter } from 'expo-router';
import { Heart, TrendingUp, TrendingDown } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View, Pressable, Image } from 'react-native';

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
      common: { emoji: '🟢', text: 'Comum', color: Colors.success },
      rare: { emoji: '🟡', text: 'Raro', color: Colors.warning },
      very_rare: { emoji: '🟠', text: 'Muito Raro', color: '#ff8c00' },
      unicorn: { emoji: '🔴', text: 'Unicórnio', color: Colors.error },
    };
    
    return rarityConfig[watch.rarity];
  };

  const getPriceTrend = () => {
    if (!watch.priceTrend) return null;
    
    const isPositive = watch.priceTrend > 0;
    return {
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? Colors.success : Colors.error,
      text: `${isPositive ? '+' : ''}${watch.priceTrend}%`,
    };
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
  const priceTrend = getPriceTrend();

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
        
        {/* Rarity Badge */}
        {showRarity && rarityInfo && (
          <View style={[styles.rarityBadge, { backgroundColor: rarityInfo.color + '20' }]}>
            <Text style={styles.rarityText}>
              {rarityInfo.emoji} {rarityInfo.text}
            </Text>
          </View>
        )}
        
        {/* Best Investment Badge */}
        {watch.isBestInvestment && (
          <View style={styles.investmentBadge}>
            <Text style={styles.investmentText}>💎 Melhor Investimento</Text>
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
        
        {size === 'large' && (
          <Text style={styles.description} numberOfLines={2}>
            {watch.description}
          </Text>
        )}
        
        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{watch.price}</Text>
            {priceTrend && (
              <View style={styles.trendContainer}>
                <priceTrend.icon size={14} color={priceTrend.color} />
                <Text style={[styles.trendText, { color: priceTrend.color }]}>
                  {priceTrend.text}
                </Text>
              </View>
            )}
          </View>
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
  rarityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  rarityText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
  },
  investmentBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  investmentText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.white,
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
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  price: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  reference: {
    fontSize: 12,
    color: Colors.gray[500],
  },
  favoriteButton: {
    padding: 4,
  },
});