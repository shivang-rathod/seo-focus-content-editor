import { getAIConfig } from './aiConfig.ts';
import { AIProvider } from '../types/ai.types.ts';
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

  const provider: AIProvider = {
    id: 'local-byok',
    name: localConfig.provider,
    provider: localConfig.provider,
    apiKey: localConfig.apiKey,
    model: localConfig.model,
    invokeUrl: localConfig.invokeUrl,
    isActive: true,
    priority: 1,
  };

  switch (provider.provider) {
    case 'gemini':
      return gemini.generate(provider, prompt, config);
    case 'openai':
      return openai.generate(provider, prompt, config);
    case 'custom':
      return custom.generate(provider, prompt, config);
    default:
      return {
        success: false,
        content: '',
        error: `Unsupported AI provider "${provider.provider}".`,
      };
  }
};
