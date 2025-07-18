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

export default publicProcedure
  .input(z.object({ 
    base64Image: z.string()
  }))
  .mutation(async ({ input }) => {
    if (!OPENAI_API_KEY) {
      return {
        isValid: true,
        issues: [],
        suggestions: [],
      };
    }

    const { base64Image } = input;

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
                    url: `data:image/jpeg;base64,${base64Image}`,
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
        console.warn('Error validating image quality with OpenAI');
      }

      return {
        isValid: true,
        issues: [],
        suggestions: [],
      };
    } catch (error) {
      console.error('Error in image quality validation with OpenAI:', error);
      return {
        isValid: true,
        issues: [],
        suggestions: [],
      };
    }
  });