import React from 'react';
import { Download, RefreshCw, CheckCircle, XCircle, FileText } from 'lucide-react';
import { Question } from '../types/Question';

interface QuestionDisplayProps {
  questions: Question[];
  isGenerating: boolean;
  onRegenerateQuestions: (prompt: string) => void;
  prompt: string;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ 
  questions, 
  isGenerating, 
  onRegenerateQuestions, 
  prompt 
}) => {
  const exportQuestions = () => {
    const content = questions.map((q, index) => {
      return `${index + 1}. ${q.question}\n${q.options.map((option, i) => `   ${String.fromCharCode(65 + i)}. ${option}`).join('\n')}\n   Jawaban: ${String.fromCharCode(65 + q.correctAnswer)}\n\n`;
    }).join('');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soal-${questions[0]?.subject}-${questions[0]?.grade}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-400/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'Hard': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  if (isGenerating) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Membuat Soal...</h2>
          <p className="text-gray-300">AI sedang menghasilkan soal-soal berkualitas untuk Anda</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Soal yang Dihasilkan</h2>
          <p className="text-gray-300">{questions.length} soal berhasil dibuat</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onRegenerateQuestions(prompt)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Regenerate
          </button>
          <button
            onClick={exportQuestions}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((question, index) => (
          <div key={question.id} className="bg-gray-700/50 rounded-xl p-6 border border-gray-600">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(question.difficulty)}`}>
                  {question.difficulty}
                </span>
              </div>
              <FileText className="w-5 h-5 text-gray-400" />
            </div>

            <h3 className="text-lg font-semibold text-white mb-4">{question.question}</h3>

            <div className="space-y-3">
              {question.options.map((option, optionIndex) => (
                <div
                  key={optionIndex}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border transition-colors
                    ${optionIndex === question.correctAnswer
                      ? 'bg-green-600/20 border-green-600/50 text-green-300'
                      : 'bg-gray-600/30 border-gray-600/50 text-gray-300'
                    }
                  `}
                >
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold
                    ${optionIndex === question.correctAnswer ? 'bg-green-600' : 'bg-gray-600'}
                  `}>
                    {String.fromCharCode(65 + optionIndex)}
                  </div>
                  <span>{option}</span>
                  {optionIndex === question.correctAnswer && (
                    <CheckCircle className="w-5 h-5 text-green-400 ml-auto" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionDisplay;