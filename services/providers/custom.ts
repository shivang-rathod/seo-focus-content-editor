import { ProviderResponse } from './gemini';
import { AIProvider } from '../../types/ai.types';

export const generate = async (provider: AIProvider, prompt: string, config: any = {}): Promise<ProviderResponse> => {
    const { apiKey, model, invokeUrl } = provider;
    
    if (!invokeUrl) {
        return { success: false, content: '', error: 'Invoke URL is missing for custom provider.' };
    }
    
    try {
        const response = await fetch(invokeUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                prompt,
                model,
                ...config
            })
        });

        if (!response.ok) {
            // For failover, check for common server error codes
            if (response.status === 429 || response.status >= 500) {
                 return { success: false, content: '', error: `Custom API request failed with status: ${response.status}` };
            }
            throw new Error(`Custom API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        // Assuming the custom API returns { content: "..." }
        const content = data.content;

        if (content) {
            return { success: true, content };
        }
        return { success: false, content: '', error: 'Empty or invalid response from custom endpoint. Expected { "content": "..." }.' };

    } catch (e: any) {
        console.error("Custom Provider Error:", e);
        return { success: false, content: '', error: e.message };
    }
};
