'use client';

import { useState } from 'react';
import { Settings, Sparkles, LayoutPanelLeft, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useOpenAIConfig } from '@/hooks/use-openai-config';
import { ConfigModal } from '@/components/ConfigModal';
import { AudioUploader } from '@/components/AudioUploader';
import { AnalysisTable } from '@/components/AnalysisTable';
import { analyzeAudio, FullAnalysis } from '@/lib/openai-actions';

export default function Home() {
  const { config, updateConfig, isLoaded } = useOpenAIConfig();
  const [showConfig, setShowConfig] = useState(false);
  const [analysis, setAnalysis] = useState<FullAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (base64Audio: string, transcript: string) => {
    console.log('handleAnalyze started', { hasAudio: !!base64Audio, hasTranscript: !!transcript });
    if (!config.apiKey) {
      console.log('No API key found in config');
      setShowConfig(true);
      toast.error('OpenAI API Key is required. Please add it in settings.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      console.log('Calling analyzeAudio server action with FormData...');
      const formData = new FormData();
      formData.append('audio', base64Audio);
      formData.append('transcript', transcript);
      formData.append('config', JSON.stringify(config));

      const result = await analyzeAudio(formData);
      console.log('Analysis result received:', result);
      setAnalysis(result);
      toast.success('Analysis completed successfully!');
    } catch (err: any) {
      console.error('Error in handleAnalyze:', err);
      const errMsg = err.message || 'Something went wrong during analysis.';
      setError(errMsg);
      toast.error(errMsg, {
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setAnalysis(null);
    setError(null);
  };

  if (!isLoaded) return null;

  return (
    <main className="min-h-screen gradient-bg flex flex-col items-center">
      {/* Navbar */}
      <nav className="w-full max-w-6xl mx-auto p-8 flex items-center justify-between animate-in slide-in-from-top-4 duration-500">
        <div className="flex items-center space-x-3 group">
          <div className="p-3 bg-white/5 shadow-2xl rounded-2xl border border-white/10 group-hover:scale-110 group-hover:rotate-12 transition-all">
            <Sparkles className="w-8 h-8 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-black gradient-text tracking-tighter uppercase italic">VocalAI</h1>
            <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase -mt-1 opacity-50">Precision Speech Analysis</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowConfig(true)}
            className="flex items-center space-x-2 px-4 py-2 hover:bg-white/5 rounded-2xl border border-white/5 text-sm font-semibold text-gray-400 hover:text-white transition-all duration-300 backdrop-blur-md"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <section className="w-full max-w-4xl px-8 py-12 flex flex-col items-center flex-grow">
        {!analysis ? (
          <div className="w-full space-y-12 animate-in fade-in zoom-in-95 duration-700">
            <div className="text-center space-y-4">
              <h2 className="text-6xl md:text-7xl font-black text-gray-100 italic tracking-tighter">
                Perfect Your <br />
                <span className="gradient-text italic">Performance.</span>
              </h2>
              <p className="text-lg text-gray-400 max-w-xl mx-auto leading-relaxed px-4 opacity-70">
                Unlock expert-level feedback on grammar, fluency, and tone in seconds.
                Upload audio or start recording to begin.
              </p>
            </div>

            {error && (
              <div className="w-full p-4 bg-red-500/10 border border-red-500/20 text-red-500 font-medium text-sm text-center rounded-2xl animate-shake">
                {error}
              </div>
            )}

            <AudioUploader onAnalyze={handleAnalyze} isLoading={isLoading} />
          </div>
        ) : (
          <div className="w-full space-y-8">
            <div className="flex items-center justify-between text-gray-100">
              <h2 className="text-3xl font-black italic tracking-tighter">Analysis Results</h2>
              <button
                onClick={reset}
                className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors flex items-center space-x-2"
              >
                <RefreshCcw className="w-5 h-5" />
                <span className="text-sm font-semibold">Start New</span>
              </button>
            </div>
            <AnalysisTable analysis={analysis} />
          </div>
        )}
      </section>

      {/* Footer Decoration */}
      <footer className="w-full py-12 opacity-10">
        <div className="max-w-6xl mx-auto flex items-center justify-center space-x-2 text-sm uppercase tracking-[0.3em] font-black text-white italic">
          <LayoutPanelLeft className="w-4 h-4" />
          <span>Professional AI Analytics Suite</span>
        </div>
      </footer>

      {showConfig && (
        <ConfigModal
          config={config}
          onSave={updateConfig}
          onClose={() => setShowConfig(false)}
        />
      )}
    </main>
  );
}
