import { KeywordTarget, FAQ } from './editor.types';

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
}