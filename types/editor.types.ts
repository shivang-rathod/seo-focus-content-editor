
export type Tab = 'insights' | 'keywords' | 'seo' | 'ai' | 'optimize';
export type SEOPhraseTab = 1 | 2 | 3 | 4;

export interface KeywordDensity {
  phrase: string;
  count: number;
  percentage: number;
  isPrimary?: boolean;
  isSecondary?: boolean;
}

export interface TextStats {
  words: number;
  pubWords: number;
  sentences: number;
  readingTime: number;
  speakingTime: number;
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
  hardSentences: number;
  veryHardSentences: number;
}

export interface LinkStats {
  internal: number;
  external: number;
  broken: string[];
  unchecked: string[];
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
  warnings: string[];
  status: 'excellent' | 'good' | 'fair' | 'poor';
  checklist: SEOChecklistItem[];
  prominenceScore: number;
  linkStats: LinkStats;
  scoreBreakdown: ScoreBreakdown;
}

export interface SEOChecklistItem {
  label: string;
  passed: boolean;
  impact: 'critical' | 'moderate' | 'low';
}

export interface IntentResult {
  primary: 'Informational' | 'Commercial' | 'Transactional' | 'Navigational' | 'Unknown';
  confidence: number;
  signals: string[];
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
  count?: number; // Word count or comma count
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
  priority: number; // 1 = Critical, 2 = Improvement, 3 = Enhancement
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
