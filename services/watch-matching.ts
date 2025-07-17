import { Watch, AIAnalysis, IdentificationResult } from '@/types/watch';
import { watchesDatabase } from '@/mocks/watches-database';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export function calculateMatchScore(watch: Watch, aiAnalysis: AIAnalysis): number {
  let score = 0;
  let maxScore = 0;

  // Brand matching (highest weight)
  maxScore += 40;
  if (aiAnalysis?.brand && watch.brand.toLowerCase().includes(aiAnalysis.brand.toLowerCase())) {
    score += 40;
  } else if (aiAnalysis?.brand && watch.keywords?.some(k => k.includes(aiAnalysis.brand?.toLowerCase() || ''))) {
    score += 20;
  }

  // Model matching
  maxScore += 30;
  if (aiAnalysis?.model && watch.model.toLowerCase().includes(aiAnalysis.model.toLowerCase())) {
    score += 30;
  } else if (aiAnalysis?.model && watch.keywords?.some(k => k.includes(aiAnalysis.model?.toLowerCase() || ''))) {
    score += 15;
  }

  // Case material matching
  maxScore += 10;
  if (aiAnalysis?.caseMaterial && watch.caseMaterial?.toLowerCase().includes(aiAnalysis.caseMaterial.toLowerCase())) {
    score += 10;
  }

  // Dial color matching
  maxScore += 10;
  if (aiAnalysis?.dialColor && watch.dialColor?.toLowerCase().includes(aiAnalysis.dialColor.toLowerCase())) {
    score += 10;
  }

  // Bracelet type matching
  maxScore += 5;
  if (aiAnalysis?.braceletType && watch.braceletType?.toLowerCase().includes(aiAnalysis.braceletType.toLowerCase())) {
    score += 5;
  }

  // Complications matching
  maxScore += 5;
  if (aiAnalysis?.complications && aiAnalysis.complications.length > 0) {
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
    aiAnalysis: aiAnalysis?.description || 'Análise não disponível',
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
  
  if (!searchTerm) return watchesDatabase;

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

export async function searchWithAI(query: string): Promise<Watch[]> {
  if (!OPENAI_API_KEY) {
    console.warn('OpenAI API key not configured, falling back to regular search');
    return searchWatches(query);
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: `Você é um especialista em relógios. Analise esta consulta de busca e extraia critérios específicos:

Consulta: "${query}"

Identifique e extraia:
1. MARCA mencionada (Rolex, Omega, Tissot, etc.)
2. MODELO específico (Submariner, Speedmaster, PRX, etc.)
3. COR do mostrador ou caixa
4. MATERIAL da caixa (aço, ouro, titânio, etc.)
5. TIPO DE PULSEIRA (aço, couro, borracha)
6. CATEGORIA/ESTILO (esportivo, clássico, mergulho, cronógrafo, etc.)
7. FAIXA DE PREÇO (se mencionada)
8. CARACTERÍSTICAS especiais

Responda APENAS em JSON válido:
{
  "brand": "marca ou deixe vazio",
  "model": "modelo ou deixe vazio",
  "color": "cor ou deixe vazio",
  "material": "material ou deixe vazio",
  "bracelet": "tipo pulseira ou deixe vazio",
  "category": "categoria ou deixe vazio",
  "priceMax": número_ou_deixe_vazio,
  "keywords": ["palavra1", "palavra2"]
}`
          }
        ],
        max_tokens: 300,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro na API OpenAI: ${response.status}`);
    }

    const data: OpenAIResponse = await response.json();
    
    // Try to parse JSON from the completion
    try {
      const completion = data.choices[0].message.content;
      const jsonMatch = completion.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const searchCriteria = JSON.parse(jsonMatch[0]);
        return filterWatchesByCriteria(searchCriteria);
      }
    } catch (parseError) {
      console.warn('Erro ao fazer parse do JSON da busca OpenAI:', parseError);
    }

    // Fallback to regular search
    return searchWatches(query);
  } catch (error) {
    console.error('Erro na busca com OpenAI:', error);
    // Fallback to regular search
    return searchWatches(query);
  }
}

function filterWatchesByCriteria(criteria: any): Watch[] {
  return watchesDatabase.filter(watch => {
    let matches = true;

    // Brand filter
    if (criteria.brand && !watch.brand.toLowerCase().includes(criteria.brand.toLowerCase())) {
      matches = false;
    }

    // Model filter
    if (criteria.model && !watch.model.toLowerCase().includes(criteria.model.toLowerCase())) {
      matches = false;
    }

    // Color filter
    if (criteria.color && watch.dialColor && !watch.dialColor.toLowerCase().includes(criteria.color.toLowerCase())) {
      matches = false;
    }

    // Material filter
    if (criteria.material && watch.caseMaterial && !watch.caseMaterial.toLowerCase().includes(criteria.material.toLowerCase())) {
      matches = false;
    }

    // Bracelet filter
    if (criteria.bracelet && watch.braceletType && !watch.braceletType.toLowerCase().includes(criteria.bracelet.toLowerCase())) {
      matches = false;
    }

    // Category filter
    if (criteria.category && watch.category && !watch.category.toLowerCase().includes(criteria.category.toLowerCase())) {
      matches = false;
    }

    // Price filter
    if (criteria.priceMax && watch.priceMin && watch.priceMin > criteria.priceMax) {
      matches = false;
    }

    // Keywords filter
    if (criteria.keywords && criteria.keywords.length > 0) {
      const watchText = [
        watch.brand,
        watch.model,
        watch.description,
        ...(watch.keywords || []),
      ].join(' ').toLowerCase();

      const hasKeyword = criteria.keywords.some((keyword: string) =>
        watchText.includes(keyword.toLowerCase())
      );

      if (!hasKeyword) {
        matches = false;
      }
    }

    return matches;
  }).slice(0, 20); // Limit results
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