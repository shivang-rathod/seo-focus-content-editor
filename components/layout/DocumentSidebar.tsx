import React, { useState } from 'react';
import { FilePlus, FileText, MoreVertical, Edit, Trash2, Download, Upload, X } from 'lucide-react';
import { LocalDocument } from '../../types/document.types';

interface DocumentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  documents: LocalDocument[];
  activeDocId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onImport: (doc: LocalDocument) => void;
  onExport: (id: string) => void;
  onNotify?: (msg: string) => void;
}

export const DocumentSidebar = ({
  isOpen,
  onClose,
  documents,
  activeDocId,
  onSelect,
  onCreate,
  onDelete,
  onRename,
  onImport,
  onExport,
  onNotify
}: DocumentSidebarProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [menuId, setMenuId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRename = (doc: LocalDocument) => {
    setEditingId(doc.id);
    setRenameValue(doc.title);
    setMenuId(null);
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId && renameValue.trim()) {
      onRename(editingId, renameValue.trim());
      setEditingId(null);
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const doc = JSON.parse(e.target?.result as string) as LocalDocument;
          if (doc.title && typeof doc.content === 'string') {
            onImport({
              ...doc,
              id: crypto.randomUUID(),
              createdAt: doc.createdAt || Date.now(),
              updatedAt: Date.now(),
              metaTitle: doc.metaTitle || '',
              metaDescription: doc.metaDescription || '',
              targets: doc.targets || { primary: '', secondary: ['', '', ''] },
              faqs: Array.isArray(doc.faqs) ? doc.faqs : [],
              targetDomain: doc.targetDomain || '',
              isTrashed: false,
              goal: doc.goal || { wordCount: 1000, intent: 'General', audience: 'General', tone: 'Professional' },
            });
            onNotify?.('Document imported');
          } else {
            onNotify?.('Invalid JSON document format.');
          }
        } catch {
          onNotify?.('Failed to parse imported JSON file.');
        }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-xs" onClick={onClose} />
      <aside className="relative z-10 w-72 border-r border-zinc-100 flex flex-col bg-zinc-50 shrink-0 h-screen shadow-2xl animate-in slide-in-from-left duration-200">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between h-16 bg-white">
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500">Local Documents</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={onCreate}
              className="p-2 rounded-lg hover:bg-zinc-100 transition-colors text-zinc-600"
              title="New Document"
            >
              <FilePlus size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-zinc-100 transition-colors text-zinc-400"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {documents.map(doc => (
            <div
              key={doc.id}
              className={`group relative rounded-xl mb-1 transition-colors ${activeDocId === doc.id ? 'bg-blue-50/80' : 'hover:bg-white'}`}
            >
              {editingId === doc.id ? (
                <form onSubmit={handleRenameSubmit}>
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={handleRenameSubmit}
                    className="w-full bg-white text-sm font-bold p-3 rounded-xl border-2 border-blue-500 outline-none"
                    autoFocus
                  />
                </form>
              ) : (
                <button
                  onClick={() => {
                    onSelect(doc.id);
                    onClose();
                  }}
                  className="w-full text-left p-3 pr-9 flex items-start gap-3"
                >
                  <FileText size={16} className={`mt-0.5 shrink-0 ${activeDocId === doc.id ? 'text-blue-600' : 'text-zinc-400'}`} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-bold truncate ${activeDocId === doc.id ? 'text-blue-900' : 'text-zinc-800'}`}>{doc.title}</p>
                    <p className="text-[10px] text-zinc-400">
                      Updated {new Date(doc.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              )}

              {editingId !== doc.id && (
                <div className="absolute top-1/2 -translate-y-1/2 right-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuId(menuId === doc.id ? null : doc.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-zinc-200 transition-opacity"
                  >
                    <MoreVertical size={15} className="text-zinc-500" />
                  </button>
                  {menuId === doc.id && (
                    <div className="absolute top-full right-0 mt-1 w-40 bg-white border border-zinc-100 rounded-xl shadow-xl z-20 p-2">
                      <button onClick={() => handleRename(doc)} className="w-full text-left flex items-center gap-2 p-2 text-xs font-bold text-zinc-700 hover:bg-zinc-100 rounded-lg"><Edit size={14}/> Rename</button>
                      <button onClick={() => { onExport(doc.id); setMenuId(null); }} className="w-full text-left flex items-center gap-2 p-2 text-xs font-bold text-zinc-700 hover:bg-zinc-100 rounded-lg"><Download size={14}/> Export JSON</button>
                      <button onClick={() => { onDelete(doc.id); setMenuId(null); }} className="w-full text-left flex items-center gap-2 p-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14}/> Delete</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-zinc-100 bg-white">
          <label className="w-full text-center cursor-pointer flex items-center justify-center gap-2 p-3 text-xs font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors border border-zinc-200">
            <Upload size={14}/> Import Document (.json)
            <input type="file" accept=".json" className="hidden" onChange={handleFileImport} />
          </label>
        </div>
      </aside>
    </div>
  );
};