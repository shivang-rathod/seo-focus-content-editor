
import React, { useState, useEffect } from 'react';
import { X, Goal as GoalIcon, Save } from 'lucide-react';
import { LocalDocument, DocumentGoal } from '../../types/document.types';

interface GoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    document: LocalDocument;
    onSave: (newGoal: DocumentGoal) => void;
}

// FIX: Made children optional to fix TS error.
const Label = ({ children }: { children?: React.ReactNode }) => (
    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">{children}</label>
);

// FIX: Made children optional to fix TS error.
const Select = ({ value, onChange, children }: { value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, children?: React.ReactNode }) => (
    <select 
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-800 outline-none focus:border-blue-500 transition-colors"
    >
        {children}
    </select>
);

const Input = ({ value, onChange }: { value: number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
     <input 
        type="number"
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-800 outline-none focus:border-blue-500 transition-colors"
    />
);


export const GoalModal = ({ isOpen, onClose, document, onSave }: GoalModalProps) => {
    const [goals, setGoals] = useState<DocumentGoal>(document.goal);
    
    useEffect(() => {
        setGoals(document.goal);
    }, [document.goal, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(goals);
        onClose();
    };

    const handleGoalChange = (field: keyof DocumentGoal, value: any) => {
        setGoals(prev => ({...prev, [field]: value}));
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white border border-zinc-200 rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="font-black text-xl uppercase tracking-tighter text-zinc-900 flex items-center gap-3">
                <GoalIcon size={20} className="text-blue-500"/>
                Set Content Goals
              </h3>
              <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 transition-colors">
                <X size={24}/>
              </button>
            </div>
            <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label>Word Count</Label>
                        <Input 
                            value={goals.wordCount}
                            onChange={(e) => handleGoalChange('wordCount', parseInt(e.target.value) || 0)}
                        />
                    </div>
                     <div>
                        <Label>Primary Intent</Label>
                        <Select 
                            value={goals.intent}
                            onChange={(e) => handleGoalChange('intent', e.target.value)}
                        >
                            <option>General</option>
                            <option>Informational</option>
                            <option>Commercial</option>
                            <option>Transactional</option>
                            <option>Navigational</option>
                        </Select>
                    </div>
                     <div>
                        <Label>Target Audience</Label>
                         <Select 
                            value={goals.audience}
                            onChange={(e) => handleGoalChange('audience', e.target.value)}
                        >
                            <option>General</option>
                            <option>Beginner</option>
                            <option>Intermediate</option>
                            <option>Expert</option>
                        </Select>
                    </div>
                    <div>
                        <Label>Desired Tone</Label>
                         <Select 
                            value={goals.tone}
                            onChange={(e) => handleGoalChange('tone', e.target.value)}
                        >
                            <option>Professional</option>
                            <option>Casual</option>
                            <option>Formal</option>
                            <option>Humorous</option>
                            <option>Empathetic</option>
                        </Select>
                    </div>
                </div>
                <div className="mt-8">
                    <button 
                        onClick={handleSave}
                        className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl hover:bg-black transition-all active:scale-95"
                    >
                        <Save size={16} /> Save Goals
                    </button>
                </div>
            </div>
          </div>
        </div>
    );
};
