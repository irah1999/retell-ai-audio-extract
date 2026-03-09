'use client';

import { Settings, X, Key, Cpu, Thermometer } from 'lucide-react';
import { OpenAIConfig } from '@/hooks/use-openai-config';
import { useState } from 'react';

interface ConfigModalProps {
    config: OpenAIConfig;
    onSave: (config: OpenAIConfig) => void;
    onClose: () => void;
}

export function ConfigModal({ config, onSave, onClose }: ConfigModalProps) {
    const [localConfig, setLocalConfig] = useState<OpenAIConfig>(config);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-md glass border border-white/10 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-accent/10 rounded-xl text-accent">
                            <Settings className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-100">AI Configuration</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                        <X className="w-6 h-6 text-gray-500 hover:text-white" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm font-medium text-gray-400 px-1">
                            <Key className="w-4 h-4" />
                            <span>OpenAI API Key</span>
                        </div>
                        <input
                            type="password"
                            placeholder="sk-..."
                            value={localConfig.apiKey}
                            onChange={(e) => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
                            className="w-full glass p-4 rounded-2xl focus:ring-2 focus:ring-accent/50 border-white/10 focus:border-accent outline-none text-gray-200 placeholder-gray-600"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm font-medium text-gray-400 px-1">
                            <Cpu className="w-4 h-4" />
                            <span>Model Selection</span>
                        </div>
                        <select
                            value={localConfig.model.startsWith('custom:') ? 'custom' : localConfig.model}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'custom') {
                                    setLocalConfig({ ...localConfig, model: 'custom:' });
                                } else {
                                    setLocalConfig({ ...localConfig, model: val });
                                }
                            }}
                            className="w-full glass p-4 rounded-2xl focus:ring-2 focus:ring-accent/50 border-white/10 focus:border-accent outline-none text-gray-200"
                        >
                            <option value="gpt-4o" className="bg-gray-900">GPT-4o (Omni - Recommended)</option>
                            <option value="gpt-4o-mini" className="bg-gray-900">GPT-4o-Mini (Fast & Cheap)</option>
                            <option value="o1-preview" className="bg-gray-900">o1-Preview (Advanced Reasoning)</option>
                            <option value="o1-mini" className="bg-gray-900">o1-Mini (Fast Reasoning)</option>
                            <option value="gpt-4-turbo" className="bg-gray-900">GPT-4 Turbo</option>
                            <option value="gpt-4" className="bg-gray-900">GPT-4 (Classic)</option>
                            <option value="gpt-3.5-turbo" className="bg-gray-900">GPT-3.5 Turbo (Legacy)</option>
                            <option value="custom" className="bg-gray-900">Custom Model Name...</option>
                        </select>
                    </div>

                    {localConfig.model.startsWith('custom:') && (
                        <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center space-x-2 text-sm font-medium text-purple-400 px-1">
                                <Cpu className="w-4 h-4" />
                                <span>Enter Custom Model ID</span>
                            </div>
                            <input
                                type="text"
                                placeholder="e.g. ft:gpt-3.5-turbo:..."
                                value={localConfig.model.replace('custom:', '')}
                                onChange={(e) => setLocalConfig({ ...localConfig, model: 'custom:' + e.target.value })}
                                className="w-full glass p-4 rounded-2xl focus:ring-2 focus:ring-purple-500/50 border-white/10 focus:border-purple-400 outline-none text-gray-200 placeholder-gray-600"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <div className="flex items-center space-x-2 text-sm font-medium text-gray-400">
                                <Thermometer className="w-4 h-4" />
                                <span>Temperature</span>
                            </div>
                            <span className="text-sm font-bold text-accent">{localConfig.temperature}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={localConfig.temperature}
                            onChange={(e) => setLocalConfig({ ...localConfig, temperature: parseFloat(e.target.value) })}
                            className="w-full accent-accent bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <button
                        onClick={() => {
                            onSave(localConfig);
                            onClose();
                        }}
                        className="w-full py-4 bg-accent hover:bg-accent/90 text-white font-bold rounded-2xl shadow-lg shadow-accent/20 transition-all duration-200 active:scale-95"
                    >
                        Save Configuration
                    </button>
                </div>
            </div>
        </div>
    );
}
