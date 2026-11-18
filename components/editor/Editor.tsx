import React, { memo, useRef, useState, useCallback, useEffect } from 'react';
import { KeywordTarget } from '../../types/editor.types';

interface EditorProps {
  initialContent: string;
  onUpdate: (html: string) => void;
  onInit: (instance: any) => void;
  onSelectionChange: (blockType: string, isLink: boolean) => void;
}

export const Editor = memo(({ initialContent, onUpdate, onInit, onSelectionChange }: EditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastContentEmitted = useRef(initialContent);
  const [, setIsHighlighting] = useState(false);
  const lastBlockType = useRef('p');
  const lastIsLink = useRef(false);

  const analyzeParagraphs = useCallback(() => {
    if (!editorRef.current) return;
    const paras = editorRef.current.querySelectorAll('p');
    paras.forEach(p => {
      const words = p.innerText.trim().split(/\s+/).filter(Boolean).length;
      if (words > 150) {
        p.classList.add('para-warning');
      } else {
        p.classList.remove('para-warning');
      }
    });
  }, []);
  
  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !editorRef.current) return;

    if (!editorRef.current.contains(selection.anchorNode)) {
      if (lastBlockType.current !== 'p' || lastIsLink.current !== false) {
        lastBlockType.current = 'p';
        lastIsLink.current = false;
        onSelectionChange('p', false);
      }
      return;
    }

    let node = selection.anchorNode;
    let blockType = 'p';
    let isInsideLink = false;

    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();

        if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre'].includes(tagName)) {
          if (blockType === 'p') blockType = tagName;
        }
        if (tagName === 'a') {
          isInsideLink = true;
        }
      }
      node = node.parentNode;
    }
    
    if (blockType !== lastBlockType.current || isInsideLink !== lastIsLink.current) {
      lastBlockType.current = blockType;
      lastIsLink.current = isInsideLink;
      onSelectionChange(blockType, isInsideLink);
    }
  }, [onSelectionChange]);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [handleSelectionChange]);

  const emitUpdate = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      lastContentEmitted.current = html;
      onUpdate(html);
      analyzeParagraphs();
    }
  }, [onUpdate, analyzeParagraphs]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialContent;
      lastContentEmitted.current = initialContent;
      
      const instance = {
        getContent: () => editorRef.current?.innerHTML || '',
        setContent: (html: string) => {
          if (editorRef.current) {
            editorRef.current.innerHTML = html;
            emitUpdate();
          }
        },
        focus: () => {
          editorRef.current?.focus({ preventScroll: true });
        },
        execCommand: (cmd: string, ui: boolean, val: any) => {
          document.execCommand(cmd, ui, val);
          emitUpdate();
          handleSelectionChange(); 
        },
        insertContent: (html: string) => {
          document.execCommand('insertHTML', false, html);
          emitUpdate();
        },
        getSelection: () => {
          const sel = window.getSelection();
          if (!sel || sel.rangeCount === 0 || !editorRef.current) return '';
          if (!editorRef.current.contains(sel.anchorNode)) return '';
          return sel.toString() || '';
        },
        scrollToText: (text: string) => {
          if (!editorRef.current) return;
          const walker = document.createTreeWalker(editorRef.current, NodeFilter.SHOW_TEXT);
          let node;
          while ((node = walker.nextNode())) {
            if (node.textContent?.toLowerCase().includes(text.toLowerCase())) {
              (node.parentElement as HTMLElement)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              break;
            }
          }
        },
        toggleHighlights: (targets: KeywordTarget, enabled: boolean) => {
          if (!editorRef.current) return;
          setIsHighlighting(enabled);

          const contentDiv = editorRef.current;
          
          const marks = contentDiv.querySelectorAll('mark.seo-highlight');
          marks.forEach(mark => {
            const parent = mark.parentNode;
            if (parent) {
              parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
              parent.normalize();
            }
          });

          if (!enabled) {
            emitUpdate();
            return;
          }

          const terms = [
            { text: targets.primary, color: '#bbf7d0' },
            ...targets.secondary.map(s => ({ text: s, color: '#fef08a' }))
          ].filter(t => t.text && t.text.trim().length > 0);

          if (terms.length === 0) return;

          const walker = document.createTreeWalker(contentDiv, NodeFilter.SHOW_TEXT);
          const textNodes: Text[] = [];
          let node;
          while ((node = walker.nextNode())) textNodes.push(node as Text);

          textNodes.forEach(textNode => {
            const text = textNode.nodeValue || '';
            const parent = textNode.parentNode;
            if (!parent || parent.nodeName === 'MARK' || parent.nodeName === 'SCRIPT' || parent.nodeName === 'STYLE') return;
             
            let hasMatch = false;
            const fragment = document.createDocumentFragment();
            let lastIndex = 0;
             
            while (lastIndex < text.length) {
              let bestMatch = { index: -1, term: '', color: '' };
               
              terms.forEach(({ text: termText, color }) => {
                const regex = new RegExp(`\\b${termText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
                const subText = text.substring(lastIndex);
                const match = subText.match(regex);
                if (match && match.index !== undefined) {
                  const absoluteIndex = lastIndex + match.index;
                  if (bestMatch.index === -1 || absoluteIndex < bestMatch.index) {
                    bestMatch = { index: absoluteIndex, term: match[0], color };
                  }
                }
              });

              if (bestMatch.index !== -1) {
                hasMatch = true;
                fragment.appendChild(document.createTextNode(text.substring(lastIndex, bestMatch.index)));
                 
                const mark = document.createElement('mark');
                mark.className = 'seo-highlight';
                mark.style.backgroundColor = bestMatch.color;
                mark.style.borderRadius = '4px';
                mark.style.padding = '2px 0';
                mark.textContent = bestMatch.term;
                fragment.appendChild(mark);

                lastIndex = bestMatch.index + bestMatch.term.length;
              } else {
                fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
                break;
              }
            }

            if (hasMatch) {
              parent.replaceChild(fragment, textNode);
            }
          });
          
          emitUpdate();
        }
      };
      onInit(instance);
      analyzeParagraphs();
    }
  }, [onInit, analyzeParagraphs, emitUpdate, handleSelectionChange]);

  useEffect(() => {
    if (editorRef.current && initialContent !== lastContentEmitted.current) {
      editorRef.current.innerHTML = initialContent;
      lastContentEmitted.current = initialContent;
      analyzeParagraphs();
    }
  }, [initialContent, analyzeParagraphs]);

  const handleInput = () => {
    emitUpdate();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text/plain');
    const pastedHtml = e.clipboardData.getData('text/html');

    if (!pastedText && !pastedHtml) return;

    if (pastedHtml) {
      document.execCommand('insertHTML', false, pastedHtml);
    } else {
      document.execCommand('insertText', false, pastedText);
    }

    setTimeout(emitUpdate, 0);
  };

  return (
    <div className="relative w-full group flex flex-col">
      <div 
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        className="editor-content w-full outline-none"
        spellCheck="true"
        aria-label="Content Editor"
      />
    </div>
  );
});
