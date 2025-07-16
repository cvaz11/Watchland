export interface Watch {
  id: string;
  brand: string;
  model: string;
  reference: string;
  imageUrl: string;
  price: string;
  priceMin?: number;
  priceMax?: number;
  year?: string;
  description?: string;
  movement?: string;
  caseMaterial?: string;
  caseSize?: string;
  waterResistance?: string;
  dialColor?: string;
  braceletType?: string;
  complications?: string[];
  category?: string;
  keywords?: string[];
  isFavorite?: boolean;
  rarity?: 'common' | 'rare' | 'very_rare' | 'unicorn';
  priceTrend?: number; // Percentage change
}

export interface IdentificationResult {
  id: string;
  watch: Watch;
  confidence: number;
  aiAnalysis?: string;
  timestamp: string;
  imageUri: string;
}

export interface AIAnalysis {
  brand?: string;
  model?: string;
  caseMaterial?: string;
  dialColor?: string;
  braceletType?: string;
  complications?: string[];
  estimatedSize?: string;
  confidence?: string;
  description: string;
}

export interface FeedItem {
  id: string;
  type: 'watchOfTheDay' | 'didYouKnow' | 'trending';
  title: string;
  content: string;
  imageUrl: string;
  date: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  watchesSaved: number;
  identificationsCount: number;
  isPremium: boolean;
}

export interface IdentificationSettings {
  precision: 'high' | 'medium' | 'fast';
  showConfidence: boolean;
  saveHistory: boolean;
}

