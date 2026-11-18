import { SentenceWarnings, SentenceIssue } from '../types/editor.types';

export const analyzeSentenceWarnings = (html: string): SentenceWarnings => {
  const cleanText = html.replace(/<[^>]*>/g, ' ').trim();
  
  // Split sentences while preserving some structure to identify them later
  // This is a basic split, typically sufficient for in-browser analysis
  const rawSentences: string[] = cleanText.match(/[^.!?]+[.!?]+/g) || [];
  
  const warnings: SentenceWarnings = {
    longSentences: [],
    veryLongSentences: [],
    consecutiveLong: [],
    commaOverload: [],
    passiveVoice: [],
    repetitiveOpenings: []
  };

  if (rawSentences.length === 0) return warnings;

  let previousWasLong = false;
  let previousStartWord = '';
  let consecutiveStartCount = 0;

  rawSentences.forEach((sentence, index) => {
    const trimmed = sentence.trim();
    if (!trimmed) return;

    const words = trimmed.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const isLong = wordCount > 25;
    const isVeryLong = wordCount > 35;

    // Create Issue Object
    const issue: SentenceIssue = {
      text: trimmed,
      preview: words.slice(0, 6).join(' ') + '...',
      index,
      count: wordCount
    };

    // 1. Long & Very Long Sentences
    if (isVeryLong) {
      warnings.veryLongSentences.push(issue);
    } else if (isLong) {
      warnings.longSentences.push(issue);
    }

    // 2. Consecutive Long Sentences
    if (isLong && previousWasLong) {
      // Avoid duplicating the previous one if it was already flagged in a chain
      // Just flag the current one as part of a chain
      warnings.consecutiveLong.push(issue);
    }
    previousWasLong = isLong;

    // 3. Excessive Commas
    const commaCount = (trimmed.match(/,/g) || []).length;
    if (commaCount >= 4) {
      warnings.commaOverload.push({ ...issue, count: commaCount });
    }

    // 4. Passive Voice
    // Basic detection: form of "to be" + past tense (ending in ed)
    // This is a heuristic and not 100% grammatically accurate but standard for SEO tools
    if (/\b(was|were|is|been|being)\s+\w+ed\b/i.test(trimmed)) {
      warnings.passiveVoice.push(issue);
    }

    // 5. Repetitive Openings
    const startWord = words[0]?.toLowerCase().replace(/[^a-z]/g, '') || '';
    if (startWord && startWord === previousStartWord && startWord.length > 3) {
      consecutiveStartCount++;
      if (consecutiveStartCount >= 2) { // 3rd sentence with same start (0-indexed logic: 1st match makes count 1, 2nd match makes count 2)
         warnings.repetitiveOpenings.push(issue);
      }
    } else {
      consecutiveStartCount = 0;
    }
    previousStartWord = startWord;
  });

  return warnings;
};