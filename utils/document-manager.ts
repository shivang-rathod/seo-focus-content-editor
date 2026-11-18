import { LocalDocument } from '../types/document.types.ts';

const DOCS_STORAGE_KEY = 'seoFocus_documents';
const ACTIVE_DOC_KEY = 'seoFocus_active_doc_id';

export const createDocument = (title: string = 'Untitled Document'): LocalDocument => {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    title,
    content: `<h1>${title}</h1><p>Start writing here...</p>`,
    createdAt: now,
    updatedAt: now,
    metaTitle: '',
    metaDescription: '',
    targets: { primary: '', secondary: ['', '', ''] },
    faqs: [],
    targetDomain: '',
    isTrashed: false,
    goal: {
      wordCount: 1000,
      intent: 'General',
      audience: 'General',
      tone: 'Professional',
    },
  };
};

const readStoredDocuments = (): LocalDocument[] => {
  try {
    const raw = localStorage.getItem(DOCS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load local documents:', error);
    return [];
  }
};

export const saveAllDocuments = (documents: LocalDocument[]): void => {
  try {
    localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(documents));
  } catch (error) {
    console.error('Failed to save local documents:', error);
  }
};

export const getDocuments = (): LocalDocument[] => {
  const docs = readStoredDocuments().filter((doc) => !doc.isTrashed);
  if (docs.length === 0) {
    const initial = createDocument('Untitled Document');
    saveAllDocuments([initial]);
    setActiveDocumentId(initial.id);
    return [initial];
  }
  return docs;
};

export const getActiveDocumentId = (): string | null => {
  try {
    return localStorage.getItem(ACTIVE_DOC_KEY);
  } catch {
    return null;
  }
};

export const setActiveDocumentId = (id: string): void => {
  try {
    localStorage.setItem(ACTIVE_DOC_KEY, id);
  } catch (error) {
    console.error('Failed to save active document ID:', error);
  }
};

export const updateDocumentById = (
  id: string,
  updates: Partial<Omit<LocalDocument, 'id' | 'createdAt'>>
): LocalDocument[] => {
  const docs = readStoredDocuments();
  const updated = docs.map((doc) =>
    doc.id === id ? { ...doc, ...updates, updatedAt: Date.now() } : doc
  );
  saveAllDocuments(updated);
  return updated.filter((d) => !d.isTrashed);
};

export const addDocument = (doc: LocalDocument): LocalDocument[] => {
  const docs = readStoredDocuments();
  const updated = [doc, ...docs];
  saveAllDocuments(updated);
  setActiveDocumentId(doc.id);
  return updated.filter((d) => !d.isTrashed);
};

export const deleteDocumentPermanently = (id: string): LocalDocument[] => {
  const docs = readStoredDocuments().filter((doc) => doc.id !== id);
  if (docs.length === 0) {
    const fallback = createDocument('Untitled Document');
    saveAllDocuments([fallback]);
    setActiveDocumentId(fallback.id);
    return [fallback];
  }
  saveAllDocuments(docs);
  return docs.filter((d) => !d.isTrashed);
};