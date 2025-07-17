import { AIAnalysis } from '@/types/watch';

// OpenAI API configuration
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

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
  if (!OPENAI_API_KEY) {
    throw new Error('Chave da API OpenAI não configurada. Configure EXPO_PUBLIC_OPENAI_API_KEY nas variáveis de ambiente.');
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Você é um especialista em relógios de luxo com 20 anos de experiência. Analise esta imagem de relógio com máxima precisão e identifique:

🔍 ANÁLISE DETALHADA OBRIGATÓRIA:
1. MARCA - Procure logotipos, texto no mostrador, coroa, fecho da pulseira, assinatura
2. MODELO - Identifique características distintivas, formato da caixa, subdiais, complicações
3. MATERIAL DA CAIXA - Aço, ouro amarelo/rosa/branco, titânio, platina, cerâmica, bronze
4. COR DO MOSTRADOR - Seja específico: preto, branco, azul navy, verde, prata, champagne, etc.
5. TIPO DE PULSEIRA - Aço (oyster, jubilee, presidente), couro, borracha, NATO, mesh
6. COMPLICAÇÕES - Cronógrafo, GMT, data, dia/mês, fases da lua, reserva de marcha
7. TAMANHO ESTIMADO - Baseado em proporções visuais (36mm, 40mm, 42mm, etc.)
8. CARACTERÍSTICAS ESPECIAIS - Luneta, índices, ponteiros, textura do mostrador

⚡ INSTRUÇÕES CRÍTICAS:
- Se não conseguir identificar com certeza, mencione as possibilidades mais prováveis
- Seja honesto sobre o nível de confiança (alta/média/baixa)
- Foque em detalhes visíveis na imagem
- Considere ângulo, iluminação e qualidade da foto
- Para marcas famosas (Rolex, Omega, Patek Philippe), seja extra cuidadoso

📋 RESPONDA APENAS EM JSON VÁLIDO:
{
  "brand": "marca identificada ou vazio se incerto",
  "model": "modelo específico ou vazio se incerto", 
  "caseMaterial": "material da caixa",
  "dialColor": "cor específica do mostrador",
  "braceletType": "tipo de pulseira/bracelete",
  "complications": ["lista", "de", "complicações", "visíveis"],
  "estimatedSize": "tamanho estimado com unidade",
  "confidence": "alta/média/baixa",
  "description": "análise detalhada do que você observa na imagem, incluindo características distintivas, estado de conservação, e qualquer detalhe relevante para identificação. Seja específico sobre por que você chegou a essas conclusões."
}

IMPORTANTE: Retorne apenas o JSON válido, sem texto adicional antes ou depois.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro na API OpenAI: ${response.status} - ${errorText}`);
    }

    const data: OpenAIResponse = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('Resposta inválida da API OpenAI');
    }

    const completion = data.choices[0].message.content;
    return parseAIResponse(completion);
  } catch (error) {
    console.error('Erro na análise com OpenAI:', error);
    throw new Error(
      error instanceof Error 
        ? `Falha na análise: ${error.message}` 
        : 'Erro desconhecido na análise da imagem'
    );
  }
}

function parseAIResponse(completion: string): AIAnalysis {
  try {
    const jsonMatch = completion.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis: AIIdentificationResponse = JSON.parse(jsonMatch[0]);
      
      return {
        brand: analysis.brand || undefined,
        model: analysis.model || undefined,
        caseMaterial: analysis.caseMaterial || 'Não identificado',
        dialColor: analysis.dialColor || 'Não identificado',
        braceletType: analysis.braceletType || 'Não identificado',
        complications: Array.isArray(analysis.complications) ? analysis.complications : [],
        estimatedSize: analysis.estimatedSize || 'Não determinado',
        confidence: analysis.confidence || 'média',
        description: analysis.description || completion,
      };
    }
  } catch (parseError) {
    console.warn('Erro ao fazer parse do JSON da OpenAI:', parseError);
  }

  return {
    brand: undefined,
    model: undefined,
    caseMaterial: 'Análise em andamento',
    dialColor: 'Análise em andamento',
    braceletType: 'Análise em andamento',
    complications: [],
    estimatedSize: 'Análise em andamento',
    confidence: 'média',
    description: completion,
  };
}

export async function validateImageQuality(imageBase64: string): Promise<{
  isValid: boolean;
  issues: string[];
  suggestions: string[];
}> {
  if (!OPENAI_API_KEY) {
    return {
      isValid: true,
      issues: [],
      suggestions: [],
    };
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analise a qualidade desta imagem de relógio para identificação automática:

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
}`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                  detail: 'low'
                }
              }
            ]
          }
        ],
        max_tokens: 300,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      return {
        isValid: true,
        issues: [],
        suggestions: [],
      };
    }

    const data: OpenAIResponse = await response.json();
    
    try {
      const completion = data.choices[0].message.content;
      const jsonMatch = completion.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.warn('Erro ao validar qualidade da imagem com OpenAI');
    }

    return {
      isValid: true,
      issues: [],
      suggestions: [],
    };
  } catch (error) {
    console.error('Erro na validação de qualidade com OpenAI:', error);
    return {
      isValid: true,
      issues: [],
      suggestions: [],
    };
  }
}