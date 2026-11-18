export type AIProviderType = 'gemini' | 'openai' | 'custom';

export interface LocalAIConfig {
  provider: AIProviderType;
  apiKey: string;
  model: string;
  invokeUrl?: string;
}
