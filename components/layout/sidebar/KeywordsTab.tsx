import React, { useState } from 'react';
import { Cpu, Star, Eye, EyeOff, Search, ChevronDown } from 'lucide-react';
import { SEOPhraseTab, KeywordDensity, KeywordTarget, TextStats } from '../../../types/editor.types';

interface KeywordsTabProps {
  targets: KeywordTarget;
  setTargets: (t: KeywordTarget) => void;
  keywords: KeywordDensity[];
  seoTab: SEOPhraseTab;
  setSeoTab: (num: SEOPhraseTab) => void;
  isExpanded: boolean;
  setIsExpanded: (val: boolean) => void;
  stats: TextStats;
  onHighlight: (enabled: boolean) => void;
}

export const KeywordsTab = ({
  targets,
  setTargets,
  keywords,
  seoTab,
  setSeoTab,
  isExpanded,
  setIsExpanded,
  stats,
  onHighlight
}: KeywordsTabProps) => {
  const [highlightsEnabled, setHighlightsEnabled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleHighlights = () => {
    const newState = !highlightsEnabled;
    setHighlightsEnabled(newState);
    onHighlight(newState);
  };

  const getDensityColor = (percentage: number) => {
    if (percentage < 0.3) return 'text-zinc-300';
    if (percentage < 0.8) return 'text-yellow-500';
    if (percentage <= 2) return 'text-emerald-500';
    if (percentage <= 3) return 'text-orange-500';
    return 'text-red-500';
  };

  const filteredKeywords = keywords.filter(k =>
    k.phrase.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.25em]">Targeting</h3>
          <button
            onClick={toggleHighlights}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all relative ${
              highlightsEnabled ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
            }`}
          >
            {highlightsEnabled ? <Eye size={12} /> : <EyeOff size={12} />}
            <span>{highlightsEnabled ? 'On' : 'Off'}</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500"><Star size={16} fill="currentColor" /></span>
            <input
              type="text"
              placeholder="Primary Keyword..."
              value={targets.primary}
              onChange={(e) => setTargets({ ...targets, primary: e.target.value })}
              className="w-full bg-green-50/50 border border-green-100 focus:border-green-400 rounded-2xl py-4 pl-12 pr-6 text-sm focus:bg-white outline-none transition-all font-bold text-zinc-800"
            />
          </div>
          <div className="space-y-3">
            {targets.secondary.map((val, idx) => (
              <div key={idx} className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500 opacity-60 group-focus-within:opacity-100 transition-opacity"><Star size={14} fill="currentColor" /></span>
                <input
                  type="text"
                  placeholder={`Secondary Keyword ${idx + 1}`}
                  value={val}
                  onChange={(e) => {
                    const newSec = [...targets.secondary];
                    newSec[idx] = e.target.value;
                    setTargets({ ...targets, secondary: newSec });
                  }}
                  className="w-full bg-white border border-zinc-100 rounded-xl py-3 pl-12 pr-5 text-xs focus:border-yellow-400 outline-none transition-all focus:bg-yellow-50/30 font-semibold"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-zinc-50">
        <h3 className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.25em] mb-5">Keyword Density</h3>

        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"><Search size={14} /></span>
          <input
            type="text"
            placeholder="Search keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-zinc-100 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold focus:border-blue-200 outline-none transition-all"
          />
        </div>

        <div className="flex bg-zinc-100 p-1 rounded-2xl gap-1 shrink-0 mb-6">
          {[1, 2, 3, 4].map(num => (
            <button key={num} onClick={() => { setSeoTab(num as SEOPhraseTab); setIsExpanded(false); }} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${seoTab === num ? 'bg-white text-blue-600 shadow-lg' : 'text-zinc-400 hover:text-zinc-600'}`}>{num}W</button>
          ))}
        </div>

        <div className={`rounded-3xl border border-zinc-100 bg-white overflow-hidden shadow-sm transition-all duration-300 ${isExpanded ? 'max-h-[500px] overflow-y-auto custom-scrollbar' : ''}`}>
          {filteredKeywords.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-[10px] font-black text-zinc-400 border-b border-zinc-100 sticky top-0 z-10">
                <tr><th className="px-5 py-4">PHRASE</th><th className="px-5 py-4 text-right">QTY</th><th className="px-5 py-4 text-right">DENS</th></tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {(isExpanded ? filteredKeywords : filteredKeywords.slice(0, 12)).map((item, idx) => {
                  const isPrimary = targets.primary && item.phrase.toLowerCase() === targets.primary.toLowerCase();
                  const isSecondary = targets.secondary.some(s => s && item.phrase.toLowerCase() === s.toLowerCase());

                  return (
                    <tr key={idx} className={`hover:bg-zinc-50/50 transition-colors ${isPrimary ? 'bg-green-50/50' : isSecondary ? 'bg-yellow-50/50' : ''}`}>
                      <td className="px-5 py-4 font-bold max-w-[160px] text-zinc-600 flex items-center gap-2">
                        {isPrimary && <Star size={12} className="text-green-500 fill-green-500 shrink-0" />}
                        {isSecondary && <Star size={10} className="text-yellow-500 fill-yellow-500 shrink-0" />}
                        <span className="truncate" title={item.phrase}>{item.phrase}</span>
                      </td>
                      <td className="px-5 py-4 text-right text-zinc-400 font-mono">{item.count}</td>
                      <td className="px-5 py-4 text-right">
                        <div className={`font-black ${getDensityColor(item.percentage)}`}>{item.percentage}%</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-zinc-400 text-xs font-bold italic">
              {searchTerm ? `No keywords found matching "${searchTerm}"` : 'Start typing to analyze keyword density.'}
            </div>
          )}
        </div>
        {filteredKeywords.length > 12 && (
          <button onClick={() => setIsExpanded(!isExpanded)} className="w-full py-4 text-[10px] font-black uppercase text-blue-600 flex items-center justify-center gap-2 mt-4">
            {isExpanded ? 'Collapse' : `Full List (${filteredKeywords.length})`}
            <ChevronDown className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} size={16} />
          </button>
        )}
      </div>

      <div className="pt-6 border-t border-zinc-50">
        <h3 className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.25em] mb-5">NLP Terms</h3>
        <div className="flex flex-wrap gap-2">
          {stats.entities.length > 0 ? stats.entities.map((entity, i) => (
            <div key={i} className="px-3 py-1.5 bg-white border border-zinc-100 rounded-full text-[10px] font-bold text-zinc-600 flex items-center gap-1.5 shadow-sm">
              <Cpu size={10} className="text-blue-500" /> {entity}
            </div>
          )) : <div className="text-[11px] text-zinc-400 italic text-center w-full">No entities detected.</div>}
        </div>
      </div>
    </div>
  );
};