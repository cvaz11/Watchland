export interface Watch {
  id: string;
  brand: string;
  model: string;
  reference: string;
  imageUrl: string;
  price: string;
  year?: string;
  description?: string;
  movement?: string;
  caseMaterial?: string;
  caseSize?: string;
  waterResistance?: string;
  isFavorite?: boolean;
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