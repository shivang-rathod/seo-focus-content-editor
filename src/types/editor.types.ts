export type Tab = 'insights' | 'keywords' | 'seo' | 'ai' | 'optimize';
export type SEOPhraseTab = 1 | 2 | 3 | 4;

export interface KeywordDensity {
  phrase: string;
  count: number;
  percentage: number;
}

export interface TextStats {
  words: number;
  sentences: number;
  readingTime: number;
  characters: number;
  paragraphs: number;
  entities: string[];
  headingTree: HeadingNode[];
}

export interface HeadingNode {
  tag: string;
  text: string;
  level: number;
}

export interface ReadabilityInsights {
  score: number;
  level: string;
  color: string;
  description: string;
}

export interface LinkStats {
  internal: number;
  external: number;
  broken: string[];
}

export interface ScoreBreakdown {
  meta: number;
  heading: number;
  keyword: number;
  content: number;
  link: number;
}

export interface SEOHealth {
  score: number;
  prominenceScore: number;
  linkStats: LinkStats;
  scoreBreakdown: ScoreBreakdown;
}

export interface KeywordTarget {
  primary: string;
  secondary: string[];
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface SentenceIssue {
  text: string;
  preview: string;
  index: number;
  count?: number;
}

export interface SentenceWarnings {
  longSentences: SentenceIssue[];
  veryLongSentences: SentenceIssue[];
  consecutiveLong: SentenceIssue[];
  commaOverload: SentenceIssue[];
  passiveVoice: SentenceIssue[];
  repetitiveOpenings: SentenceIssue[];
}

export interface OptimizationItem {
  id: string;
  title: string;
  description: string;
  priority: number;
  source: 'readability' | 'heading' | 'keyword' | 'seo' | 'content' | 'eeat';
}

export interface OptimizationReport {
  critical: OptimizationItem[];
  improvements: OptimizationItem[];
  enhancements: OptimizationItem[];
}

export interface EEATCategoryScore {
  name: string;
  score: number;
  status: 'Strong' | 'Moderate' | 'Weak';
  color: string;
}

export interface EEATScore {
  overall: number;
  summary: string;
  color: string;
  experience: EEATCategoryScore;
  expertise: EEATCategoryScore;
  authority: EEATCategoryScore;
  trust: EEATCategoryScore;
}
