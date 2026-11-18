import React from 'react';
import { BarChart3, Target, Activity, Sparkles, Rocket } from 'lucide-react';
import { Tab, SEOPhraseTab, TextStats, ReadabilityInsights, KeywordDensity, SEOHealth, IntentResult, KeywordTarget, FAQ, SentenceWarnings, OptimizationReport, EEATScore } from '../../types/editor.types.ts';

import { InsightsTab } from './sidebar/InsightsTab.tsx';
import { KeywordsTab } from './sidebar/KeywordsTab.tsx';
import { SEOTab } from './sidebar/SEOTab.tsx';
import { AITab } from './sidebar/AITab.tsx';
import { OptimizeTab } from './sidebar/OptimizeTab.tsx';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  stats: TextStats;
  readability: ReadabilityInsights | null;
  health: SEOHealth;
  intent: IntentResult;
  keywords: KeywordDensity[];
  seoTab: SEOPhraseTab;
  setSeoTab: (num: SEOPhraseTab) => void;
  isExpanded: boolean;
  setIsExpanded: (val: boolean) => void;
  onRewrite: (mode: any) => void;
  isAIProcessing?: boolean;
  targets: KeywordTarget;
  setTargets: (t: KeywordTarget) => void;
  metaTitle: string;
  setMetaTitle: (s: string) => void;
  metaDescription: string;
  setMetaDescription: (s: string) => void;
  faqs: FAQ[];
  setFaqs: (f: FAQ[]) => void;
  onGenerateMetadata: (type: 'title' | 'description') => Promise<void>;
  onDetectAI: () => void;
  onGenerateFAQs: () => void;
  onExportSchema: () => void;
  onNavigateOutline?: (text: string) => void;
  sentenceWarnings?: SentenceWarnings;
  optimizationReport: OptimizationReport;
  onHighlight: (enabled: boolean) => void;
  setBrokenLinks?: (links: string[]) => void;
  content: string;
  targetDomain: string;
  setTargetDomain: (s: string) => void;
  eeatScore: EEATScore | null;
  aiDetectionResult?: { score: number; analysis: string } | null;
  aiError?: string | null;
  onNotify?: (msg: string) => void;
}

const TabButton = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-black uppercase tracking-tighter relative py-5 transition-all ${active ? 'text-blue-600' : 'text-zinc-400 hover:text-zinc-600'}`}>
    {icon}
    <span className="hidden lg:inline">{label}</span>
    {active && <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-600 rounded-t-full" />}
  </button>
);

export const Sidebar = (props: SidebarProps) => {
  const { activeTab, setActiveTab } = props;

  return (
    <aside className="w-full md:w-80 lg:w-[400px] border-l border-zinc-100 flex flex-col bg-white shrink-0 h-full overflow-hidden">
      <div className="flex border-b border-zinc-100 shrink-0 bg-white">
        <TabButton active={activeTab === 'insights'} onClick={() => setActiveTab('insights')} label="Insights" icon={<BarChart3 size={18} />} />
        <TabButton active={activeTab === 'keywords'} onClick={() => setActiveTab('keywords')} label="Keywords" icon={<Target size={18} />} />
        <TabButton active={activeTab === 'seo'} onClick={() => setActiveTab('seo')} label="SEO" icon={<Activity size={18} />} />
        <TabButton active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} label="AI" icon={<Sparkles size={18} />} />
        <TabButton active={activeTab === 'optimize'} onClick={() => setActiveTab('optimize')} label="Optimize" icon={<Rocket size={18} />} />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10 pb-32">
        {activeTab === 'insights' && <InsightsTab stats={props.stats} readability={props.readability} health={props.health} onNavigateOutline={props.onNavigateOutline} eeatScore={props.eeatScore} />}
        {activeTab === 'keywords' && <KeywordsTab {...props} onHighlight={props.onHighlight} />}
        {activeTab === 'seo' && <SEOTab {...props} setBrokenLinks={props.setBrokenLinks} content={props.content} targetDomain={props.targetDomain} setTargetDomain={props.setTargetDomain} />}
        {activeTab === 'ai' && <AITab onRewrite={props.onRewrite} onDetectAI={props.onDetectAI} isAIProcessing={props.isAIProcessing} aiDetectionResult={props.aiDetectionResult} aiError={props.aiError} onNotify={props.onNotify} />}
        {activeTab === 'optimize' && <OptimizeTab report={props.optimizationReport} sentenceWarnings={props.sentenceWarnings} onNavigateOutline={props.onNavigateOutline} />}
      </div>
    </aside>
  );
};
