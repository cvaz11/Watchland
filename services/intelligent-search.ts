import { trpcClient } from '@/lib/trpc';
import { Watch } from '@/types/watch';
import { watchesDatabase } from '@/mocks/watches-database';

interface SearchCriteria {
  brand?: string;
  model?: string;
  color?: string;
  material?: string;
  bracelet?: string;
  category?: string;
  priceMax?: number;
  priceMin?: number;
  keywords: string[];
  originalQuery: string;
}

interface IntelligentSearchResult {
  results: Watch[];
  searchCriteria: SearchCriteria | null;
  suggestions: string[];
}

function convertPriceToBRL(price: string, rates: any): string {
  if (!rates) return price;

  // Se já está em BRL, retornar como está
  if (price.includes('R$')) {
    return price;
  }

  // Extrair valores numéricos e detectar moeda
  const priceRegex = /([A-Z$£€¥₹]+)\s*([0-9,.\s]+)(?:\s*-\s*([A-Z$£€¥₹]*)\s*([0-9,.\s]+))?/i;
  const match = price.match(priceRegex);
  
  if (!match) return price;

  const currencySymbol = match[1];
  const minValue = parseFloat(match[2].replace(/[,\s]/g, ''));
  const maxValue = match[4] ? parseFloat(match[4].replace(/[,\s]/g, '')) : minValue;

  // Mapear símbolos para códigos de moeda
  const currencyMap: { [key: string]: string } = {
    '$': 'USD',
    '€': 'EUR', 
    '£': 'GBP',
    '¥': 'JPY',
    '₹': 'INR'
  };

  const currencyCode = currencyMap[currencySymbol] || 'USD';
  const rate = rates.BRL / (rates[currencyCode] || 1);

  const minBRL = Math.round(minValue * rate);
  const maxBRL = Math.round(maxValue * rate);

  if (minBRL === maxBRL) {
    return `R$ ${minBRL.toLocaleString('pt-BR')}`;
  }

  return `R$ ${minBRL.toLocaleString('pt-BR')} - R$ ${maxBRL.toLocaleString('pt-BR')}`;
}

function calculateRelevanceScore(watch: Watch, criteria: SearchCriteria): number {
  let score = 0;
  let maxScore = 0;

  // Brand matching (peso alto)
  maxScore += 40;
  if (criteria.brand && watch.brand.toLowerCase().includes(criteria.brand.toLowerCase())) {
    score += 40;
  } else if (criteria.brand && watch.keywords?.some(k => k.includes(criteria.brand?.toLowerCase() || ''))) {
    score += 20;
  }

  // Model matching (peso alto)
  maxScore += 30;
  if (criteria.model && watch.model.toLowerCase().includes(criteria.model.toLowerCase())) {
    score += 30;
  } else if (criteria.model && watch.keywords?.some(k => k.includes(criteria.model?.toLowerCase() || ''))) {
    score += 15;
  }

  // Color matching
  maxScore += 10;
  if (criteria.color && watch.dialColor?.toLowerCase().includes(criteria.color.toLowerCase())) {
    score += 10;
  }

  // Material matching
  maxScore += 10;
  if (criteria.material && watch.caseMaterial?.toLowerCase().includes(criteria.material.toLowerCase())) {
    score += 10;
  }

  // Category matching
  maxScore += 5;
  if (criteria.category && watch.category?.toLowerCase().includes(criteria.category.toLowerCase())) {
    score += 5;
  }

  // Price range matching
  maxScore += 5;
  if (criteria.priceMax && watch.priceMin && watch.priceMin <= criteria.priceMax) {
    score += 3;
  }
  if (criteria.priceMin && watch.priceMax && watch.priceMax >= criteria.priceMin) {
    score += 2;
  }

  // Keywords matching
  if (criteria.keywords.length > 0) {
    const watchText = [
      watch.brand,
      watch.model,
      watch.description,
      ...(watch.keywords || [])
    ].join(' ').toLowerCase();

    const matchingKeywords = criteria.keywords.filter(keyword =>
      watchText.includes(keyword.toLowerCase())
    );

    if (matchingKeywords.length > 0) {
      score += (matchingKeywords.length / criteria.keywords.length) * 10;
      maxScore += 10;
    }
  }

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

function filterWatchesByCriteria(criteria: SearchCriteria, exchangeRates: any): Watch[] {
  let filteredWatches = watchesDatabase.filter(watch => {
    // Brand filter
    if (criteria.brand && !watch.brand.toLowerCase().includes(criteria.brand.toLowerCase())) {
      const brandInKeywords = watch.keywords?.some(k => k.includes(criteria.brand?.toLowerCase() || ''));
      if (!brandInKeywords) return false;
    }

    // Model filter
    if (criteria.model && !watch.model.toLowerCase().includes(criteria.model.toLowerCase())) {
      const modelInKeywords = watch.keywords?.some(k => k.includes(criteria.model?.toLowerCase() || ''));
      if (!modelInKeywords) return false;
    }

    // Color filter
    if (criteria.color && watch.dialColor && !watch.dialColor.toLowerCase().includes(criteria.color.toLowerCase())) {
      return false;
    }

    // Material filter
    if (criteria.material && watch.caseMaterial && !watch.caseMaterial.toLowerCase().includes(criteria.material.toLowerCase())) {
      return false;
    }

    // Category filter
    if (criteria.category && watch.category && !watch.category.toLowerCase().includes(criteria.category.toLowerCase())) {
      return false;
    }

    // Price filter (usando preços convertidos)
    if (criteria.priceMax || criteria.priceMin) {
      if (watch.priceMin && watch.priceMax) {
        if (criteria.priceMax && watch.priceMin > criteria.priceMax) return false;
        if (criteria.priceMin && watch.priceMax < criteria.priceMin) return false;
      }
    }

    return true;
  });

  // Converter preços para BRL
  filteredWatches = filteredWatches.map(watch => ({
    ...watch,
    price: convertPriceToBRL(watch.price, exchangeRates)
  }));

  // Ordenar por relevância
  const watchesWithScore = filteredWatches.map(watch => ({
    watch,
    score: calculateRelevanceScore(watch, criteria)
  }));

  return watchesWithScore
    .sort((a, b) => b.score - a.score)
    .map(item => item.watch)
    .slice(0, 20);
}

function fallbackTextSearch(query: string, exchangeRates: any): Watch[] {
  const searchTerm = query.toLowerCase().trim();
  
  if (!searchTerm) return watchesDatabase.slice(0, 20);

  const results = watchesDatabase.filter(watch => {
    const searchableText = [
      watch.brand,
      watch.model,
      watch.reference,
      watch.description,
      ...(watch.keywords || []),
    ].join(' ').toLowerCase();

    return searchableText.includes(searchTerm);
  }).slice(0, 20);

  // Converter preços
  return results.map(watch => ({
    ...watch,
    price: convertPriceToBRL(watch.price, exchangeRates)
  }));
}

export async function intelligentSearch(query: string): Promise<IntelligentSearchResult> {
  try {
    const result = await trpcClient.search.intelligent.mutate({ query });
    
    if (result.searchCriteria) {
      const filteredWatches = filterWatchesByCriteria(result.searchCriteria, result.exchangeRates);
      
      return {
        results: filteredWatches,
        searchCriteria: result.searchCriteria,
        suggestions: result.suggestions
      };
    } else {
      // Fallback para busca simples
      const fallbackResults = fallbackTextSearch(query, result.exchangeRates);
      
      return {
        results: fallbackResults,
        searchCriteria: null,
        suggestions: result.suggestions
      };
    }
  } catch (error) {
    console.error('Erro na busca inteligente:', error);
    
    // Fallback completo
    return {
      results: fallbackTextSearch(query, null),
      searchCriteria: null,
      suggestions: [
        'Tente uma busca mais simples',
        'Verifique sua conexão com a internet',
        'Use palavras-chave como marca e modelo'
      ]
    };
  }
}

export function getSearchSuggestions(query: string): string[] {
  const suggestions = [
    'tissot prx azul',
    'rolex submariner',
    'omega speedmaster',
    'cronógrafo até R$ 15.000',
    'relógio dourado clássico',
    'mergulhador automático',
    'patek philippe nautilus',
    'relógio esportivo aço',
    'dress watch couro',
    'gmt para viagem'
  ];

  if (!query.trim()) {
    return suggestions.slice(0, 5);
  }

  const queryLower = query.toLowerCase();
  return suggestions.filter(suggestion => 
    suggestion.toLowerCase().includes(queryLower) || 
    queryLower.split(' ').some(word => suggestion.includes(word))
  ).slice(0, 3);
}