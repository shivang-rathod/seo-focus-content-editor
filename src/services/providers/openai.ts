import { ProviderResponse } from './gemini';
import { LocalAIConfig } from '../../types/ai.types';

export const generate = async (provider: LocalAIConfig, prompt: string, config: any = {}): Promise<ProviderResponse> => {
  const { apiKey, model } = provider;
  try {
    if (!apiKey) {
      return { success: false, content: '', error: 'API Key is missing for OpenAI provider.' };
    }

    const body: any = {
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: config.temperature || 0.7,
    };

    if (config.responseMimeType === 'application/json') {
      body.response_format = { type: 'json_object' };
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error?.message || `HTTP error! status: ${response.status}`;
      if (response.status === 429) {
        return { success: false, content: '', error: `OpenAI Rate Limit/Quota Exceeded: ${errorMessage}` };
      }
      throw new Error(`OpenAI API error: ${errorMessage}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (content) {
      return { success: true, content };
    }
    return { success: false, content: '', error: 'Empty response from OpenAI.' };
  } catch (e: any) {
    console.error("OpenAI Provider Error:", e);
    return { success: false, content: '', error: e.message };
  }
};
