import React from 'react';
import { X, Sparkles, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // Assuming basic markdown rendering or plain text

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  content: string;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, isLoading, content }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <Bot className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">AI Incident Analysis</h3>
              <p className="text-xs text-slate-400">Powered by Gemini 2.5 Flash</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 border-t-4 border-purple-500 rounded-full animate-spin"></div>
              </div>
              <p className="text-slate-400 animate-pulse">Analyzing logs and context...</p>
            </div>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none">
              <div className="whitespace-pre-wrap font-sans text-slate-300 leading-relaxed">
                {content}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
};
