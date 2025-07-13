import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';

import Colors from '@/constants/colors';
import { FeedItem } from '@/types/watch';

interface FeedCardProps {
  item: FeedItem;
}

export default function FeedCard({ item }: FeedCardProps) {
  const getBadgeColor = () => {
    switch (item.type) {
      case 'watchOfTheDay':
        return {
          bg: Colors.primary,
          text: Colors.white,
        };
      case 'didYouKnow':
        return {
          bg: Colors.accent,
          text: Colors.primary,
        };
      case 'trending':
        return {
          bg: Colors.success,
          text: Colors.white,
        };
      default:
        return {
          bg: Colors.gray[200],
          text: Colors.text,
        };
    }
  };

  const badgeColors = getBadgeColor();

  return (
    <View style={styles.container}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <View
          style={[styles.badge, { backgroundColor: badgeColors.bg }]}
        >
          <Text style={[styles.badgeText, { color: badgeColors.text }]}>
            {item.type === 'watchOfTheDay'
              ? 'Relógio do Dia'
              : item.type === 'didYouKnow'
              ? 'Você Sabia?'
              : 'Tendência'}
          </Text>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.content}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
    </View>
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
  image: {
    width: '100%',
    height: 180,
    backgroundColor: Colors.gray[200],
  },
  content: {
    padding: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
    marginBottom: 12,
  },
  date: {
    fontSize: 12,
    color: Colors.gray[500],
  },
});