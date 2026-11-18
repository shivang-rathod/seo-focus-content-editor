
import { KeywordDensity } from '../types/editor.types';
import { STOP_WORDS } from './stopwords';

export const getKeywords = (html: string, n: number = 1): KeywordDensity[] => {
  const cleanText = html.replace(/<[^>]*>/g, ' '); 
  // Tokenize based on word boundaries, ignoring punctuation but keeping structure
  // We remove non-alphanumeric chars at the edges of tokens later if needed, 
  // but matches with \b generally handle words.
  const tokens = cleanText.match(/\b[\w']+\b/g) || [];
  
  const totalTokens = tokens.length;
  
  if (totalTokens === 0) return [];

  const phrasesMap: Record<string, { count: number; display: string }> = {};
  
  // Pre-compile regex for number checking
  const isNumber = /^\d+$/;
  
  for (let i = 0; i <= tokens.length - n; i++) {
    const phraseTokens = tokens.slice(i, i + n);
    
    // 1. Filter out phrases that are purely numbers (e.g. "2024", "10")
    // For n=1, check single token. For n>1, check if the combined phrase looks like a math string or just numbers?
    // Usually "Page 1" is fine, but "1 2" is noise. 
    // The prompt asked to remove "just numbers based keywords".
    // We will check if the specific token is a number for 1-gram.
    if (n === 1 && isNumber.test(phraseTokens[0])) {
      continue;
    }

    const firstWord = phraseTokens[0].toLowerCase();
    const lastWord = phraseTokens[phraseTokens.length - 1].toLowerCase();

    // 2. Stop Word Logic
    if (n === 1) {
      if (STOP_WORDS.has(firstWord)) continue;
    } else {
      // For N-grams:
      // Exclude if it STARTS or ENDS with a stop word. 
      // E.g., "in the" (skip), "the house" (skip), "bank of america" (keep - 'of' is in middle).
      if (STOP_WORDS.has(firstWord) || STOP_WORDS.has(lastWord)) {
        continue;
      }
    }
    
    // 3. Length check: skip 1-character words/numbers unless specific context (usually noise)
    if (phraseTokens.some(t => t.length < 2 && !isNumber.test(t) && t.toLowerCase() !== 'a' && t.toLowerCase() !== 'i')) {
       // Allow 'a' or 'I' potentially, but usually 'a' is a stopword. 
       // If logic above didn't catch it, strict length check might.
       // We'll rely on STOP_WORDS for 'a'.
    }

    const originalPhrase = phraseTokens.join(' ');
    const lowerPhrase = originalPhrase.toLowerCase();

    // Final sanity check for pure numeric phrases in n-grams (e.g. "10 20")
    if (n > 1 && /^\d+(\s+\d+)*$/.test(originalPhrase)) {
        continue;
    }

    if (!phrasesMap[lowerPhrase]) {
      phrasesMap[lowerPhrase] = { count: 0, display: originalPhrase };
    }
    
    phrasesMap[lowerPhrase].count += 1;
  }

  return Object.values(phrasesMap)
    .map(({ display, count }) => ({
      phrase: display,
      count,
      percentage: Number(((count * n) / totalTokens * 100).toFixed(2))
    }))
    .sort((a, b) => b.count - a.count);
};
