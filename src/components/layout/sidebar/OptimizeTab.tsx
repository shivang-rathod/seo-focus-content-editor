import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, ChevronDown, ChevronRight, Zap, Flag, Award } from 'lucide-react';
import { OptimizationReport, OptimizationItem, SentenceWarnings, SentenceIssue } from '../../../types/editor.types';

interface OptimizeTabProps {
  report: OptimizationReport;
  sentenceWarnings?: SentenceWarnings;
  onNavigateOutline?: (text: string) => void;
}

const WarningGroup = ({ title, items, colorClass, onNavigate }: { title: string; items: SentenceIssue[]; colorClass: string; onNavigate?: (t: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  if (items.length === 0) return null;

  return (
    <div className={`border rounded-2xl overflow-hidden bg-white mb-2.5 ${colorClass}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3.5 hover:bg-opacity-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-full bg-current/10 flex items-center justify-center">
            <span className="text-[11px] font-semibold tabular-nums">{items.length}</span>
          </div>
          <span className="text-xs font-medium">{title}</span>
        </div>
        <ChevronDown size={14} className={`opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="border-t border-current/10">
          {items.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate?.(item.text)}
              className="w-full text-left p-3 text-xs hover:bg-black/5 transition-colors border-b last:border-0 border-current/5"
            >
              <div className="font-normal opacity-90 line-clamp-2">&ldquo;...{item.preview}&rdquo;</div>
              <div className="mt-1 opacity-55 text-[10px] font-medium uppercase tracking-wider">
                {item.count ? `${item.count} items` : `Sentence #${item.index + 1}`}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const OptimizationGroup = ({
  title,
  items,
  variant,
  defaultOpen = false
}: {
  title: string;
  items: OptimizationItem[];
  variant: 'critical' | 'improvement' | 'enhancement';
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (items.length === 0) return null;

  const styles = {
    critical: {
      bg: 'bg-red-50/70',
      border: 'border-red-100',
      text: 'text-red-700',
      badge: 'bg-red-100 text-red-700',
      icon: <AlertCircle size={15} className="text-red-500" />
    },
    improvement: {
      bg: 'bg-amber-50/70',
      border: 'border-amber-100',
      text: 'text-amber-700',
      badge: 'bg-amber-100 text-amber-800',
      icon: <AlertTriangle size={15} className="text-amber-500" />
    },
    enhancement: {
      bg: 'bg-blue-50/70',
      border: 'border-blue-100',
      text: 'text-blue-700',
      badge: 'bg-blue-100 text-blue-700',
      icon: <CheckCircle2 size={15} className="text-blue-500" />
    }
  };

  const style = styles[variant];

  return (
    <div className={`rounded-2xl border ${style.border} overflow-hidden transition-all duration-300`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-3.5 ${style.bg} hover:brightness-98 transition-all`}
      >
        <div className="flex items-center gap-2.5">
          {style.icon}
          <span className={`text-xs font-medium ${style.text}`}>{title}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium tabular-nums ${style.badge}`}>{items.length}</span>
        </div>
        {isOpen ? <ChevronDown size={14} className={style.text} opacity={0.6} /> : <ChevronRight size={14} className={style.text} opacity={0.6} />}
      </button>

      {isOpen && (
        <div className="bg-white divide-y divide-zinc-100">
          {items.map(item => (
            <div key={item.id} className="p-3.5 hover:bg-zinc-50/60 transition-colors group">
              <h4 className="text-xs font-medium text-zinc-800 mb-0.5">{item.title}</h4>
              <p className="text-[11px] text-zinc-500 leading-relaxed">{item.description}</p>
              <div className="mt-2">
                <span className="text-[10px] font-medium uppercase text-zinc-400 tracking-wider bg-zinc-50 px-1.5 py-0.5 rounded">{item.source}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const OptimizeTab = ({ report, sentenceWarnings, onNavigateOutline }: OptimizeTabProps) => {
  const eeatImprovements = report.improvements.filter(item => item.source === 'eeat');
  const eeatEnhancements = report.enhancements.filter(item => item.source === 'eeat');
  const hasEeatSuggestions = eeatImprovements.length > 0 || eeatEnhancements.length > 0;

  const seoCritical = report.critical.filter(item => item.source !== 'eeat');
  const seoImprovements = report.improvements.filter(item => item.source !== 'eeat');
  const seoEnhancements = report.enhancements.filter(item => item.source !== 'eeat');
  const hasSeoSuggestions = seoCritical.length > 0 || seoImprovements.length > 0 || seoEnhancements.length > 0;

  const hasWarnings = sentenceWarnings && !Object.values(sentenceWarnings).every(arr => arr.length === 0);
  const allClear = !hasWarnings && !hasEeatSuggestions && !hasSeoSuggestions;

  return (
    <div className="space-y-7 animate-in fade-in slide-in-from-right-4 duration-500">
      {hasEeatSuggestions && (
        <div className="space-y-3">
          <h3 className="text-[11px] font-medium text-zinc-400 uppercase tracking-[0.12em] flex items-center gap-2">
            E-E-A-T Suggestions
            <Award size={12} className="text-zinc-400" />
          </h3>
          <div className="space-y-2.5">
            <OptimizationGroup
              title="EEAT Improvements"
              items={eeatImprovements}
              variant="improvement"
              defaultOpen={true}
            />
            <OptimizationGroup
              title="EEAT Enhancements"
              items={eeatEnhancements}
              variant="enhancement"
              defaultOpen={false}
            />
          </div>
        </div>
      )}

      {hasWarnings && (
        <div className="space-y-3">
          <h3 className="text-[11px] font-medium text-zinc-400 uppercase tracking-[0.12em] flex items-center gap-2">
            Content Suggestions
            <Flag size={12} className="text-zinc-400" />
          </h3>
          <div className="space-y-1">
            <WarningGroup title="Very Long (>35w)" items={sentenceWarnings!.veryLongSentences} colorClass="border-red-100 text-red-600" onNavigate={onNavigateOutline} />
            <WarningGroup title="Long (>25w)" items={sentenceWarnings!.longSentences} colorClass="border-amber-100 text-amber-600" onNavigate={onNavigateOutline} />
            <WarningGroup title="Consecutive Long" items={sentenceWarnings!.consecutiveLong} colorClass="border-orange-100 text-orange-600" onNavigate={onNavigateOutline} />
            <WarningGroup title="Passive Voice" items={sentenceWarnings!.passiveVoice} colorClass="border-blue-100 text-blue-600" onNavigate={onNavigateOutline} />
            <WarningGroup title="Comma Overload" items={sentenceWarnings!.commaOverload} colorClass="border-purple-100 text-purple-600" onNavigate={onNavigateOutline} />
            <WarningGroup title="Repetitive Openings" items={sentenceWarnings!.repetitiveOpenings} colorClass="border-pink-100 text-pink-600" onNavigate={onNavigateOutline} />
          </div>
        </div>
      )}

      {(hasSeoSuggestions || allClear) && (
        <div className="space-y-3">
          <h3 className="text-[11px] font-medium text-zinc-400 uppercase tracking-[0.12em]">SEO Suggestions</h3>
          {allClear ? (
            <div className="p-6 border border-emerald-100 bg-emerald-50/70 rounded-3xl text-center space-y-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-xs text-emerald-500">
                <Zap size={24} fill="currentColor" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-emerald-800 mb-1">All Systems Go</h3>
                <p className="text-xs text-emerald-700/80">Your content is well optimized for your current targets.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <OptimizationGroup title="Critical Issues" items={seoCritical} variant="critical" defaultOpen={true} />
              <OptimizationGroup title="SEO Improvements" items={seoImprovements} variant="improvement" defaultOpen={true} />
              <OptimizationGroup title="SEO Enhancements" items={seoEnhancements} variant="enhancement" defaultOpen={false} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
