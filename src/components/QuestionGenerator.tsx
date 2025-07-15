import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

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
        px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105
        ${disabled || isGenerating
          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg'
        }
      `}
    >
      <div className="flex items-center gap-3">
        {isGenerating ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <Sparkles className="w-6 h-6" />
        )}
        <span className="text-lg">
          {isGenerating ? 'Membuat Soal...' : 'Generate Soal'}
        </span>
      </div>
    </button>
  );
};

export default QuestionGenerator;