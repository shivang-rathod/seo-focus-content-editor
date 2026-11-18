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
    if (percentage < 0.3) return 'text-zinc-400';
    if (percentage < 0.8) return 'text-amber-500';
    if (percentage <= 2) return 'text-emerald-600';
    if (percentage <= 3) return 'text-orange-500';
    return 'text-red-500';
  };

  const filteredKeywords = keywords.filter(k =>
    k.phrase.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] font-medium text-zinc-400 uppercase tracking-[0.12em]">Targeting</h3>
          <button
            onClick={toggleHighlights}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider transition-all ${
              highlightsEnabled ? 'bg-emerald-600 text-white shadow-sm' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
            }`}
          >
            {highlightsEnabled ? <Eye size={12} /> : <EyeOff size={12} />}
            <span>{highlightsEnabled ? 'On' : 'Off'}</span>
          </button>
        </div>

        <div className="space-y-3">
          <div className="relative group">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500"><Star size={15} fill="currentColor" /></span>
            <input
              type="text"
              placeholder="Primary Keyword..."
              value={targets.primary}
              onChange={(e) => setTargets({ ...targets, primary: e.target.value })}
              className="w-full bg-emerald-50/40 border border-emerald-100 focus:border-emerald-400 rounded-xl py-3 pl-10 pr-4 text-sm focus:bg-white outline-none transition-all font-medium text-zinc-800"
            />
          </div>
          <div className="space-y-2.5">
            {targets.secondary.map((val, idx) => (
              <div key={idx} className="relative group">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500 opacity-60 group-focus-within:opacity-100 transition-opacity"><Star size={13} fill="currentColor" /></span>
                <input
                  type="text"
                  placeholder={`Secondary Keyword ${idx + 1}`}
                  value={val}
                  onChange={(e) => {
                    const newSec = [...targets.secondary];
                    newSec[idx] = e.target.value;
                    setTargets({ ...targets, secondary: newSec });
                  }}
                  className="w-full bg-white border border-zinc-200/80 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:border-amber-400 outline-none transition-all focus:bg-amber-50/20 font-normal text-zinc-700"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-zinc-100">
        <h3 className="text-[11px] font-medium text-zinc-400 uppercase tracking-[0.12em] mb-4">Keyword Density</h3>

        <div className="relative mb-3">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"><Search size={14} /></span>
          <input
            type="text"
            placeholder="Search keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-zinc-200/80 rounded-xl py-2.5 pl-9 pr-4 text-xs font-normal focus:border-blue-300 outline-none transition-all"
          />
        </div>

        <div className="flex bg-zinc-100 p-1 rounded-xl gap-1 shrink-0 mb-5">
          {[1, 2, 3, 4].map(num => (
            <button key={num} onClick={() => { setSeoTab(num as SEOPhraseTab); setIsExpanded(false); }} className={`flex-1 py-2 rounded-lg text-[11px] font-medium uppercase transition-all ${seoTab === num ? 'bg-white text-blue-600 shadow-xs' : 'text-zinc-500 hover:text-zinc-700'}`}>{num}W</button>
          ))}
        </div>

        <div className={`rounded-2xl border border-zinc-100 bg-white overflow-hidden shadow-xs transition-all duration-300 ${isExpanded ? 'max-h-[460px] overflow-y-auto custom-scrollbar' : ''}`}>
          {filteredKeywords.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/80 text-[10px] font-medium text-zinc-400 border-b border-zinc-100 sticky top-0 z-10 uppercase tracking-wider">
                <tr><th className="px-4 py-3">Phrase</th><th className="px-4 py-3 text-right">Qty</th><th className="px-4 py-3 text-right">Dens</th></tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {(isExpanded ? filteredKeywords : filteredKeywords.slice(0, 12)).map((item, idx) => {
                  const isPrimary = targets.primary && item.phrase.toLowerCase() === targets.primary.toLowerCase();
                  const isSecondary = targets.secondary.some(s => s && item.phrase.toLowerCase() === s.toLowerCase());

                  return (
                    <tr key={idx} className={`hover:bg-zinc-50/60 transition-colors ${isPrimary ? 'bg-emerald-50/40' : isSecondary ? 'bg-amber-50/40' : ''}`}>
                      <td className="px-4 py-3 font-medium max-w-[160px] text-zinc-700 flex items-center gap-2">
                        {isPrimary && <Star size={11} className="text-emerald-500 fill-emerald-500 shrink-0" />}
                        {isSecondary && <Star size={10} className="text-amber-500 fill-amber-500 shrink-0" />}
                        <span className="truncate" title={item.phrase}>{item.phrase}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-400 tabular-nums">{item.count}</td>
                      <td className="px-4 py-3 text-right">
                        <div className={`font-semibold tabular-nums ${getDensityColor(item.percentage)}`}>{item.percentage}%</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-zinc-400 text-xs italic">
              {searchTerm ? `No keywords found matching "${searchTerm}"` : 'Start typing to analyze keyword density.'}
            </div>
          )}
        </div>
        {filteredKeywords.length > 12 && (
          <button onClick={() => setIsExpanded(!isExpanded)} className="w-full py-3 text-[11px] font-medium uppercase tracking-wider text-blue-600 flex items-center justify-center gap-1.5 mt-2">
            {isExpanded ? 'Collapse' : `Full List (${filteredKeywords.length})`}
            <ChevronDown className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} size={15} />
          </button>
        )}
      </div>

      <div className="pt-6 border-t border-zinc-100">
        <h3 className="text-[11px] font-medium text-zinc-400 uppercase tracking-[0.12em] mb-4">NLP Terms</h3>
        <div className="flex flex-wrap gap-2">
          {stats.entities.length > 0 ? stats.entities.map((entity, i) => (
            <div key={i} className="px-3 py-1 bg-white border border-zinc-200/80 rounded-full text-[11px] font-normal text-zinc-600 flex items-center gap-1.5">
              <Cpu size={10} className="text-blue-500" /> {entity}
            </div>
          )) : <div className="text-xs text-zinc-400 italic text-center w-full">No entities detected.</div>}
        </div>
      </div>
    </div>
  );
};