import { z } from "zod";
import { publicProcedure } from "../../../create-context";

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const EXCHANGE_API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

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

// Cache para cotações (válido por 1 hora)
let exchangeRateCache: { rates: any; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hora

async function getExchangeRates() {
  const now = Date.now();
  
  if (exchangeRateCache && (now - exchangeRateCache.timestamp) < CACHE_DURATION) {
    return exchangeRateCache.rates;
  }

  try {
    const response = await fetch(EXCHANGE_API_URL);
    const data = await response.json();
    
    exchangeRateCache = {
      rates: data.rates,
      timestamp: now
    };
    
    return data.rates;
  } catch (error) {
    console.error('Erro ao buscar cotações:', error);
    // Fallback rates (aproximados)
    return {
      BRL: 5.2,
      EUR: 0.85,
      GBP: 0.73,
      JPY: 110,
      CHF: 0.92
    };
  }
}

function convertPriceToBRL(price: string, rates: any): string {
  // Extrair valores numéricos e moeda do preço
  const priceRegex = /([A-Z$£€¥₹]+)\s*([0-9,.\s]+)(?:\s*-\s*([A-Z$£€¥₹]*)\s*([0-9,.\s]+))?/i;
  const match = price.match(priceRegex);
  
  if (!match) return price;

  const currency = match[1].replace(/[^A-Z]/g, '');
  const minValue = parseFloat(match[2].replace(/[,\s]/g, ''));
  const maxValue = match[4] ? parseFloat(match[4].replace(/[,\s]/g, '')) : minValue;

  // Se já está em BRL, retornar como está
  if (currency === 'R' || price.includes('R$')) {
    return price;
  }

  // Mapear símbolos para códigos de moeda
  const currencyMap: { [key: string]: string } = {
    '$': 'USD',
    '€': 'EUR',
    '£': 'GBP',
    '¥': 'JPY',
    '₹': 'INR',
    'USD': 'USD',
    'EUR': 'EUR',
    'GBP': 'GBP',
    'JPY': 'JPY'
  };

  const currencyCode = currencyMap[currency] || 'USD';
  const rate = rates.BRL / (rates[currencyCode] || 1);

  const minBRL = Math.round(minValue * rate);
  const maxBRL = Math.round(maxValue * rate);

  if (minBRL === maxBRL) {
    return `R$ ${minBRL.toLocaleString('pt-BR')}`;
  }

  return `R$ ${minBRL.toLocaleString('pt-BR')} - R$ ${maxBRL.toLocaleString('pt-BR')}`;
}

export default publicProcedure
  .input(z.object({ 
    query: z.string(),
    limit: z.number().default(20)
  }))
  .mutation(async ({ input }) => {
    const { query, limit } = input;

    if (!query.trim()) {
      return {
        results: [],
        searchCriteria: null,
        suggestions: []
      };
    }

    try {
      // Buscar cotações em paralelo
      const ratesPromise = getExchangeRates();

      // Usar OpenAI para interpretar a consulta
      let searchCriteria: SearchCriteria | null = null;
      
      if (OPENAI_API_KEY) {
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
                  content: `Você é um especialista em relógios. Analise esta consulta de busca e extraia critérios específicos para encontrar relógios:

Consulta: "${query}"

Identifique e extraia:
1. MARCA mencionada (Rolex, Omega, Tissot, Patek Philippe, Audemars Piguet, etc.)
2. MODELO específico (Submariner, Speedmaster, PRX, Nautilus, etc.)
3. COR do mostrador ou caixa (azul, preto, branco, dourado, etc.)
4. MATERIAL da caixa (aço, ouro, titânio, cerâmica, etc.)
5. TIPO DE PULSEIRA (aço, couro, borracha, integrada, etc.)
6. CATEGORIA/ESTILO (esportivo, clássico, mergulho, cronógrafo, dress, GMT, etc.)
7. FAIXA DE PREÇO em Reais (se mencionada: "até 10 mil", "entre 5 e 15 mil", etc.)
8. PALAVRAS-CHAVE relevantes para busca

Responda APENAS em JSON válido:
{
  "brand": "marca ou vazio se não mencionada",
  "model": "modelo ou vazio se não mencionado",
  "color": "cor ou vazio se não mencionada",
  "material": "material ou vazio se não mencionado",
  "bracelet": "tipo pulseira ou vazio se não mencionado",
  "category": "categoria ou vazio se não mencionada",
  "priceMax": número_em_reais_ou_null,
  "priceMin": número_em_reais_ou_null,
  "keywords": ["palavra1", "palavra2", "palavra3"],
  "originalQuery": "${query}"
}`
                }
              ],
              max_tokens: 400,
              temperature: 0.1,
            }),
          });

          if (response.ok) {
            const data: OpenAIResponse = await response.json();
            const completion = data.choices[0].message.content;
            const jsonMatch = completion.match(/\{[\s\S]*\}/);
            
            if (jsonMatch) {
              searchCriteria = JSON.parse(jsonMatch[0]);
            }
          }
        } catch (error) {
          console.warn('Erro na análise OpenAI da busca:', error);
        }
      }

      // Aguardar cotações
      const rates = await ratesPromise;

      // Retornar critérios para o frontend processar
      return {
        searchCriteria,
        exchangeRates: rates,
        suggestions: searchCriteria ? [] : [
          'Tente ser mais específico: "Tissot PRX azul"',
          'Mencione a marca: "Rolex", "Omega", "Seiko"',
          'Inclua características: "cronógrafo", "mergulho", "dourado"',
          'Defina orçamento: "até R$ 10.000"'
        ]
      };

    } catch (error) {
      console.error('Erro na busca inteligente:', error);
      return {
        searchCriteria: null,
        exchangeRates: null,
        suggestions: [
          'Tente uma busca mais simples',
          'Verifique a conexão com a internet',
          'Use palavras-chave como marca e modelo'
        ]
      };
    }
  });