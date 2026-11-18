import React, { useState, useRef } from 'react';
import { 
  Bold, Italic, Underline, Link as LinkIcon, 
  ChevronDown, Undo, Redo,
  Table as TableIcon, Image as ImageIcon,
  X, Minus, Send, Strikethrough, Subscript, Superscript, Trash2
} from 'lucide-react';

interface ToolbarProps {
  editorInstance: any;
  currentBlockType?: string;
  isLinkActive?: boolean;
  onNotify?: (msg: string) => void;
}

const ToolbarGroup = ({ children }: { children?: React.ReactNode }) => (
  <div className="flex bg-zinc-50 p-1.5 rounded-2xl border border-zinc-100 mx-1 items-center shadow-sm">
    {children}
  </div>
);

const ToolbarButton = ({ icon, onClick, title, active = false, disabled = false }: any) => (
  <button 
    type="button"
    onMouseDown={(e) => { 
      e.preventDefault(); 
      onClick(e); 
    }} 
    disabled={disabled}
    className={`w-10 h-10 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-xl transition-all disabled:opacity-20 ${active ? 'text-blue-600 bg-blue-50' : 'text-zinc-500'}`} 
    title={title}
  >
    {icon}
  </button>
);

export const Toolbar = ({ 
  editorInstance,
  currentBlockType,
  isLinkActive,
  onNotify
}: ToolbarProps) => {
  const [modalConfig, setModalConfig] = useState<{ type: 'table' | 'image' | 'link' | null; title: string }>({ type: null, title: '' });
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [linkText, setLinkText] = useState('');
  const [isEditingLink, setIsEditingLink] = useState(false);
  const savedRange = useRef<Range | null>(null);

  if (!editorInstance) return null;
  
  const handleFormat = (cmd: string, val: any = null) => {
    editorInstance?.execCommand(cmd, false, val);
  };
  
  const getParentAnchor = (): HTMLAnchorElement | null => {
    let node = window.getSelection()?.anchorNode;
    while (node && node.nodeName !== 'BODY') {
      if (node.nodeName === 'A') {
        return node as HTMLAnchorElement;
      }
      node = node.parentNode;
    }
    return null;
  };

  const openModal = (type: 'table' | 'image' | 'link') => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      editorInstance.focus();
    }
    const activeSelection = window.getSelection();
    if (activeSelection && activeSelection.rangeCount > 0) {
      savedRange.current = activeSelection.getRangeAt(0).cloneRange();
    }

    if (type === 'table') {
      setInput1('3');
      setInput2('3');
      setModalConfig({ type, title: 'Insert Table' });
    } else if (type === 'image') {
      setInput1('');
      setModalConfig({ type, title: 'Insert Image from URL' });
    } else if (type === 'link') {
      const parentAnchor = getParentAnchor();
      if (!savedRange.current?.toString() && !parentAnchor) {
        onNotify?.("Please select text in the editor to create a link.");
        return;
      }
      
      if (parentAnchor && activeSelection) {
        const range = document.createRange();
        range.selectNode(parentAnchor);
        activeSelection.removeAllRanges();
        activeSelection.addRange(range);
        savedRange.current = range.cloneRange();
        
        setIsEditingLink(true);
        setInput1(parentAnchor.getAttribute('href') || '');
        setLinkText(parentAnchor.innerText);
      } else {
        setIsEditingLink(false);
        setInput1('');
        setLinkText(savedRange.current?.toString() || '');
      }
      setModalConfig({ type, title: 'Manage Link' });
    }
  };

  const handleRemoveLink = () => {
    editorInstance.focus();
    if (savedRange.current) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(savedRange.current);
      editorInstance.execCommand('unlink', false, null);
    }
    setModalConfig({ type: null, title: '' });
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    editorInstance.focus();

    const selection = window.getSelection();
    if (savedRange.current && selection) {
      selection.removeAllRanges();
      selection.addRange(savedRange.current);
    }
    
    switch (modalConfig.type) {
      case 'table': {
        const rows = parseInt(input1, 10);
        const cols = parseInt(input2, 10);
        if (rows > 0 && cols > 0) {
          let tbl = '<table style="width:100%; border: 1px solid #e2e8f0; border-collapse: collapse; margin-bottom: 2rem;">';
          for (let r = 0; r < rows; r++) {
            tbl += '<tr>';
            for (let c = 0; c < cols; c++) {
              tbl += '<td style="border: 1px solid #e2e8f0; padding: 12px;">&nbsp;</td>';
            }
            tbl += '</tr>';
          }
          tbl += '</table><p>&nbsp;</p>';
          editorInstance.insertContent(tbl);
        }
        break;
      }
      case 'image':
        if (input1) {
          editorInstance.insertContent(`<img src="${input1}" alt="Image" style="max-width:100%; border-radius:1rem; margin: 2rem 0; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);" />`);
        }
        break;
      case 'link':
        if (input1 && linkText) {
          const linkHTML = `<a href="${input1}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
          editorInstance.insertContent(linkHTML);
        }
        break;
    }

    setModalConfig({ type: null, title: '' });
  };

  return (
    <>
      <div className="border-b border-zinc-100 bg-white/90 backdrop-blur-md p-3 flex flex-wrap gap-2 sticky top-0 z-20 overflow-x-auto no-scrollbar items-center shrink-0 justify-between w-full">
        <div className="flex items-center flex-wrap gap-2">
          <ToolbarGroup>
            <ToolbarButton icon={<Undo size={18} />} onClick={() => handleFormat('undo')} title="Undo" />
            <ToolbarButton icon={<Redo size={18} />} onClick={() => handleFormat('redo')} title="Redo" />
          </ToolbarGroup>

          <ToolbarGroup>
            <div className="relative flex items-center px-4">
              <select 
                value={currentBlockType || 'p'}
                onChange={(e) => handleFormat('formatBlock', e.target.value)} 
                className="bg-transparent appearance-none text-[11px] font-black uppercase outline-none cursor-pointer pr-8 py-2.5 tracking-widest text-zinc-800"
              >
                <option value="p">Paragraph</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="h4">Heading 4</option>
                <option value="h5">Heading 5</option>
                <option value="h6">Heading 6</option>
                <option value="blockquote">Quote</option>
                <option value="pre">Code Block</option>
              </select>
              <ChevronDown size={12} className="absolute right-4 pointer-events-none text-zinc-400" />
            </div>
          </ToolbarGroup>

          <ToolbarGroup>
            <ToolbarButton icon={<Bold size={18} />} onClick={() => handleFormat('bold')} title="Bold" />
            <ToolbarButton icon={<Italic size={18} />} onClick={() => handleFormat('italic')} title="Italic" />
            <ToolbarButton icon={<Underline size={18} />} onClick={() => handleFormat('underline')} title="Underline" />
            <ToolbarButton icon={<Strikethrough size={18} />} onClick={() => handleFormat('strikethrough')} title="Strikethrough" />
            <ToolbarButton icon={<Subscript size={18} />} onClick={() => handleFormat('subscript')} title="Subscript" />
            <ToolbarButton icon={<Superscript size={18} />} onClick={() => handleFormat('superscript')} title="Superscript" />
          </ToolbarGroup>

          <ToolbarGroup>
            <ToolbarButton icon={<TableIcon size={18} />} onClick={() => openModal('table')} title="Insert Table" />
            <ToolbarButton icon={<ImageIcon size={18} />} onClick={() => openModal('image')} title="Insert Image" />
            <ToolbarButton icon={<Minus size={18} />} onClick={() => editorInstance.insertContent('<hr/>')} title="Horizontal Line" />
            <ToolbarButton icon={<LinkIcon size={18} />} onClick={() => openModal('link')} title="Insert Link" active={isLinkActive} />
          </ToolbarGroup>
        </div>
      </div>

      {modalConfig.type && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white border border-zinc-200 rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-zinc-50 flex items-center justify-between">
              <h3 className="font-black text-xl uppercase tracking-tighter text-zinc-900 flex items-center gap-2">
                {modalConfig.title}
              </h3>
              <button onClick={() => setModalConfig({ type: null, title: '' })} className="text-zinc-400 hover:text-zinc-900 transition-colors">
                <X size={24}/>
              </button>
            </div>
            <form onSubmit={handleModalSubmit} className="p-8 space-y-6">
              {modalConfig.type === 'table' && (
                <div className="flex gap-4">
                  <div className="w-1/2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Rows</label>
                    <input required type="number" value={input1} onChange={(e) => setInput1(e.target.value)} min="1" className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold" />
                  </div>
                  <div className="w-1/2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Columns</label>
                    <input required type="number" value={input2} onChange={(e) => setInput2(e.target.value)} min="1" className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold" />
                  </div>
                </div>
              )}

              {modalConfig.type === 'image' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">URL</label>
                  <input required type="url" value={input1} onChange={(e) => setInput1(e.target.value)} placeholder="https://..." className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold" />
                </div>
              )}

              {modalConfig.type === 'link' && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">URL</label>
                    <input required type="url" value={input1} onChange={(e) => setInput1(e.target.value)} placeholder="https://..." className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Text to display</label>
                    <input required type="text" value={linkText} onChange={(e) => setLinkText(e.target.value)} className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold" />
                  </div>
                </>
              )}
              
              <div className="flex gap-3">
                {modalConfig.type === 'link' && isEditingLink && (
                  <button type="button" onClick={handleRemoveLink} className="w-auto px-6 py-5 bg-red-50 text-red-600 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-red-100 transition-all active:scale-95">
                    <Trash2 size={16} />
                  </button>
                )}
                <button type="submit" className="w-full py-5 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl hover:bg-black transition-all active:scale-95">
                  <Send size={16} /> {modalConfig.type === 'link' ? 'Apply' : 'Insert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};