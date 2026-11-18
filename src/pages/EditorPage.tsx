import React, { useState, useEffect, useMemo, useDeferredValue, startTransition, useCallback, useRef } from 'react';
import { PanelLeft, Edit, Download, Upload, FileText, Code, Copy, FileJson, FileType, Github } from 'lucide-react';
import { LocalDocument } from '../types/document.types.ts';

// Core Analysis Logic
import { getStats } from '../core/text-analysis.ts';
import { getKeywords } from '../core/keyword-density.ts';
import { getReadabilityScore } from '../core/readability.ts';
import { analyzeSEOHealth } from '../core/seo-health.ts';
import { analyzeSentenceWarnings } from '../core/sentence-analysis.ts';
import { generateOptimizationReport } from '../core/optimization-engine.ts';
import { analyzeEEAT } from '../core/eeat-analysis.ts';
import { htmlToMarkdown } from '../core/text-cleaner.ts';

// AI Integration (BYOK)
import { rewriteContent, generateMetadata, detectAIContent, RewriteMode, generateFAQs } from '../ai/ai-engine.ts';
import { hasConfiguredAIKey } from '../services/aiConfig.ts';

// Document Persistence & Multi-Format IO
import {
  getDocuments,
  getActiveDocumentId,
  setActiveDocumentId,
  createDocument,
  updateDocumentById,
  addDocument,
  deleteDocumentPermanently,
} from '../utils/document-manager.ts';
import { DocumentFormat, exportDocumentAs, parseImportedFile } from '../utils/document-io.ts';

// Components
import { Toolbar } from '../components/editor/Toolbar.tsx';
import { Sidebar } from '../components/layout/Sidebar.tsx';
import { DocumentDrawer } from '../components/layout/DocumentDrawer.tsx';
import { Editor } from '../components/editor/Editor.tsx';
import { Tab, SEOPhraseTab } from '../types/editor.types.ts';

function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>): void => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitFor);
  };
}

export default function EditorPage() {
  const [documents, setDocuments] = useState<LocalDocument[]>(() => getDocuments());
  const [activeDocId, setActiveDocIdState] = useState<string>(() => {
    const docs = getDocuments();
    const savedId = getActiveDocumentId();
    const match = docs.find((d) => d.id === savedId);
    const chosenId = match ? match.id : docs[0].id;
    setActiveDocumentId(chosenId);
    return chosenId;
  });

  const activeDocument = useMemo(
    () => documents.find((d) => d.id === activeDocId) || documents[0],
    [documents, activeDocId]
  );

  // UI State
  const [activeTab, setActiveTab] = useState<Tab>('insights');
  const [seoTab, setSeoTab] = useState<SEOPhraseTab>(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiDetectionResult, setAiDetectionResult] = useState<{ score: number; analysis: string } | null>(null);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const [currentBlockType, setCurrentBlockType] = useState('p');
  const [isLinkActive, setIsLinkActive] = useState(false);
  const [brokenLinks, setBrokenLinks] = useState<string[]>([]);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [headerTitle, setHeaderTitle] = useState(activeDocument?.title || 'Untitled Document');
  const [isDocDrawerOpen, setIsDocDrawerOpen] = useState(false);
  const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [pendingImportFormat, setPendingImportFormat] = useState<DocumentFormat>('md');

  const titleInputRef = useRef<HTMLInputElement>(null);
  const importMenuRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (activeDocument) {
      setHeaderTitle(activeDocument.title);
    }
  }, [activeDocument?.id, activeDocument?.title]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (importMenuRef.current && !importMenuRef.current.contains(e.target as Node)) {
        setIsImportMenuOpen(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message: msg, visible: true });
    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  }, []);

  const deferredContent = useDeferredValue(activeDocument?.content || '');

  const stats = useMemo(() => getStats(deferredContent), [deferredContent]);
  const keywords = useMemo(() => getKeywords(deferredContent, seoTab), [deferredContent, seoTab]);
  const readability = useMemo(() => getReadabilityScore(deferredContent), [deferredContent]);
  const health = useMemo(
    () =>
      analyzeSEOHealth(
        deferredContent,
        keywords,
        activeDocument?.targets || { primary: '', secondary: [] },
        activeDocument?.metaDescription || '',
        activeDocument?.metaTitle || '',
        brokenLinks,
        activeDocument?.targetDomain || ''
      ),
    [deferredContent, keywords, activeDocument, brokenLinks]
  );
  const sentenceWarnings = useMemo(() => analyzeSentenceWarnings(deferredContent), [deferredContent]);
  const eeatScore = useMemo(() => {
    if (!activeDocument) return null;
    return analyzeEEAT(
      deferredContent,
      stats,
      health,
      activeDocument.metaTitle,
      activeDocument.metaDescription
    );
  }, [deferredContent, stats, health, activeDocument?.metaTitle, activeDocument?.metaDescription]);

  const optimizationReport = useMemo(() => {
    if (!activeDocument) return { critical: [], improvements: [], enhancements: [] };
    return generateOptimizationReport(
      stats,
      health,
      readability,
      sentenceWarnings,
      activeDocument.targets,
      activeDocument.metaTitle,
      activeDocument.metaDescription,
      activeDocument.faqs.length,
      keywords,
      eeatScore
    );
  }, [stats, health, readability, sentenceWarnings, activeDocument, keywords, eeatScore]);

  const handlePropUpdate = useCallback(
    (updates: Partial<Omit<LocalDocument, 'id' | 'createdAt'>>) => {
      if (!activeDocument) return;
      const updatedDocs = updateDocumentById(activeDocument.id, updates);
      setDocuments(updatedDocs);
    },
    [activeDocument]
  );

  const debouncedSave = useCallback(
    debounce((docId: string, updates: Partial<LocalDocument>) => {
      updateDocumentById(docId, updates);
    }, 500),
    []
  );

  const handleEditorChange = useCallback(
    (newContent: string) => {
      if (!activeDocument) return;
      const docId = activeDocument.id;
      startTransition(() => {
        setDocuments((prev) =>
          prev.map((d) => (d.id === docId ? { ...d, content: newContent, updatedAt: Date.now() } : d))
        );
        debouncedSave(docId, { content: newContent });
      });
    },
    [activeDocument?.id, debouncedSave]
  );

  const handleSelectionChange = useCallback((blockType: string, isLink: boolean) => {
    setCurrentBlockType(blockType);
    setIsLinkActive(isLink);
  }, []);

  const handleTitleRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeDocument && headerTitle.trim()) {
      handlePropUpdate({ title: headerTitle.trim() });
    } else {
      setHeaderTitle(activeDocument?.title || 'Untitled Document');
    }
    setIsEditingTitle(false);
  };

  const runAIAction = useCallback(
    async (action: () => Promise<void>) => {
      if (!hasConfiguredAIKey()) {
        setActiveTab('ai');
        setAiError('Add your own API key in the AI tab to run AI features.');
        showToast('Add your API key in the AI tab');
        return;
      }

      setAiError(null);
      setIsAIProcessing(true);
      try {
        await action();
      } catch (err: any) {
        const message = err?.message || 'AI operation failed.';
        console.error('AI Action Failed:', err);
        setAiError(message);
        showToast('AI operation failed');
      } finally {
        setIsAIProcessing(false);
      }
    },
    [showToast]
  );

  const onRewrite = useCallback(
    async (mode: RewriteMode) => {
      if (!editorInstance) return;
      const selectedText = editorInstance.getSelection();
      if (!selectedText) {
        showToast('Select text in the editor first to rewrite');
        return;
      }
      await runAIAction(async () => {
        const results = await rewriteContent(selectedText, mode);
        if (results && results.length > 0) {
          editorInstance.insertContent(results[0]);
          showToast('Selection rewritten');
        }
      });
    },
    [editorInstance, runAIAction, showToast]
  );

  const onGenerateMetadata = async (type: 'title' | 'description') => {
    if (!activeDocument) return;
    await runAIAction(async () => {
      const currentValue = type === 'title' ? activeDocument.metaTitle : activeDocument.metaDescription;
      const res = await generateMetadata(activeDocument.content, type, activeDocument.targets, currentValue);
      handlePropUpdate(type === 'title' ? { metaTitle: res } : { metaDescription: res });
      showToast(`Meta ${type === 'title' ? 'Title' : 'Description'} Updated`);
    });
  };

  const onGenerateFAQs = async () => {
    if (!activeDocument) return;
    await runAIAction(async () => {
      const res = await generateFAQs(activeDocument.content);
      handlePropUpdate({ faqs: res });
      showToast('FAQs Generated');
    });
  };

  const onDetectAI = async () => {
    if (!activeDocument) return;
    await runAIAction(async () => {
      const res = await detectAIContent(activeDocument.content);
      setAiDetectionResult(res);
      showToast(`AI Pattern Score: ${res.score}%`);
    });
  };

  const handleSelectDoc = (id: string) => {
    setActiveDocIdState(id);
    setActiveDocumentId(id);
    setAiDetectionResult(null);
    setBrokenLinks([]);
  };

  const handleCreateDoc = () => {
    const newDoc = createDocument('Untitled Document');
    const updated = addDocument(newDoc);
    setDocuments(updated);
    setActiveDocIdState(newDoc.id);
    setIsDocDrawerOpen(false);
    showToast('New document created');
  };

  const handleDeleteDoc = (id: string) => {
    const updated = deleteDocumentPermanently(id);
    setDocuments(updated);
    if (activeDocId === id || !updated.some((d) => d.id === activeDocId)) {
      const nextId = updated[0].id;
      setActiveDocIdState(nextId);
      setActiveDocumentId(nextId);
    }
    showToast('Document deleted');
  };

  const handleRenameDoc = (id: string, newTitle: string) => {
    const updated = updateDocumentById(id, { title: newTitle });
    setDocuments(updated);
  };

  const triggerImportFor = (format: DocumentFormat) => {
    setPendingImportFormat(format);
    setIsImportMenuOpen(false);
    if (fileInputRef.current) {
      const acceptMap: Record<DocumentFormat, string> = {
        md: '.md,.markdown',
        html: '.html,.htm',
        txt: '.txt',
        json: '.json',
      };
      fileInputRef.current.accept = acceptMap[format];
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = (e.target?.result as string) || '';
        const importedDoc = parseImportedFile(file.name, raw, pendingImportFormat);
        const updated = addDocument(importedDoc);
        setDocuments(updated);
        setActiveDocIdState(importedDoc.id);
        setAiDetectionResult(null);
        setBrokenLinks([]);
        showToast(`Imported ${pendingImportFormat.toUpperCase()} document`);
      } catch (err: any) {
        showToast(err?.message || 'Failed to import file');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleExport = (format: DocumentFormat, docId?: string) => {
    const targetDoc = docId ? documents.find((d) => d.id === docId) : activeDocument;
    if (!targetDoc) return;
    exportDocumentAs(targetDoc, format);
    setIsExportMenuOpen(false);
    showToast(`Exported ${format.toUpperCase()}`);
  };

  const handleCopyMarkdown = async () => {
    if (!activeDocument) return;
    const md = htmlToMarkdown(activeDocument.content);
    await navigator.clipboard.writeText(md);
    setIsExportMenuOpen(false);
    showToast('Markdown copied to clipboard');
  };

  if (!activeDocument) return null;

  return (
    <div className="flex flex-col h-screen w-full bg-white overflow-hidden text-zinc-800 selection:bg-blue-100 relative">
      <div
        className={`fixed top-5 left-1/2 -translate-x-1/2 z-[200] bg-zinc-900 text-white px-5 py-2.5 rounded-full shadow-xl flex items-center gap-2.5 transition-all duration-300 ease-in-out ${
          toast.visible ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0 pointer-events-none'
        }`}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
        <span className="text-xs font-medium tracking-wide">{toast.message}</span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />

      <DocumentDrawer
        isOpen={isDocDrawerOpen}
        onClose={() => setIsDocDrawerOpen(false)}
        documents={documents}
        activeDocId={activeDocument.id}
        onSelect={handleSelectDoc}
        onCreate={handleCreateDoc}
        onDelete={handleDeleteDoc}
        onRename={handleRenameDoc}
        onExport={(id) => handleExport('json', id)}
      />

      <header className="h-14 border-b border-zinc-100 px-6 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDocDrawerOpen(true)}
            className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500 transition-colors"
            title="Documents"
            aria-label="Open local documents"
          >
            <PanelLeft size={17} />
          </button>
          <div className="w-px h-5 bg-zinc-200 mx-1.5"></div>
          {isEditingTitle ? (
            <form onSubmit={handleTitleRename}>
              <input
                ref={titleInputRef}
                type="text"
                value={headerTitle}
                onChange={(e) => setHeaderTitle(e.target.value)}
                onBlur={handleTitleRename}
                className="font-medium tracking-tight text-base text-zinc-900 bg-zinc-100 px-2.5 py-1 rounded-md outline-none"
              />
            </form>
          ) : (
            <div className="flex items-center gap-2 group" onClick={() => setIsEditingTitle(true)}>
              <h1 className="font-medium tracking-tight text-base text-zinc-800 truncate max-w-xs cursor-pointer">
                {headerTitle}
              </h1>
              <Edit size={13} className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {/* GitHub Repository Link */}
          <a
            href="https://github.com/shivang-rathod/seo-focus-content-editor"
            target="_blank"
            rel="noopener noreferrer"
            title="View on GitHub"
            aria-label="View on GitHub"
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-xs font-medium hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
          >
            <Github size={14} /> GitHub
          </a>

          {/* Import Dropdown */}
          <div className="relative" ref={importMenuRef}>
            <button
              onClick={() => {
                setIsImportMenuOpen((prev) => !prev);
                setIsExportMenuOpen(false);
              }}
              className="flex items-center gap-2 px-3.5 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-xs font-medium hover:bg-zinc-50 transition-colors"
            >
              <Upload size={14} /> Import
            </button>
            {isImportMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-zinc-100 rounded-2xl shadow-xl z-50 p-1.5 space-y-0.5">
                <button
                  onClick={() => triggerImportFor('md')}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 rounded-xl transition-colors"
                >
                  <FileText size={14} className="text-zinc-400" /> Import Markdown (.md)
                </button>
                <button
                  onClick={() => triggerImportFor('html')}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 rounded-xl transition-colors"
                >
                  <Code size={14} className="text-zinc-400" /> Import HTML (.html)
                </button>
                <button
                  onClick={() => triggerImportFor('txt')}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 rounded-xl transition-colors"
                >
                  <FileType size={14} className="text-zinc-400" /> Import Plain Text (.txt)
                </button>
                <button
                  onClick={() => triggerImportFor('json')}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 rounded-xl transition-colors"
                >
                  <FileJson size={14} className="text-zinc-400" /> Import JSON Backup (.json)
                </button>
              </div>
            )}
          </div>

          {/* Export Dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => {
                setIsExportMenuOpen((prev) => !prev);
                setIsImportMenuOpen(false);
              }}
              className="flex items-center gap-2 px-3.5 py-2 bg-zinc-900 text-white rounded-lg text-xs font-medium hover:bg-black transition-colors"
            >
              <Download size={14} /> Export
            </button>
            {isExportMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-zinc-100 rounded-2xl shadow-xl z-50 p-1.5 space-y-0.5">
                <button
                  onClick={() => handleExport('md')}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 rounded-xl transition-colors"
                >
                  <FileText size={14} className="text-zinc-400" /> Download Markdown (.md)
                </button>
                <button
                  onClick={() => handleExport('html')}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 rounded-xl transition-colors"
                >
                  <Code size={14} className="text-zinc-400" /> Download HTML (.html)
                </button>
                <button
                  onClick={() => handleExport('txt')}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 rounded-xl transition-colors"
                >
                  <FileType size={14} className="text-zinc-400" /> Download Plain Text (.txt)
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 rounded-xl transition-colors"
                >
                  <FileJson size={14} className="text-zinc-400" /> Export JSON Backup (.json)
                </button>
                <div className="my-1 border-t border-zinc-100" />
                <button
                  onClick={handleCopyMarkdown}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 rounded-xl transition-colors"
                >
                  <Copy size={14} className="text-zinc-400" /> Copy Markdown
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Toolbar
            editorInstance={editorInstance}
            currentBlockType={currentBlockType}
            isLinkActive={isLinkActive}
            onNotify={showToast}
          />
          <main className="flex-1 flex justify-center relative bg-zinc-50/40 custom-scrollbar overflow-y-auto">
            <div className="w-full max-w-[820px] bg-white relative">
              <Editor
                key={activeDocument.id}
                initialContent={activeDocument.content}
                onUpdate={handleEditorChange}
                onInit={setEditorInstance}
                onSelectionChange={handleSelectionChange}
              />
            </div>
          </main>
        </div>

        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          stats={stats}
          readability={readability}
          health={health}
          keywords={keywords}
          seoTab={seoTab}
          setSeoTab={setSeoTab}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          onRewrite={onRewrite}
          isAIProcessing={isAIProcessing}
          targets={activeDocument.targets}
          setTargets={(t) => handlePropUpdate({ targets: t })}
          metaTitle={activeDocument.metaTitle}
          setMetaTitle={(s) => handlePropUpdate({ metaTitle: s })}
          metaDescription={activeDocument.metaDescription}
          setMetaDescription={(s) => handlePropUpdate({ metaDescription: s })}
          faqs={activeDocument.faqs}
          setFaqs={(f) => handlePropUpdate({ faqs: f })}
          onGenerateMetadata={onGenerateMetadata}
          onDetectAI={onDetectAI}
          onGenerateFAQs={onGenerateFAQs}
          onExportSchema={() => {
            const schema: Record<string, any> = {
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: activeDocument.metaTitle || activeDocument.title,
              description: activeDocument.metaDescription,
            };
            if (activeDocument.faqs.length > 0) {
              schema.mainEntity = activeDocument.faqs
                .filter((f) => f.question.trim() || f.answer.trim())
                .map((f) => ({
                  '@type': 'Question',
                  name: f.question,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: f.answer,
                  },
                }));
            }
            navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
            showToast('Schema Copied to Clipboard');
          }}
          onNavigateOutline={(text) => editorInstance?.scrollToText(text)}
          sentenceWarnings={sentenceWarnings}
          optimizationReport={optimizationReport}
          onHighlight={(enabled) => editorInstance?.toggleHighlights(activeDocument.targets, enabled)}
          setBrokenLinks={setBrokenLinks}
          content={activeDocument.content}
          targetDomain={activeDocument.targetDomain}
          setTargetDomain={(s) => handlePropUpdate({ targetDomain: s })}
          eeatScore={eeatScore}
          aiDetectionResult={aiDetectionResult}
          aiError={aiError}
          onNotify={showToast}
        />
      </div>
    </div>
  );
}
