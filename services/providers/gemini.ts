import { GoogleGenAI } from "@google/genai";
import { AIProvider } from "../../types/ai.types";

export interface ProviderResponse {
  success: boolean;
  content: string;
  error?: string;
}

export const generate = async (provider: AIProvider, prompt: string, config: any = {}): Promise<ProviderResponse> => {
  const { apiKey, model } = provider;
  try {
    if (!apiKey) {
      return { success: false, content: '', error: 'API Key is missing. Please add your API key in the AI tab.' };
    }

    const ai = new GoogleGenAI({ apiKey });
    const sanitizedConfig = { ...config };

    // Gemini 4 models reject legacy sampling parameters and maxOutputTokens can truncate thinking tokens.
    if (model.startsWith('gemini-4-')) {
      delete sanitizedConfig.temperature;
      delete sanitizedConfig.topP;
      delete sanitizedConfig.topK;
      delete sanitizedConfig.candidateCount;
      delete sanitizedConfig.maxOutputTokens;
    }

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: Object.keys(sanitizedConfig).length > 0 ? sanitizedConfig : undefined,
    });

    const content = response.text;
    if (content) {
      return { success: true, content };
    }

    const blockReason = response.candidates?.[0]?.finishReason;
    if (blockReason) {
      return { success: false, content: '', error: `Gemini request stopped. Reason: ${blockReason}` };
    }
    return { success: false, content: '', error: 'Empty response from Gemini.' };
  } catch (e: any) {
    console.error("Gemini Provider Error:", e);
    const errorMessage = e?.message || 'An unknown error occurred with Gemini.';
    return { success: false, content: '', error: errorMessage };
  }
};