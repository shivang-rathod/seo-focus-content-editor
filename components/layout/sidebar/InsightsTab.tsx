
import React from 'react';
import { Sparkles, Award } from 'lucide-react';
import { TextStats, ReadabilityInsights, SEOHealth, EEATScore } from '../../../types/editor.types.ts';

interface InsightsTabProps {
  stats: TextStats;
  readability: ReadabilityInsights | null;
  health: SEOHealth;
  onNavigateOutline?: (text: string) => void;
  eeatScore: EEATScore | null;
}

const StatCard = ({ label, value }: any) => (
  <div className="p-5 bg-white border border-zinc-100 rounded-2xl shadow-sm shadow-zinc-200/50">
    <div className="text-[10px] font-black text-zinc-400 uppercase mb-1.5 tracking-widest">{label}</div>
    <div className="text-2xl font-black tracking-tighter text-zinc-900">{value}</div>
  </div>
);

export const InsightsTab = ({ stats, readability, health, onNavigateOutline, eeatScore }: InsightsTabProps) => {
  const h1Count = stats.headingTree.filter(h => h.tag === 'h1').length;
  const h2Count = stats.headingTree.filter(h => h.tag === 'h2').length;
  const h3Count = stats.headingTree.filter(h => h.tag === 'h3').length;
  const h4Count = stats.headingTree.filter(h => h.tag === 'h4').length;

  const getBgColorFromTextColor = (textColor: string) => {
    if (!textColor) return 'bg-zinc-100';
    return textColor.replace('text-', 'bg-');
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* 1. Content Score Badge */}
      <div className="p-6 bg-white border border-zinc-100 rounded-[32px] text-zinc-900 shadow-lg shadow-zinc-500/5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">Content Score</span>
          <Sparkles size={16} className="text-blue-500" />
        </div>
        <div className="flex items-end gap-3 mb-6">
          <div className="text-6xl font-black tracking-tighter leading-none">{health.score}</div>
          <div className="text-xl font-black text-zinc-300 pb-1">/100</div>
        </div>
        <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-zinc-900 transition-all duration-1000 ease-out" 
            style={{ width: `${health.score}%` }} 
          />
        </div>
        <p className="text-[10px] font-bold text-zinc-400 leading-relaxed">
          Aggregated overall health based on structural and semantic analysis.
        </p>
      </div>

      {/* 2. Readability Section */}
      <div className="space-y-5">
        <h3 className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.25em]">Readability Analysis</h3>
        <div className="grid grid-cols-2 gap-4">
          {readability && (
            <div className="col-span-2 p-5 bg-white border border-zinc-100 rounded-2xl shadow-sm shadow-zinc-200/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[10px] font-black text-zinc-400 uppercase mb-1.5 tracking-widest">Ease Score</div>
                  <div className={`text-4xl font-black tracking-tighter ${readability.color}`}>
                    {readability.score}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-black uppercase text-zinc-900 tracking-wider mb-1">
                    {readability.level}
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-tight italic max-w-[150px]">
                    {readability.description}
                  </p>
                </div>
              </div>
              <div className="h-2 bg-zinc-100 rounded-full overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 opacity-20" />
                <div 
                  className={`h-full relative z-10 transition-all duration-700 ${readability.score > 60 ? 'bg-emerald-500' : readability.score > 30 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${readability.score}%` }}
                />
              </div>
            </div>
          )}
          <StatCard label="Total Words" value={stats.words} />
          <StatCard label="Read Time" value={`${stats.readingTime}m`} />
          <StatCard label="Sentences" value={stats.sentences} />
          <StatCard label="Paragraphs" value={stats.paragraphs} />
        </div>
      </div>

      {/* 3. E-E-A-T Section (New Layout) */}
      {eeatScore && (
        <div className="space-y-5">
          <h3 className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.25em]">E-E-A-T Score</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Wide Overall Card */}
            <div className="col-span-2 p-5 bg-white border border-zinc-100 rounded-2xl shadow-sm shadow-zinc-200/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[10px] font-black text-zinc-400 uppercase mb-1.5 tracking-widest flex items-center gap-2">
                    <Award size={12}/> Overall Score
                  </div>
                  <div className={`text-4xl font-black tracking-tighter ${eeatScore.color}`}>
                    {eeatScore.overall}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-zinc-500 italic max-w-[150px]">
                    {eeatScore.summary}
                  </p>
                </div>
              </div>
              <div className="h-2 bg-zinc-100 rounded-full overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 opacity-20" />
                <div 
                  className={`h-full relative z-10 transition-all duration-700 ${getBgColorFromTextColor(eeatScore.color)}`}
                  style={{ width: `${eeatScore.overall}%` }}
                />
              </div>
            </div>
            
            {/* Minimal Stat Cards */}
            <StatCard label="Experience" value={eeatScore.experience.score} />
            <StatCard label="Expertise" value={eeatScore.expertise.score} />
            <StatCard label="Authority" value={eeatScore.authority.score} />
            <StatCard label="Trust" value={eeatScore.trust.score} />
          </div>
        </div>
      )}

      {/* 4. Heading Structure */}
      <div className="space-y-5">
        <h3 className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.25em]">Heading Structure</h3>
        <div className="grid grid-cols-4 gap-3">
          <div className={`p-4 border rounded-2xl text-center ${h1Count === 1 ? 'border-emerald-100 bg-emerald-50 text-emerald-600' : 'border-red-100 bg-red-50 text-red-600'}`}>
             <div className="text-[9px] font-black uppercase tracking-tighter opacity-70">H1</div>
             <div className="text-lg font-black">{h1Count}</div>
          </div>
          <div className="p-4 border border-zinc-100 rounded-2xl text-center bg-white">
             <div className="text-[9px] font-black uppercase tracking-tighter text-zinc-400">H2</div>
             <div className="text-lg font-black text-zinc-800">{h2Count}</div>
          </div>
          <div className="p-4 border border-zinc-100 rounded-2xl text-center bg-white">
             <div className="text-[9px] font-black uppercase tracking-tighter text-zinc-400">H3</div>
             <div className="text-lg font-black text-zinc-800">{h3Count}</div>
          </div>
          <div className="p-4 border border-zinc-100 rounded-2xl text-center bg-white">
             <div className="text-[9px] font-black uppercase tracking-tighter text-zinc-400">H4</div>
             <div className="text-lg font-black text-zinc-800">{h4Count}</div>
          </div>
        </div>
        
        <div className="bg-zinc-50 p-6 rounded-[24px] border border-zinc-100">
          <div className="space-y-3">
            {stats.headingTree.length > 0 ? stats.headingTree.map((h, i) => (
              <button key={i} onClick={() => onNavigateOutline?.(h.text)} className="w-full text-left flex gap-3 items-center group" style={{ paddingLeft: `${(h.level - 1) * 16}px` }}>
                <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase shrink-0">{h.tag}</span>
                <span className="text-xs font-bold text-zinc-500 line-clamp-1 group-hover:text-blue-600 transition-colors">{h.text}</span>
              </button>
            )) : <div className="text-[11px] text-zinc-400 italic text-center">No structure yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
