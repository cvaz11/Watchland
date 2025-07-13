import { AIAnalysis } from '@/types/watch';

const AI_API_URL = 'https://toolkit.rork.com/text/llm/';

export async function analyzeWatchImage(imageBase64: string): Promise<AIAnalysis> {
  try {
    const prompt = `Analise esta imagem de relógio e identifique as seguintes características:

1. MARCA (se visível no mostrador ou caixa)
2. MODELO (se identificável)
3. MATERIAL DA CAIXA (aço, ouro, titânio, etc.)
4. COR DO MOSTRADOR
5. TIPO DE PULSEIRA (aço, couro, borracha, etc.)
6. COMPLICAÇÕES VISÍVEIS (cronógrafo, GMT, data, etc.)
7. TAMANHO ESTIMADO DA CAIXA
8. NÍVEL DE CONFIANÇA da identificação

Seja específico mas honesto sobre incertezas. Se não conseguir identificar algo com certeza, mencione as possibilidades mais prováveis.

Responda em português brasileiro no seguinte formato JSON:
{
  "brand": "marca identificada ou null",
  "model": "modelo identificado ou null", 
  "caseMaterial": "material da caixa",
  "dialColor": "cor do mostrador",
  "braceletType": "tipo de pulseira",
  "complications": ["lista", "de", "complicações"],
  "estimatedSize": "tamanho estimado",
  "confidence": "alta/média/baixa",
  "description": "descrição detalhada do que você vê"
}`;

    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image',
                image: imageBase64,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    
    // Try to parse JSON from the completion
    try {
      const jsonMatch = data.completion.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return {
          brand: analysis.brand,
          model: analysis.model,
          caseMaterial: analysis.caseMaterial,
          dialColor: analysis.dialColor,
          braceletType: analysis.braceletType,
          complications: analysis.complications || [],
          estimatedSize: analysis.estimatedSize,
          confidence: analysis.confidence,
          description: analysis.description || data.completion,
        };
      }
    } catch (parseError) {
      console.warn('Erro ao fazer parse do JSON, usando resposta completa');
    }

    // Fallback: return the full completion as description
    return {
      description: data.completion,
      confidence: 'média',
    };
  } catch (error) {
    console.error('Erro na análise de IA:', error);
    throw new Error('Falha ao analisar a imagem. Tente novamente.');
  }
}