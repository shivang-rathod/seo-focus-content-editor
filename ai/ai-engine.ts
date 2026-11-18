import { Type } from "@google/genai";
import { htmlToMarkdown } from '../core/text-cleaner';
import { KeywordTarget } from '../types/editor.types';
import * as aiGateway from '../services/aiGateway.ts';

export type RewriteMode = 
  | 'clarity' 
  | 'concise' 
  | 'expand_examples' 
  | 'add_stats' 
  | 'authoritative' 
  | 'humanize' 
  | 'remove_fluff' 
  | 'conversational' 
  | 'formal' 
  | 'active_voice'
  | 'expand'
  | 'shorten';

export const rewriteContent = async (text: string, mode: RewriteMode, customPrompt?: string): Promise<string[]> => {
  const modePrompts: Record<RewriteMode, string> = {
    clarity: "Rewrite the following text for maximum clarity, ensuring it's easy to follow while maintaining the original message.",
    concise: "Make the following text as concise as possible. Remove redundant words and shorten sentences without losing meaning.",
    expand_examples: "Expand the following content by adding relevant, illustrative examples that help clarify the points made.",
    add_stats: "Incorporate realistic (placeholder format like [X%]) statistics and data points into the text to boost its credibility.",
    authoritative: "Rewrite the text in an authoritative, expert tone. Use decisive language and establish high topical authority.",
    humanize: "Adjust the tone of the text to sound more human and less like a machine. Vary sentence length and use more natural expressions.",
    remove_fluff: "Identify and remove all 'filler' content, flowery adjectives, and unnecessary fluff from the following text.",
    conversational: "Rewrite the text in a friendly, conversational tone, as if talking directly to a peer.",
    formal: "Convert the following text into a professional, formal business tone suitable for corporate environments.",
    active_voice: "Convert all passive voice sentences in the following text into active voice for more direct and impactful writing.",
    expand: "Elaborate on the following text to provide more depth, detail, and context while maintaining the original tone.",
    shorten: "Drastically shorten the following text while preserving the core message and primary information."
  };

  const instruction = customPrompt || modePrompts[mode];
  
  const prompt = `${instruction}\n\nProvide exactly TWO distinct and high-quality versions of the following text as JSON with an "options" string array.\n\nText to process:\n"${text}"`;
  const config = { 
    temperature: 0.7,
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        options: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "An array of two distinct rewritten versions."
        }
      },
      required: ["options"]
    }
  };

  const gatewayResponse = await aiGateway.generateContent(prompt, config);

  if (!gatewayResponse.success) {
    throw new Error(gatewayResponse.error || "AI rewrite failed.");
  }

  try {
    const cleaned = gatewayResponse.content.replace(/^```json\s*|\s*```$/g, '').trim();
    const data = JSON.parse(cleaned || '{"options": []}');
    if (Array.isArray(data.options) && data.options.length > 0) {
      return data.options;
    }
    throw new Error("AI returned an unexpected format.");
  } catch (e: any) {
    if (gatewayResponse.content && !gatewayResponse.content.trim().startsWith('{')) {
      return [gatewayResponse.content.trim()];
    }
    throw new Error(e?.message || "Failed to parse AI rewrite options.");
  }
};

export const generateMetadata = async (
  content: string, 
  type: 'title' | 'description',
  keywords?: KeywordTarget,
  currentValue?: string
): Promise<string> => {
  const cleanText = htmlToMarkdown(content).substring(0, 8000); 
  const primary = keywords?.primary || "";
  const secondary = keywords?.secondary?.filter(s => s && s.trim().length > 0) || [];

  let prompt = "";
  if (type === 'title') {
    prompt = `
You are a professional SEO copywriter.
Task: Write ONE compelling meta title.
Primary Keyword: "${primary}"
Current Title (Avoid this exact text): "${currentValue || ''}"
Constraints:
1. Length MUST be strictly between 50 and 60 characters.
2. ${primary ? `MUST include the Primary Keyword "${primary}".` : 'Focus on the main topic of the content.'}
3. If content is short, expand creatively.
Guidelines:
- Make it benefit-driven.
- Use natural marketing language.
- Do NOT use quotation marks.
- Output only the final title.
Content Summary:
${cleanText.substring(0, 1500)}
`;
  } else {
    prompt = `
You are a professional SEO copywriter.
Task: Write ONE persuasive meta description.
Primary Keyword: "${primary}"
Secondary Keywords: ${secondary.join(", ")}
Current Description (Avoid this exact text): "${currentValue || ''}"
Constraints:
1. Length MUST be strictly between 140 and 180 characters.
2. ${primary ? `MUST include the Primary Keyword "${primary}".` : 'Summarize the core value clearly.'}
3. ${secondary.length > 0 ? `Include these Secondary Keywords if natural: ${secondary.join(", ")}.` : ''}
Guidelines:
- Two short sentences.
- Highlight a clear benefit.
- End with a subtle call-to-action.
- Do NOT use quotation marks.
- Output only the final description.
Content Summary:
${cleanText.substring(0, 2000)}
`;
  }

  const gatewayResponse = await aiGateway.generateContent(prompt, { temperature: 0.7, maxOutputTokens: 200 });
  
  if (!gatewayResponse.success) {
    throw new Error(gatewayResponse.error || "Failed to generate metadata.");
  }

  return gatewayResponse.content.trim().replace(/^["']|["']$/g, '').replace(/^(Meta )?(Title|Description):\s*/i, '');
};

export const generateFAQs = async (content: string): Promise<Array<{ question: string; answer: string }>> => {
  const cleanText = htmlToMarkdown(content).substring(0, 6000);
  const prompt = `Generate 5 relevant FAQ questions and concise answers as a JSON array of objects with "question" and "answer" fields based on this content:\n\n${cleanText}`;
  const config = {
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          answer: { type: Type.STRING }
        },
        required: ["question", "answer"]
      }
    }
  };

  const gatewayResponse = await aiGateway.generateContent(prompt, config);

  if (!gatewayResponse.success) {
    throw new Error(gatewayResponse.error || "Failed to generate FAQs.");
  }

  try {
    const cleaned = gatewayResponse.content.replace(/^```json\s*|\s*```$/g, '').trim();
    const parsed = JSON.parse(cleaned || "[]");
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed.faqs)) return parsed.faqs;
    return [];
  } catch (e) {
    throw new Error("Failed to parse FAQ JSON from AI response.");
  }
};

export const detectAIContent = async (text: string): Promise<{ score: number; analysis: string }> => {
  const cleanText = htmlToMarkdown(text).substring(0, 3000);
  const prompt = `Analyze the following text for AI-generated patterns.
Provide:
1. A probability score (0-100) where 100 is definitely AI.
2. A short 1-sentence explanation.

Return format: SCORE: [number] | REASON: [text]

Text: "${cleanText}"`;

  const gatewayResponse = await aiGateway.generateContent(prompt, { temperature: 0.1, maxOutputTokens: 150 });
  
  if (!gatewayResponse.success) {
    throw new Error(gatewayResponse.error || "AI detection failed.");
  }

  const raw = gatewayResponse.content || "SCORE: 0 | REASON: Analysis failed";
  const scoreMatch = raw.match(/SCORE:\s*(\d+)/i);
  const reasonMatch = raw.match(/REASON:\s*(.*)/i);

  return {
    score: scoreMatch ? parseInt(scoreMatch[1], 10) : 0,
    analysis: reasonMatch ? reasonMatch[1].trim() : raw.trim()
  };
};