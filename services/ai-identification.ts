import { trpcClient } from '@/lib/trpc';
import { AIAnalysis } from '@/types/watch';

export async function analyzeWatchImage(imageBase64: string, precision: 'high' | 'medium' | 'fast' = 'high'): Promise<AIAnalysis> {
  try {
    const result = await trpcClient.identify.watch.mutate({
      base64Image: imageBase64,
      precision,
    });
    
    return result;
  } catch (error) {
    console.error('Erro na análise:', error);
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
    const result = await trpcClient.identify.quality.mutate({
      base64Image: imageBase64,
    });
    
    return result;
  } catch (error) {
    console.error('Erro na validação de qualidade:', error);
    return {
      isValid: true,
      issues: [],
      suggestions: [],
    };
  }
}