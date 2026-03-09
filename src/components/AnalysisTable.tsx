'use client';

import { FullAnalysis } from '@/lib/openai-actions';
import { CheckCircle2, TrendingUp, Mic, Heart, ShieldAlert } from 'lucide-react';

interface AnalysisTableProps {
    analysis: FullAnalysis;
}

export function AnalysisTable({ analysis }: AnalysisTableProps) {
    const items = [
        { ...analysis.grammar, icon: CheckCircle2, color: 'text-blue-400' },
        { ...analysis.fluency, icon: TrendingUp, color: 'text-purple-400' },
        { ...analysis.pronunciation, icon: Mic, color: 'text-emerald-400' },
    ];

    return (
        <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass p-6 rounded-2xl flex items-center space-x-4">
                    <div className="p-3 bg-purple-500/10 rounded-xl">
                        <Heart className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Tone & Emotion</p>
                        <p className="text-2xl font-bold gradient-text">{analysis.emotion.state}</p>
                        <p className="text-sm text-gray-300 mt-1">{analysis.emotion.description}</p>
                    </div>
                </div>

                <div className="glass p-6 rounded-2xl flex items-center space-x-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                        <ShieldAlert className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Summary</p>
                        <p className="text-lg font-medium text-gray-200 line-clamp-2">{analysis.overall}</p>
                    </div>
                </div>
            </div>

            <div className="glass rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-400">Category</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-400">Score</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-400">Detailed Feedback</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-white/5 transition-colors duration-200">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center space-x-3">
                                        <item.icon className={`w-5 h-5 ${item.color}`} />
                                        <span className="font-medium">{item.category}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.color} bg-current/10`}>
                                        {item.score}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-300 leading-relaxed">
                                    {item.feedback}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
