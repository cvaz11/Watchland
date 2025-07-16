import { AIAnalysis } from '@/types/watch';
import { useAPIStore } from '@/store/api-store';

// Use the proxy API or direct OpenAI API
const AI_API_URL = 'https://toolkit.rork.com/text/llm/';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

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

export async function analyzeWatchImage(imageBase64: string, useDirectAPI: boolean = false): Promise<AIAnalysis> {
  try {
    if (useDirectAPI) {
      return await analyzeWithDirectOpenAI(imageBase64);
    } else {
      return await analyzeWithProxy(imageBase64);
    }
  } catch (error) {
    console.error('Erro na análise:', error);
    throw new Error(
      error instanceof Error 
        ? `Falha na análise: ${error.message}` 
        : 'Erro desconhecido na análise da imagem'
    );
  }
}

async function analyzeWithProxy(imageBase64: string): Promise<AIAnalysis> {
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
  "brand": "marca identificada ou deixe vazio se incerto",
  "model": "modelo específico ou deixe vazio se incerto",
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

  return parseAIResponse(data.completion);
}

async function analyzeWithDirectOpenAI(imageBase64: string): Promise<AIAnalysis> {
  // Get API key from store (you'd need to implement this)
  const apiKey = await getStoredAPIKey();
  
  if (!apiKey) {
    throw new Error('Chave da API OpenAI não configurada');
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analise esta imagem de relógio e identifique marca, modelo, material, cor do mostrador, tipo de pulseira, complicações e tamanho estimado. Responda em JSON estruturado.',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    throw new Error(`Erro na OpenAI API: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('Resposta inválida da OpenAI');
  }

  return parseAIResponse(content);
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
    console.warn('Erro ao fazer parse do JSON da IA:', parseError);
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

async function getStoredAPIKey(): Promise<string | undefined> {
  // This would get the API key from your store
  // For now, return undefined to use proxy
  return undefined;
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

export async function testAPIConnection(): Promise<{
  isValid: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: 'Teste de conexão. Responda apenas: "Conexão OK"',
          },
        ],
      }),
    });

    if (!response.ok) {
      return {
        isValid: false,
        error: `Erro HTTP: ${response.status}`,
      };
    }

    const data = await response.json();
    
    if (data.completion && data.completion.includes('Conexão OK')) {
      return { isValid: true };
    }

    return {
      isValid: false,
      error: 'Resposta inesperada da API',
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

export async function testSupabaseConnection(url?: string, anonKey?: string): Promise<{
  isValid: boolean;
  error?: string;
}> {
  if (!url || !anonKey) {
    return {
      isValid: false,
      error: 'URL e chave anônima do Supabase são obrigatórias',
    };
  }

  try {
    // Test basic connection to Supabase
    const response = await fetch(`${url}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return { isValid: true };
    }

    return {
      isValid: false,
      error: `Erro HTTP: ${response.status}`,
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}