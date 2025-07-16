// src/components/QuestionDisplay.tsx

import React from 'react';
import { Download, RefreshCw, CheckCircle, FileText, Type } from 'lucide-react';
import { Question } from '../types/Question';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Impor autoTable secara langsung

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

  const renderContent = (content: any): string => {
    if (typeof content === 'string') return content;
    if (typeof content === 'object' && content !== null && content.hasOwnProperty('text')) return String(content.text);
    if (typeof content === 'object') return JSON.stringify(content);
    return 'Konten tidak valid';
  };

  const exportQuestions = () => {
    try {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text("Kumpulan Soal", 14, 22);

      const tableData = questions.map((q, index) => {
        let answerSection = '';
        if (q.options && q.options.length > 0) {
          answerSection = q.options
            .map((opt, i) => {
              const label = String.fromCharCode(65 + i);
              const isCorrect = typeof q.correctAnswer === 'number' && i === q.correctAnswer;
              return `${isCorrect ? '->' : '  '} ${label}. ${renderContent(opt)}`;
            })
            .join('\n');
        } else {
          answerSection = `Jawaban: ${renderContent(q.correctAnswer)}`;
        }
        
        const questionText = renderContent(q.question);
        return [`${index + 1}. ${questionText}`, answerSection];
      });

      // --- PERBAIKAN UTAMA: Panggil autoTable sebagai fungsi ---
      autoTable(doc, {
        startY: 30,
        head: [['Pertanyaan', 'Pilihan / Jawaban']],
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 3,
          valign: 'middle',
        },
        headStyles: {
          fillColor: [76, 85, 128], // Kode warna ungu
          textColor: 255,
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 'auto' },
        }
      });
      
      doc.save(`Soal - ${questions[0]?.subject || 'umum'}.pdf`);

    } catch (error) {
      console.error("Gagal membuat PDF:", error);
      alert(`Terjadi kesalahan saat membuat PDF: ${error.message}`);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-400/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'Hard': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  if (isGenerating && questions.length === 0) {
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

  if (questions.length === 0) {
     return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 text-center">
             <h2 className="text-2xl font-bold text-white mb-2">Gagal Membuat Soal</h2>
             <p className="text-gray-300">AI tidak berhasil membuat soal untuk permintaan ini. Coba ubah prompt atau topik Anda dan generate ulang.</p>
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
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:bg-gray-600"
          >
            <RefreshCw className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
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
          <div key={question.id || `q-${index}`} className="bg-gray-700/50 rounded-xl p-6 border border-gray-600">
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

            <h3 className="text-lg font-semibold text-white mb-4">{renderContent(question.question)}</h3>

            {question.options && question.options.length > 0 ? (
              <div className="space-y-3">
                {question.options.map((option, optionIndex) => (
                  <div
                    key={`opt-${index}-${optionIndex}`}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${optionIndex === question.correctAnswer ? 'bg-green-600/20 border-green-600/50 text-green-300' : 'bg-gray-600/30 border-gray-600/50 text-gray-300'}`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${optionIndex === question.correctAnswer ? 'bg-green-600 text-white' : 'bg-gray-600'}`}>
                      {String.fromCharCode(65 + optionIndex)}
                    </div>
                    <span>{renderContent(option)}</span>
                    {optionIndex === question.correctAnswer && <CheckCircle className="w-5 h-5 text-green-400 ml-auto" />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 bg-green-900/50 border border-green-700 rounded-lg p-3 flex items-center gap-3">
                <Type className="w-5 h-5 text-green-400" />
                <span className="text-green-300 font-medium">Jawaban:</span>
                <span className="text-white font-semibold">{renderContent(question.correctAnswer)}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionDisplay;