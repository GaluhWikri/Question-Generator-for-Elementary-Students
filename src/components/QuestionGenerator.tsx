import React from 'react';
import { Sparkles, Loader2, Wand2 } from 'lucide-react';

interface QuestionGeneratorProps {
  onGenerateQuestions: (prompt: string) => void;
  isGenerating: boolean;
  disabled: boolean;
  prompt: string;
}

const QuestionGenerator: React.FC<QuestionGeneratorProps> = ({
  onGenerateQuestions,
  isGenerating,
  disabled,
  prompt
}) => {
  return (
    <button
      onClick={() => onGenerateQuestions(prompt)}
      disabled={disabled || isGenerating}
      className={`
        group relative w-full px-8 py-4 rounded-xl font-bold transition-all duration-300 overflow-hidden
        ${disabled || isGenerating
          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          : 'text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02]'
        }
      `}
    >
      {/* Gradient Background */}
      {!disabled && !isGenerating && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-violet-600 to-cyan-500 transition-opacity" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-violet-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Animated Shine Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
        </>
      )}

      <div className="relative z-10 flex items-center justify-center gap-3">
        {isGenerating ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <Wand2 className="w-6 h-6 transition-transform group-hover:rotate-12" />
        )}
        <span className="text-lg">
          {isGenerating ? 'Membuat Soal...' : 'Generate Soal'}
        </span>
        {!disabled && !isGenerating && (
          <Sparkles className="w-4 h-4 animate-pulse" />
        )}
      </div>
    </button>
  );
};

export default QuestionGenerator;