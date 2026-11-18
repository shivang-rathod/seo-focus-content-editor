import { getAIConfig } from './aiConfig.ts';
import * as gemini from './providers/gemini.ts';
import * as openai from './providers/openai.ts';
import * as custom from './providers/custom.ts';
import { ProviderResponse } from './providers/gemini.ts';

export const generateContent = async (prompt: string, config: any = {}): Promise<ProviderResponse> => {
  const localConfig = getAIConfig();

  if (!localConfig.apiKey) {
    return {
      success: false,
      content: '',
      error: 'No API key configured. Open the AI tab to add your own API key.',
    };
  }

  switch (localConfig.provider) {
    case 'gemini':
      return gemini.generate(localConfig, prompt, config);
    case 'openai':
      return openai.generate(localConfig, prompt, config);
    case 'custom':
      return custom.generate(localConfig, prompt, config);
    default:
      return {
        success: false,
        content: '',
        error: `Unsupported AI provider "${localConfig.provider}".`,
      };
  }
};
