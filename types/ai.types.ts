export type AIProviderType = 'gemini' | 'openai' | 'custom';

export interface AIProvider {
  id: string;
  provider: AIProviderType;
  apiKey: string;
  model: string;
  invokeUrl?: string; // For custom OpenAI-compatible or custom providers
  isActive: boolean;
  priority: number;
  name: string;
}

export interface LocalAIConfig {
  provider: AIProviderType;
  apiKey: string;
  model: string;
  invokeUrl?: string;
}
