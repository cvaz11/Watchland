import { Watch, AIAnalysis, IdentificationResult } from '@/types/watch';
import { watchesDatabase } from '@/mocks/watches-database';

export function calculateMatchScore(watch: Watch, aiAnalysis: AIAnalysis): number {
  let score = 0;
  let maxScore = 0;

  // Brand matching (highest weight)
  maxScore += 40;
  if (aiAnalysis.brand && watch.brand.toLowerCase().includes(aiAnalysis.brand.toLowerCase())) {
    score += 40;
  } else if (aiAnalysis.brand && watch.keywords?.some(k => k.includes(aiAnalysis.brand.toLowerCase()))) {
    score += 20;
  }

  // Model matching
  maxScore += 30;
  if (aiAnalysis.model && watch.model.toLowerCase().includes(aiAnalysis.model.toLowerCase())) {
    score += 30;
  } else if (aiAnalysis.model && watch.keywords?.some(k => k.includes(aiAnalysis.model.toLowerCase()))) {
    score += 15;
  }

  // Case material matching
  maxScore += 10;
  if (aiAnalysis.caseMaterial && watch.caseMaterial?.toLowerCase().includes(aiAnalysis.caseMaterial.toLowerCase())) {
    score += 10;
  }

  // Dial color matching
  maxScore += 10;
  if (aiAnalysis.dialColor && watch.dialColor?.toLowerCase().includes(aiAnalysis.dialColor.toLowerCase())) {
    score += 10;
  }

  // Bracelet type matching
  maxScore += 5;
  if (aiAnalysis.braceletType && watch.braceletType?.toLowerCase().includes(aiAnalysis.braceletType.toLowerCase())) {
    score += 5;
  }

  // Complications matching
  maxScore += 5;
  if (aiAnalysis.complications && aiAnalysis.complications.length > 0) {
    const matchingComplications = aiAnalysis.complications.filter(comp =>
      watch.complications?.some(wComp => wComp.toLowerCase().includes(comp.toLowerCase()))
    );
    score += (matchingComplications.length / aiAnalysis.complications.length) * 5;
  }

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

export function findMatchingWatches(aiAnalysis: AIAnalysis): IdentificationResult[] {
  const matches = watchesDatabase.map(watch => ({
    id: `${Date.now()}-${Math.random()}`,
    watch,
    confidence: calculateMatchScore(watch, aiAnalysis),
    aiAnalysis: aiAnalysis.description,
    timestamp: new Date().toISOString(),
    imageUri: '', // Will be set by caller
  }));

  // Sort by confidence and return top 5
  return matches
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5)
    .filter(match => match.confidence > 10); // Only return matches with >10% confidence
}

export function searchWatches(query: string): Watch[] {
  const searchTerm = query.toLowerCase().trim();
  
  if (!searchTerm) return [];

  return watchesDatabase.filter(watch => {
    const searchableText = [
      watch.brand,
      watch.model,
      watch.reference,
      watch.description,
      ...(watch.keywords || []),
    ].join(' ').toLowerCase();

    return searchableText.includes(searchTerm);
  }).slice(0, 20); // Limit to 20 results
}

export function getWatchesByBrand(brand: string): Watch[] {
  return watchesDatabase.filter(watch => 
    watch.brand.toLowerCase() === brand.toLowerCase()
  );
}

export function getWatchesByPriceRange(minPrice: number, maxPrice: number): Watch[] {
  return watchesDatabase.filter(watch => {
    if (!watch.priceMin || !watch.priceMax) return false;
    return watch.priceMin <= maxPrice && watch.priceMax >= minPrice;
  });
}