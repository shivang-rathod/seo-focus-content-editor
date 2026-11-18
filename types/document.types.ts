
import { KeywordTarget, FAQ } from './editor.types';

export interface DocumentGoal {
  wordCount: number;
  intent: 'General' | 'Informational' | 'Commercial' | 'Transactional' | 'Navigational';
  audience: 'General' | 'Beginner' | 'Intermediate' | 'Expert';
  tone: 'Professional' | 'Casual' | 'Formal' | 'Humorous' | 'Empathetic';
}

export interface LocalDocument {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  metaTitle: string;
  metaDescription: string;
  targets: KeywordTarget;
  faqs: FAQ[];
  targetDomain: string;
  isTrashed: boolean;
  goal: DocumentGoal;
}