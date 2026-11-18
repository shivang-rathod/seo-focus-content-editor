import { ProviderResponse } from './gemini';
import { AIProvider } from '../../types/ai.types';

export const generate = async (provider: AIProvider, prompt: string, config: any = {}): Promise<ProviderResponse> => {
    const { apiKey, model } = provider;
    try {
        if (!apiKey) {
            return { success: false, content: '', error: 'API Key is missing for OpenAI provider.' };
        }

        const body: any = {
            model: model,
            messages: [{ role: 'user', content: prompt }],
            temperature: config.temperature || 0.7,
        };
        
        // Adapt Gemini's JSON mode for OpenAI
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
            // For failover, specifically check for rate limit or quota errors
            if (response.status === 429) {
                return { success: false, content: '', error: `OpenAI Rate Limit/Quota Exceeded: ${errorMessage}` };
            }
            throw new Error(`OpenAI API error: ${errorMessage}`);
        }

        const data = await response.json();
        let content = data.choices[0]?.message?.content;

        if (content) {
            // If JSON mode was requested, the content is a stringified JSON.
            // No need to parse it here; the caller (ai-engine) will parse.
            return { success: true, content };
        } else {
            return { success: false, content: '', error: 'Empty response from OpenAI.' };
        }
    } catch (e: any) {
        console.error("OpenAI Provider Error:", e);
        return { success: false, content: '', error: e.message };
    }
};
