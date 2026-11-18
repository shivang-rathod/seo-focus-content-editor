import React, { useState } from 'react';
import { Trash, Plus, FileCode, CheckCircle2, AlertCircle, RefreshCw, ChevronDown, ChevronRight, Link as LinkIcon, ExternalLink, Activity, Globe } from 'lucide-react';
import { SEOHealth, FAQ } from '../../../types/editor.types';

interface SEOTabProps {
  health: SEOHealth;
  metaTitle: string;
  setMetaTitle: (s: string) => void;
  metaDescription: string;
  setMetaDescription: (s: string) => void;
  faqs: FAQ[];
  setFaqs: (f: FAQ[]) => void;
  onGenerateMetadata: (type: 'title' | 'description') => Promise<void>;
  onGenerateFAQs: () => void;
  onExportSchema: () => void;
  isAIProcessing?: boolean;
  setBrokenLinks?: (links: string[]) => void;
  content: string;
  targetDomain?: string;
  setTargetDomain?: (s: string) => void;
}

const MetaFeedback = ({ current, min, max, startsWithKey }: any) => {
  let status = 'Optimal';
  let color = 'text-emerald-500';
  const len = current.length;

  if (len === 0) { status = 'Empty'; color = 'text-red-500'; }
  else if (len < min - 10) { status = 'Too Short'; color = 'text-red-400'; }
  else if (len < min) { status = 'Slightly Short'; color = 'text-yellow-500'; }
  else if (len > max + 10) { status = 'Too Long'; color = 'text-red-400'; }
  else if (len > max) { status = 'Slightly Long'; color = 'text-yellow-500'; }

  return (
    <div className="mt-2 flex items-center justify-between text-[10px] font-bold">
      <div className="flex items-center gap-3">
        <span className={color}>{len} chars</span>
        <span className="text-zinc-300">|</span>
        <span className={color}>{status}</span>
      </div>
      <div className="flex items-center gap-2">
        {startsWithKey !== undefined && (
          <span className={`px-1.5 py-0.5 rounded flex items-center gap-1 ${startsWithKey ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-400'}`}>
            Start {startsWithKey ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
          </span>
        )}
      </div>
    </div>
  );
};

export const SEOTab = ({
  health,
  metaTitle,
  setMetaTitle,
  metaDescription,
  setMetaDescription,
  faqs,
  setFaqs,
  onGenerateMetadata,
  onGenerateFAQs,
  onExportSchema,
  isAIProcessing,
  setBrokenLinks,
  content,
  targetDomain,
  setTargetDomain
}: SEOTabProps) => {
  const [checkingLinks, setCheckingLinks] = useState(false);
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [generatingType, setGeneratingType] = useState<'title' | 'description' | null>(null);
  const [hasCheckedLinks, setHasCheckedLinks] = useState(false);

  const performLinkCheck = async () => {
    if (!setBrokenLinks) return;
    setCheckingLinks(true);
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content || '', 'text/html');
      const anchors = Array.from(doc.querySelectorAll('a'));
      const flagged: string[] = [];

      anchors.forEach((a) => {
        const href = (a.getAttribute('href') || '').trim();
        if (!href || href === '#' || href.toLowerCase().startsWith('javascript:')) {
          flagged.push(href || '(empty href)');
          return;
        }
        if (href.startsWith('http://') || href.startsWith('https://')) {
          try {
            new URL(href);
          } catch {
            flagged.push(href);
          }
        } else if (!href.startsWith('/') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
          flagged.push(href);
        }
      });

      setBrokenLinks(flagged);
      setHasCheckedLinks(true);
    } finally {
      setCheckingLinks(false);
    }
  };

  const handleGenerate = async (type: 'title' | 'description') => {
    setGeneratingType(type);
    try {
      await onGenerateMetadata(type);
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingType(null);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="p-6 bg-white border border-zinc-100 rounded-[32px] text-zinc-900 shadow-lg shadow-zinc-500/5">
        <div className="flex items-center justify-between mb-4"><span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">SEO Score</span><Activity size={16} className="text-blue-500" /></div>
        <div className="flex items-end gap-3 mb-6"><div className="text-6xl font-black tracking-tighter leading-none">{health.score}</div><div className="text-xl font-black text-zinc-300 pb-1">/100</div></div>
        <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden mb-4"><div className="h-full bg-zinc-900 transition-all duration-1000 ease-out" style={{ width: `${health.score}%` }} /></div>
        <div className="flex items-center justify-between"><p className="text-[10px] font-bold text-zinc-400 leading-relaxed">Optimization level based on structure & meta.</p><button onClick={() => setBreakdownOpen(!breakdownOpen)} className="flex items-center gap-1 text-[9px] font-black uppercase text-zinc-500 hover:text-zinc-900 transition-colors">{breakdownOpen ? 'Hide' : 'Breakdown'}{breakdownOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}</button></div>
        {breakdownOpen && (
          <div className="mt-6 pt-6 border-t border-zinc-100 space-y-3 animate-in slide-in-from-top-2 duration-300">
            {[{ label: 'Meta Tags', score: health.scoreBreakdown.meta, max: 40 }, { label: 'Heading Structure', score: health.scoreBreakdown.heading, max: 15 }, { label: 'Keyword Opt', score: health.scoreBreakdown.keyword, max: 20 }, { label: 'Content Quality', score: health.scoreBreakdown.content, max: 15 }, { label: 'Link Structure', score: health.scoreBreakdown.link, max: 10 }].map((cat, i) => (<div key={i} className="flex items-center justify-between text-[10px] font-bold"><span className="text-zinc-400 uppercase tracking-wider">{cat.label}</span><div className="flex items-center gap-2"><div className="w-24 h-1.5 bg-zinc-100 rounded-full overflow-hidden"><div className="h-full bg-zinc-800" style={{ width: `${(cat.score / cat.max) * 100}%` }}></div></div><span className="text-zinc-800 w-8 text-right">{cat.score}/{cat.max}</span></div></div>))}
          </div>
        )}
      </div>

      <div className="space-y-8">
        <h3 className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.25em] mb-5">Meta Optimization</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1"><label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Meta Title</label><button onClick={() => handleGenerate('title')} className="text-[10px] font-black text-blue-600 uppercase hover:underline disabled:text-zinc-400" disabled={isAIProcessing}>{generatingType === 'title' ? 'Generating...' : 'Generate'}</button></div>
          <div className="bg-white border border-zinc-100 rounded-2xl p-4 focus-within:border-blue-300 transition-colors"><input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="Enter Meta Title..." className="w-full text-xs font-bold outline-none text-zinc-800 placeholder:text-zinc-300" /><MetaFeedback current={metaTitle} min={50} max={60} /></div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1"><label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Meta Description</label><button onClick={() => handleGenerate('description')} className="text-[10px] font-black text-blue-600 uppercase hover:underline disabled:text-zinc-400" disabled={isAIProcessing}>{generatingType === 'description' ? 'Generating...' : 'Generate'}</button></div>
          <div className="bg-white border border-zinc-100 rounded-2xl p-4 focus-within:border-blue-300 transition-colors"><textarea rows={4} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder="Enter Meta Description..." className="w-full text-xs font-medium outline-none resize-none text-zinc-600 placeholder:text-zinc-300" /><MetaFeedback current={metaDescription} min={140} max={160} /></div>
        </div>
      </div>

      <div className="pt-8 border-t border-zinc-50 space-y-5 relative">
        <h3 className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.25em]">Link Analysis</h3>
        <div className="space-y-3"><label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider px-1">Website URL</label><div className="relative group"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"><Globe size={16} /></span><input type="text" placeholder="e.g. example.com" value={targetDomain || ''} onChange={(e) => setTargetDomain?.(e.target.value)} className="w-full bg-white border border-zinc-100 focus:border-blue-400 rounded-2xl py-3 pl-12 pr-6 text-xs focus:bg-white outline-none transition-all font-bold text-zinc-800" /></div></div>
        <div className="grid grid-cols-2 gap-4"><div className="p-5 bg-white border border-zinc-100 rounded-2xl shadow-sm shadow-zinc-200/50"><div className="flex items-center justify-between mb-3"><div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Internal</div><LinkIcon size={14} className="text-zinc-300" /></div><div className="text-2xl font-black tracking-tighter text-zinc-900">{health.linkStats.internal}</div></div><div className="p-5 bg-white border border-zinc-100 rounded-2xl shadow-sm shadow-zinc-200/50"><div className="flex items-center justify-between mb-3"><div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">External</div><ExternalLink size={14} className="text-zinc-300" /></div><div className="text-2xl font-black tracking-tighter text-zinc-900">{health.linkStats.external}</div></div></div>
        <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold text-zinc-400">
              {health.linkStats.broken.length > 0
                ? `${health.linkStats.broken.length} Invalid Link${health.linkStats.broken.length > 1 ? 's' : ''} Found`
                : hasCheckedLinks ? 'All Link URLs Valid' : 'Validate Document Links'}
            </div>
            <button onClick={performLinkCheck} disabled={checkingLinks} className="flex items-center gap-1 text-[9px] font-black uppercase text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors disabled:opacity-50"><RefreshCw size={10} className={checkingLinks ? 'animate-spin' : ''} />{checkingLinks ? 'Checking...' : 'Check Links'}</button>
          </div>
          {health.linkStats.broken.length > 0 && (<div className="mt-3 space-y-1">{health.linkStats.broken.map((link, i) => (<div key={i} className="text-[10px] text-red-500 font-medium truncate flex items-center gap-2"><AlertCircle size={10} /> {link}</div>))}</div>)}
        </div>
      </div>

      <div className="pt-8 border-t border-zinc-50 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.25em]">FAQs & Schema</h3>
          <button onClick={onGenerateFAQs} disabled={isAIProcessing} className="text-[10px] font-black text-blue-600 uppercase hover:underline disabled:text-zinc-400 disabled:no-underline flex items-center gap-1.5">{isAIProcessing ? 'Generating...' : 'Generate'}</button>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-zinc-50 border border-zinc-100 rounded-[24px] p-5 space-y-3 relative group">
              <button onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))} className="absolute top-4 right-4 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash size={14} /></button>
              <input type="text" placeholder="Question..." value={faq.question} onChange={(e) => { const n = [...faqs]; n[idx] = { ...n[idx], question: e.target.value }; setFaqs(n); }} className="w-full bg-white border border-zinc-100 rounded-lg px-3 py-2 text-xs font-bold outline-none" />
              <textarea placeholder="Answer..." value={faq.answer} onChange={(e) => { const n = [...faqs]; n[idx] = { ...n[idx], answer: e.target.value }; setFaqs(n); }} className="w-full bg-white border border-zinc-100 rounded-lg p-3 text-xs outline-none resize-none" />
            </div>
          ))}
          <button onClick={() => setFaqs([...faqs, { question: '', answer: '' }])} className="w-full py-4 border-2 border-dashed border-zinc-100 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:bg-zinc-50"><Plus size={14} /> Add FAQ</button>
          <button onClick={onExportSchema} className="w-full py-4 bg-blue-50 text-blue-600 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"><FileCode size={16} /> Export Schema</button>
        </div>
      </div>
    </div>
  );
};