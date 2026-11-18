import { AIProviderType, LocalAIConfig } from '../types/ai.types';

const AI_CONFIG_KEY = 'seoFocus_byok_ai_config';

export const DEFAULT_MODELS: Record<AIProviderType, string> = {
  gemini: 'gemini-4-hydrogen',
  openai: 'gpt-4o-mini',
  custom: 'gpt-4o-mini',
};

export const GEMINI_MODEL_OPTIONS = [
  { id: 'gemini-4-hydrogen', label: 'gemini-4-hydrogen (Fast / Recommended)' },
  { id: 'gemini-3.1-flash-lite', label: 'gemini-3.1-flash-lite (Lightweight)' },
  { id: 'gemini-4-argon', label: 'gemini-4-argon (Complex Reasoning)' },
];

export const OPENAI_MODEL_OPTIONS = [
  { id: 'gpt-4o-mini', label: 'gpt-4o-mini (Fast / Recommended)' },
  { id: 'gpt-4o', label: 'gpt-4o (High Capability)' },
];

export const getAIConfig = (): LocalAIConfig => {
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<LocalAIConfig>;
      const provider: AIProviderType =
        parsed.provider === 'openai' || parsed.provider === 'custom' ? parsed.provider : 'gemini';
      return {
        provider,
        apiKey: typeof parsed.apiKey === 'string' ? parsed.apiKey : '',
        model: typeof parsed.model === 'string' && parsed.model.trim() ? parsed.model : DEFAULT_MODELS[provider],
        invokeUrl: typeof parsed.invokeUrl === 'string' ? parsed.invokeUrl : '',
      };
    }
  } catch (e) {
    console.error('Failed to read AI configuration:', e);
  }
  return {
    provider: 'gemini',
    apiKey: '',
    model: DEFAULT_MODELS.gemini,
    invokeUrl: '',
  };
};

export const saveAIConfig = (config: LocalAIConfig): LocalAIConfig => {
  const normalized: LocalAIConfig = {
    provider: config.provider,
    apiKey: config.apiKey.trim(),
    model: config.model.trim() || DEFAULT_MODELS[config.provider],
    invokeUrl: config.invokeUrl?.trim() || '',
  };
  try {
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(normalized));
  } catch (e) {
    console.error('Failed to save AI configuration:', e);
  }
  return normalized;
};

export const clearAIConfig = (): LocalAIConfig => {
  try {
    localStorage.removeItem(AI_CONFIG_KEY);
  } catch (e) {
    console.error('Failed to clear AI configuration:', e);
  }
  return {
    provider: 'gemini',
    apiKey: '',
    model: DEFAULT_MODELS.gemini,
    invokeUrl: '',
  };
};

export const hasConfiguredAIKey = (): boolean => {
  const cfg = getAIConfig();
  return cfg.apiKey.trim().length > 0;
};
