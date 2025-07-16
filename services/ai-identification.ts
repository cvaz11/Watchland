import { AIAnalysis } from '@/types/watch';

const AI_API_URL = 'https://toolkit.rork.com/text/llm/';

interface AIIdentificationResponse {
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

export async function analyzeWatchImage(imageBase64: string): Promise<AIAnalysis> {
  try {
    const prompt = `Você é um especialista em relógios de luxo. Analise esta imagem de relógio com máxima precisão e identifique:

🔍 ANÁLISE DETALHADA:
1. MARCA - Procure logotipos, texto no mostrador, coroa, fecho da pulseira
2. MODELO - Identifique características distintivas, formato da caixa, subdiais
3. MATERIAL DA CAIXA - Aço, ouro amarelo/rosa/branco, titânio, platina, cerâmica
4. COR DO MOSTRADOR - Seja específico: preto, branco, azul, verde, prata, etc.
5. TIPO DE PULSEIRA - Aço (oyster, jubilee, presidente), couro, borracha, NATO
6. COMPLICAÇÕES - Cronógrafo, GMT, data, dia/mês, fases da lua, etc.
7. TAMANHO ESTIMADO - Baseado em proporções visuais (36mm, 40mm, 42mm, etc.)
8. CARACTERÍSTICAS ESPECIAIS - Luneta, índices, ponteiros, textura do mostrador

⚡ INSTRUÇÕES ESPECÍFICAS:
- Se não conseguir identificar com certeza, mencione as possibilidades mais prováveis
- Seja honesto sobre o nível de confiança (alta/média/baixa)
- Foque em detalhes visíveis na imagem
- Considere ângulo, iluminação e qualidade da foto

📋 RESPONDA EM JSON VÁLIDO:
{
  "brand": "marca identificada ou null se incerto",
  "model": "modelo específico ou null se incerto",
  "caseMaterial": "material da caixa",
  "dialColor": "cor específica do mostrador",
  "braceletType": "tipo de pulseira/bracelete",
  "complications": ["lista", "de", "complicações", "visíveis"],
  "estimatedSize": "tamanho estimado com unidade",
  "confidence": "alta/média/baixa",
  "description": "análise detalhada do que você observa na imagem, incluindo características distintivas, estado de conservação, e qualquer detalhe relevante para identificação"
}

IMPORTANTE: Retorne apenas o JSON válido, sem texto adicional.`;

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
      throw new Error(`Erro na API de IA: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.completion) {
      throw new Error('Resposta inválida da API de IA');
    }

    // Try to parse JSON from the completion
    try {
      const jsonMatch = data.completion.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis: AIIdentificationResponse = JSON.parse(jsonMatch[0]);
        
        // Validate and structure the response
        return {
          brand: analysis.brand || null,
          model: analysis.model || null,
          caseMaterial: analysis.caseMaterial || 'Não identificado',
          dialColor: analysis.dialColor || 'Não identificado',
          braceletType: analysis.braceletType || 'Não identificado',
          complications: Array.isArray(analysis.complications) ? analysis.complications : [],
          estimatedSize: analysis.estimatedSize || 'Não determinado',
          confidence: analysis.confidence || 'média',
          description: analysis.description || data.completion,
        };
      }
    } catch (parseError) {
      console.warn('Erro ao fazer parse do JSON da IA, usando resposta completa:', parseError);
    }

    // Fallback: return the full completion as description with basic structure
    return {
      brand: null,
      model: null,
      caseMaterial: 'Análise em andamento',
      dialColor: 'Análise em andamento',
      braceletType: 'Análise em andamento',
      complications: [],
      estimatedSize: 'Análise em andamento',
      confidence: 'média',
      description: data.completion,
    };
  } catch (error) {
    console.error('Erro na análise de IA:', error);
    
    // Return structured error response
    throw new Error(
      error instanceof Error 
        ? `Falha na análise: ${error.message}` 
        : 'Erro desconhecido na análise da imagem'
    );
  }
}

export async function validateImageQuality(imageBase64: string): Promise<{
  isValid: boolean;
  issues: string[];
  suggestions: string[];
}> {
  try {
    const prompt = `Analise a qualidade desta imagem de relógio para identificação automática:

Avalie:
1. NITIDEZ - A imagem está focada?
2. ILUMINAÇÃO - Há luz suficiente e bem distribuída?
3. ÂNGULO - O relógio está bem posicionado?
4. REFLEXOS - Há reflexos que atrapalham a leitura?
5. ENQUADRAMENTO - O relógio ocupa boa parte da imagem?
6. OBSTRUÇÕES - Há dedos, objetos ou sombras cobrindo partes importantes?

Responda em JSON:
{
  "isValid": true/false,
  "issues": ["lista", "de", "problemas", "encontrados"],
  "suggestions": ["sugestões", "para", "melhorar", "a", "foto"]
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
      return {
        isValid: true,
        issues: [],
        suggestions: [],
      };
    }

    const data = await response.json();
    
    try {
      const jsonMatch = data.completion.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.warn('Erro ao validar qualidade da imagem');
    }

    return {
      isValid: true,
      issues: [],
      suggestions: [],
    };
  } catch (error) {
    console.error('Erro na validação de qualidade:', error);
    return {
      isValid: true,
      issues: [],
      suggestions: [],
    };
  }
}