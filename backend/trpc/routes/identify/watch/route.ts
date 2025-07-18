import { z } from "zod";
import { publicProcedure } from "../../../create-context";

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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

const AIAnalysisSchema = z.object({
  brand: z.string().optional(),
  model: z.string().optional(),
  caseMaterial: z.string().optional(),
  dialColor: z.string().optional(),
  braceletType: z.string().optional(),
  complications: z.array(z.string()).optional(),
  estimatedSize: z.string().optional(),
  confidence: z.string().optional(),
  description: z.string(),
});

export default publicProcedure
  .input(z.object({ 
    base64Image: z.string(),
    precision: z.enum(['high', 'medium', 'fast']).default('high')
  }))
  .mutation(async ({ input }) => {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured on server');
    }

    const { base64Image, precision } = input;

    // Adjust model parameters based on precision
    const modelConfig = {
      high: { maxTokens: 1000, temperature: 0.1 },
      medium: { maxTokens: 800, temperature: 0.2 },
      fast: { maxTokens: 500, temperature: 0.3 }
    };

    const config = modelConfig[precision];

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
                    url: `data:image/jpeg;base64,${base64Image}`,
                    detail: precision === 'high' ? 'high' : 'low'
                  }
                }
              ]
            }
          ],
          max_tokens: config.maxTokens,
          temperature: config.temperature,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data: OpenAIResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('Invalid OpenAI API response');
      }

      const completion = data.choices[0].message.content;
      return parseAIResponse(completion);
    } catch (error) {
      console.error('Error in OpenAI analysis:', error);
      throw new Error(
        error instanceof Error 
          ? `Analysis failed: ${error.message}` 
          : 'Unknown error in image analysis'
      );
    }
  });

function parseAIResponse(completion: string) {
  try {
    const jsonMatch = completion.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis: AIIdentificationResponse = JSON.parse(jsonMatch[0]);
      
      // Validate with Zod schema
      const validatedAnalysis = AIAnalysisSchema.parse({
        brand: analysis.brand || undefined,
        model: analysis.model || undefined,
        caseMaterial: analysis.caseMaterial || 'Não identificado',
        dialColor: analysis.dialColor || 'Não identificado',
        braceletType: analysis.braceletType || 'Não identificado',
        complications: Array.isArray(analysis.complications) ? analysis.complications : [],
        estimatedSize: analysis.estimatedSize || 'Não determinado',
        confidence: analysis.confidence || 'média',
        description: analysis.description || completion,
      });

      return validatedAnalysis;
    }
  } catch (parseError) {
    console.warn('Error parsing OpenAI JSON response:', parseError);
  }

  // Fallback response
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