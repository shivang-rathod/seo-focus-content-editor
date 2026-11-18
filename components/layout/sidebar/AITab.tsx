import React, { useState, useEffect } from 'react';
import { Sparkles, BookOpen, PlusCircle, ScanEye, CheckCircle2, KeyRound, Eye, EyeOff, Trash2, Check, AlertCircle, Settings2 } from 'lucide-react';
import { AIProviderType, LocalAIConfig } from '../../../types/ai.types';
import {
  getAIConfig,
  saveAIConfig,
  clearAIConfig,
  DEFAULT_MODELS,
  GEMINI_MODEL_OPTIONS,
  OPENAI_MODEL_OPTIONS,
} from '../../../services/aiConfig';

interface AITabProps {
  onRewrite: (mode: any) => void;
  onDetectAI: () => void;
  isAIProcessing?: boolean;
  aiDetectionResult?: { score: number; analysis: string } | null;
  aiError?: string | null;
  onConfigChange?: (hasKey: boolean) => void;
  onNotify?: (msg: string) => void;
}

const ActionButton = ({ onClick, label, variant = 'primary', icon, className, disabled }: any) => {
  const styles: any = {
    primary: 'bg-white text-zinc-800 border-zinc-200 hover:border-blue-500',
    secondary: 'bg-zinc-50 text-zinc-500 border-zinc-100 hover:border-zinc-300 hover:text-zinc-800',
    ai: 'bg-blue-600 text-white border-transparent hover:bg-blue-700 shadow-lg'
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`w-full py-3.5 px-4 rounded-xl text-[11px] font-black border transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50 ${styles[variant]} ${className || ''}`}>
      {icon}{label}
    </button>
  );
};

export const AITab = ({
  onRewrite,
  onDetectAI,
  isAIProcessing,
  aiDetectionResult,
  aiError,
  onConfigChange,
  onNotify
}: AITabProps) => {
  const [config, setConfig] = useState<LocalAIConfig>(() => getAIConfig());
  const [showKey, setShowKey] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(() => !getAIConfig().apiKey);

  const hasSavedKey = Boolean(getAIConfig().apiKey);

  useEffect(() => {
    onConfigChange?.(hasSavedKey);
  }, [hasSavedKey, onConfigChange]);

  const handleProviderChange = (provider: AIProviderType) => {
    setConfig((prev) => ({
      ...prev,
      provider,
      model: DEFAULT_MODELS[provider],
    }));
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.apiKey.trim()) {
      onNotify?.('Please enter an API key first.');
      return;
    }
    if (config.provider === 'custom' && !config.invokeUrl?.trim()) {
      onNotify?.('Please enter your custom endpoint URL.');
      return;
    }
    const saved = saveAIConfig(config);
    setConfig(saved);
    setIsConfigOpen(false);
    onConfigChange?.(true);
    onNotify?.('API key saved locally in browser');
  };

  const handleClearConfig = () => {
    const cleared = clearAIConfig();
    setConfig(cleared);
    setIsConfigOpen(true);
    onConfigChange?.(false);
    onNotify?.('API key removed');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Bring Your Own Key (BYOK) Section */}
      <div className="p-5 bg-white border border-zinc-100 rounded-[24px] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound size={14} className={hasSavedKey ? 'text-emerald-500' : 'text-blue-500'} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-700">
              {hasSavedKey ? `${config.provider} Key Ready` : 'Bring Your Own Key'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsConfigOpen((prev) => !prev)}
            className="text-[10px] font-black uppercase tracking-wider text-blue-600 hover:underline flex items-center gap-1"
          >
            <Settings2 size={12} />
            {isConfigOpen ? 'Hide' : 'Configure'}
          </button>
        </div>

        {!isConfigOpen && hasSavedKey && (
          <div className="flex items-center justify-between bg-emerald-50/70 border border-emerald-100 rounded-xl px-3.5 py-2.5 text-[11px] font-bold text-emerald-700">
            <span className="truncate">Model: {config.model}</span>
            <Check size={14} className="shrink-0" />
          </div>
        )}

        {isConfigOpen && (
          <form onSubmit={handleSaveConfig} className="space-y-3 pt-1">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">Provider</label>
              <div className="grid grid-cols-3 gap-1.5 bg-zinc-100 p-1 rounded-xl">
                {(['gemini', 'openai', 'custom'] as AIProviderType[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleProviderChange(p)}
                    className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                      config.provider === p ? 'bg-white text-blue-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {config.provider === 'custom' && (
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">Endpoint URL</label>
                <input
                  type="url"
                  value={config.invokeUrl || ''}
                  onChange={(e) => setConfig({ ...config, invokeUrl: e.target.value })}
                  placeholder="https://your-endpoint.example/generate"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs font-semibold outline-none focus:border-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">Model</label>
              {config.provider === 'gemini' ? (
                <select
                  value={GEMINI_MODEL_OPTIONS.some((m) => m.id === config.model) ? config.model : 'custom'}
                  onChange={(e) => {
                    if (e.target.value !== 'custom') setConfig({ ...config, model: e.target.value });
                  }}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs font-semibold outline-none focus:border-blue-500 mb-2"
                >
                  {GEMINI_MODEL_OPTIONS.map((m) => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                  <option value="custom">Custom Model ID</option>
                </select>
              ) : config.provider === 'openai' ? (
                <select
                  value={OPENAI_MODEL_OPTIONS.some((m) => m.id === config.model) ? config.model : 'custom'}
                  onChange={(e) => {
                    if (e.target.value !== 'custom') setConfig({ ...config, model: e.target.value });
                  }}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs font-semibold outline-none focus:border-blue-500 mb-2"
                >
                  {OPENAI_MODEL_OPTIONS.map((m) => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                  <option value="custom">Custom Model ID</option>
                </select>
              ) : null}
              <input
                type="text"
                value={config.model}
                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                placeholder="Model name"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">API Key</label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder={`Paste your ${config.provider} API key...`}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-3 pr-10 py-2.5 text-xs font-mono outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                  title={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <p className="text-[10px] text-zinc-400 leading-relaxed">
              Stored locally in your browser&apos;s <span className="font-mono">localStorage</span> and sent directly to your chosen provider. Never uploaded to any backend.
            </p>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-zinc-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors"
              >
                Save Key
              </button>
              {hasSavedKey && (
                <button
                  type="button"
                  onClick={handleClearConfig}
                  className="px-3 py-2.5 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-colors flex items-center gap-1"
                  title="Remove stored API key"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {aiError && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-700 flex items-start gap-2.5">
          <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
          <span className="font-medium leading-relaxed">{aiError}</span>
        </div>
      )}

      <div>
        <h3 className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.25em] mb-4">AI Rewrite Selection</h3>
        <div className="grid grid-cols-1 gap-3">
          <ActionButton onClick={() => onRewrite('clarity')} label="Clarity" icon={<Sparkles size={16} />} disabled={isAIProcessing} variant="ai" />
          <ActionButton onClick={() => onRewrite('concise')} label="Make Precise" icon={<BookOpen size={16} />} disabled={isAIProcessing} variant="secondary" />
          <ActionButton onClick={() => onRewrite('expand_examples')} label="Expand Examples" icon={<PlusCircle size={16} />} disabled={isAIProcessing} variant="secondary" />
          <ActionButton onClick={() => onRewrite('authoritative')} label="Tone Expert" icon={<CheckCircle2 size={16} />} disabled={isAIProcessing} variant="secondary" />
        </div>
      </div>

      <div className="pt-8 border-t border-zinc-50 space-y-4">
        <h3 className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.25em]">Quality Scan</h3>
        <ActionButton onClick={onDetectAI} label={isAIProcessing ? 'Analyzing...' : 'Scan for AI Content'} icon={<ScanEye size={16} />} disabled={isAIProcessing} variant="primary" />
        {aiDetectionResult && (
          <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">AI Pattern Score</span>
              <span className={`text-sm font-black ${aiDetectionResult.score > 60 ? 'text-red-500' : aiDetectionResult.score > 30 ? 'text-yellow-600' : 'text-emerald-600'}`}>
                {aiDetectionResult.score}%
              </span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">{aiDetectionResult.analysis}</p>
          </div>
        )}
      </div>
    </div>
  );
};