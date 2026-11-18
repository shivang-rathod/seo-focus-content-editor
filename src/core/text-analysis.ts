import { TextStats, HeadingNode } from '../types/editor.types';

export const getStats = (html: string): TextStats => {
  const cleanText = html.replace(/<[^>]*>/g, ' ').trim();
  const words = cleanText ? cleanText.split(/\s+/) : [];
  const sentences = cleanText ? cleanText.split(/[.!?]+/).filter(Boolean) : [];

  const wordCount = words.length;
  const paragraphsCount = cleanText
    ? html.split(/<\/p>|<div>/i).filter(p => p.replace(/<[^>]*>/g, '').trim().length > 0).length
    : 0;

  return {
    words: wordCount,
    sentences: sentences.length,
    characters: cleanText.length,
    readingTime: Math.ceil(wordCount / 200),
    paragraphs: paragraphsCount || (cleanText ? 1 : 0),
    entities: extractEntities(cleanText),
    headingTree: extractHeadingTree(html),
  };
};

const extractEntities = (text: string): string[] => {
  const words = text.split(/\s+/);
  const detected = new Set<string>();
  const commonExclusions = new Set(['The', 'A', 'An', 'This', 'That', 'These', 'Those', 'It', 'My', 'Your', 'His', 'Her', 'Our', 'They', 'And', 'But', 'Or', 'If']);

  for (let i = 1; i < words.length; i++) {
    const word = words[i].replace(/[^\w]/g, '');
    if (word.length > 2 && /^[A-Z]/.test(word) && !commonExclusions.has(word)) {
      detected.add(word);
    }
  }
  return Array.from(detected).slice(0, 15);
};

const extractHeadingTree = (html: string): HeadingNode[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
  return Array.from(headings).map(h => ({
    tag: h.tagName.toLowerCase(),
    text: h.textContent?.trim() || 'Empty Heading',
    level: parseInt(h.tagName.substring(1), 10)
  }));
};
