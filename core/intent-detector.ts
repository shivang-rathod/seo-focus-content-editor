
import { IntentResult } from '../types/editor.types';

const INTENT_PATTERNS = {
  Informational: ['how to', 'guide', 'tutorial', 'tips', 'what is', 'meaning', 'why', 'history', 'example'],
  Commercial: ['best', 'top', 'review', 'comparison', 'vs', 'affordable', 'reliable', 'alternative'],
  Transactional: ['buy', 'price', 'discount', 'order', 'coupon', 'sale', 'checkout', 'get'],
  Navigational: ['login', 'official', 'homepage', 'contact', 'support', 'signin', 'account']
};

export const detectIntent = (html: string): IntentResult => {
  const text = html.replace(/<[^>]*>/g, ' ').toLowerCase();
  const scores: Record<string, number> = { Informational: 0, Commercial: 0, Transactional: 0, Navigational: 0 };
  const signals: string[] = [];

  Object.entries(INTENT_PATTERNS).forEach(([intent, patterns]) => {
    patterns.forEach(pattern => {
      const regex = new RegExp(`\\b${pattern}\\b`, 'g');
      const matches = (text.match(regex) || []).length;
      if (matches > 0) {
        scores[intent] += matches;
        signals.push(pattern);
      }
    });
  });

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const primary = (sorted[0][1] > 0 ? sorted[0][0] : 'Informational') as IntentResult['primary'];
  
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const confidence = totalScore > 0 ? Math.min(100, Math.round((sorted[0][1] / totalScore) * 100)) : 50;

  return { primary, confidence, signals: Array.from(new Set(signals)).slice(0, 5) };
};
