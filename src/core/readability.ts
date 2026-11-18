import { ReadabilityInsights } from '../types/editor.types';

const countSyllables = (word: string): number => {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const syllables = word.match(/[aeiouy]{1,2}/g);
  return syllables ? syllables.length : 1;
};

export const getReadabilityScore = (html: string): ReadabilityInsights | null => {
  const cleanText = html.replace(/<[^>]*>/g, ' ').trim();
  if (!cleanText) return null;

  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = cleanText.split(/\s+/).filter(w => w.length > 0);
  
  if (words.length === 0 || sentences.length === 0) return null;

  const totalWords = words.length;
  const totalSentences = sentences.length;
  const totalSyllables = words.reduce((acc, word) => acc + countSyllables(word), 0);

  const ASL = totalWords / totalSentences;
  const ASW = totalSyllables / totalWords;

  const score = Math.round(206.835 - (1.015 * ASL) - (84.6 * ASW));
  const clampedScore = Math.max(0, Math.min(100, score));

  let level = '';
  let color = '';
  let description = '';

  if (clampedScore >= 90) { level = 'Very Easy'; color = 'text-emerald-600'; description = '5th grade level. Easily understood by an average 11-year-old.'; }
  else if (clampedScore >= 80) { level = 'Easy'; color = 'text-emerald-500'; description = '6th grade level. Conversational English for consumers.'; }
  else if (clampedScore >= 70) { level = 'Fairly Easy'; color = 'text-green-600'; description = '7th grade level.'; }
  else if (clampedScore >= 60) { level = 'Standard'; color = 'text-amber-500'; description = '8th & 9th grade level. Plain English understood by 13-15 year olds.'; }
  else if (clampedScore >= 50) { level = 'Fairly Difficult'; color = 'text-orange-500'; description = 'High school level.'; }
  else if (clampedScore >= 30) { level = 'Difficult'; color = 'text-rose-500'; description = 'College level. Best understood by university graduates.'; }
  else { level = 'Very Confusing'; color = 'text-red-600'; description = 'Extremely difficult to read. Best understood by professionals.'; }

  return {
    score: clampedScore,
    level,
    color,
    description,
  };
};
