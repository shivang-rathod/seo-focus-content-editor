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

const StatCard = ({ label, value }: { label: string; value: string | number }) => (
  <div className="p-4 bg-white border border-zinc-100 rounded-2xl shadow-xs">
    <div className="text-[11px] font-medium text-zinc-400 uppercase mb-1 tracking-[0.08em]">{label}</div>
    <div className="text-xl font-semibold tracking-tight tabular-nums text-zinc-800">{value}</div>
  </div>
);

export const InsightsTab = ({ stats, readability, health, onNavigateOutline, eeatScore }: InsightsTabProps) => {
  const h1Count = stats.headingTree.filter(h => h.tag === 'h1').length;
  const h2Count = stats.headingTree.filter(h => h.tag === 'h2').length;
  const h3Count = stats.headingTree.filter(h => h.tag === 'h3').length;
  const h4Count = stats.headingTree.filter(h => h.tag === 'h4').length;

  const getBgColorFromTextColor = (textColor: string) => {
    if (!textColor) return 'bg-zinc-200';
    return textColor.replace('text-', 'bg-');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* 1. Content Score Badge */}
      <div className="p-5 bg-white border border-zinc-100 rounded-3xl text-zinc-900 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400">Content Score</span>
          <Sparkles size={15} className="text-blue-500" />
        </div>
        <div className="flex items-baseline gap-2 mb-4">
          <div className="text-5xl font-semibold tracking-tight tabular-nums leading-none text-zinc-900">{health.score}</div>
          <div className="text-base font-medium text-zinc-300">/100</div>
        </div>
        <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-zinc-800 transition-all duration-1000 ease-out"
            style={{ width: `${health.score}%` }}
          />
        </div>
        <p className="text-[11px] text-zinc-400 leading-relaxed">
          Aggregated overall health based on structural and semantic analysis.
        </p>
      </div>

      {/* 2. Readability Section */}
      <div className="space-y-4">
        <h3 className="text-[11px] font-medium text-zinc-400 uppercase tracking-[0.12em]">Readability Analysis</h3>
        <div className="grid grid-cols-2 gap-3">
          {readability && (
            <div className="col-span-2 p-4 bg-white border border-zinc-100 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] font-medium text-zinc-400 uppercase mb-1 tracking-[0.08em]">Ease Score</div>
                  <div className={`text-3xl font-semibold tracking-tight tabular-nums ${readability.color}`}>
                    {readability.score}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-zinc-800 mb-0.5">
                    {readability.level}
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-snug max-w-[165px]">
                    {readability.description}
                  </p>
                </div>
              </div>
              <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 opacity-20" />
                <div
                  className={`h-full relative z-10 transition-all duration-700 ${readability.score > 60 ? 'bg-emerald-500' : readability.score > 30 ? 'bg-amber-500' : 'bg-rose-500'}`}
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

      {/* 3. E-E-A-T Section */}
      {eeatScore && (
        <div className="space-y-4">
          <h3 className="text-[11px] font-medium text-zinc-400 uppercase tracking-[0.12em]">E-E-A-T Score</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 p-4 bg-white border border-zinc-100 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] font-medium text-zinc-400 uppercase mb-1 tracking-[0.08em] flex items-center gap-1.5">
                    <Award size={12} /> Overall Score
                  </div>
                  <div className={`text-3xl font-semibold tracking-tight tabular-nums ${eeatScore.color}`}>
                    {eeatScore.overall}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-zinc-500 max-w-[165px] leading-snug">
                    {eeatScore.summary}
                  </p>
                </div>
              </div>
              <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 opacity-20" />
                <div
                  className={`h-full relative z-10 transition-all duration-700 ${getBgColorFromTextColor(eeatScore.color)}`}
                  style={{ width: `${eeatScore.overall}%` }}
                />
              </div>
            </div>

            <StatCard label="Experience" value={eeatScore.experience.score} />
            <StatCard label="Expertise" value={eeatScore.expertise.score} />
            <StatCard label="Authority" value={eeatScore.authority.score} />
            <StatCard label="Trust" value={eeatScore.trust.score} />
          </div>
        </div>
      )}

      {/* 4. Heading Structure */}
      <div className="space-y-4">
        <h3 className="text-[11px] font-medium text-zinc-400 uppercase tracking-[0.12em]">Heading Structure</h3>
        <div className="grid grid-cols-4 gap-2.5">
          <div className={`p-3 border rounded-2xl text-center ${h1Count === 1 ? 'border-emerald-100 bg-emerald-50/70 text-emerald-700' : 'border-red-100 bg-red-50/70 text-red-600'}`}>
            <div className="text-[10px] font-medium uppercase tracking-wider opacity-75">H1</div>
            <div className="text-base font-semibold tabular-nums">{h1Count}</div>
          </div>
          <div className="p-3 border border-zinc-100 rounded-2xl text-center bg-white">
            <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">H2</div>
            <div className="text-base font-semibold tabular-nums text-zinc-800">{h2Count}</div>
          </div>
          <div className="p-3 border border-zinc-100 rounded-2xl text-center bg-white">
            <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">H3</div>
            <div className="text-base font-semibold tabular-nums text-zinc-800">{h3Count}</div>
          </div>
          <div className="p-3 border border-zinc-100 rounded-2xl text-center bg-white">
            <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">H4</div>
            <div className="text-base font-semibold tabular-nums text-zinc-800">{h4Count}</div>
          </div>
        </div>

        <div className="bg-zinc-50/80 p-4 rounded-2xl border border-zinc-100">
          <div className="space-y-2.5">
            {stats.headingTree.length > 0 ? stats.headingTree.map((h, i) => (
              <button key={i} onClick={() => onNavigateOutline?.(h.text)} className="w-full text-left flex gap-2.5 items-center group" style={{ paddingLeft: `${(h.level - 1) * 14}px` }}>
                <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase shrink-0">{h.tag}</span>
                <span className="text-xs font-normal text-zinc-600 line-clamp-1 group-hover:text-blue-600 transition-colors">{h.text}</span>
              </button>
            )) : <div className="text-xs text-zinc-400 italic text-center">No structure yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
