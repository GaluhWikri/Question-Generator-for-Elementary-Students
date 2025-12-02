// src/components/QuestionDisplay.tsx

import React from 'react';
// Import Edit icon untuk Uraian/Essay
import { Download, RefreshCw, CheckCircle, FileText, Type, Target, BookOpen, Edit } from 'lucide-react';
import { Question } from '../types/Question';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface QuestionDisplayProps {
  questions: Question[];
  isGenerating: boolean;
  onRegenerateQuestions: () => void; // Disesuaikan, prompt/content ditangani App.tsx
  prompt: string;
  requestedDifficulty: string;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  questions,
  isGenerating,
  onRegenerateQuestions,
  prompt,
  requestedDifficulty
}) => {
  // ... (renderContent tetap sama) ...
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
        let questionType = '';

        const content = renderContent(q.question);

        // PERUBAHAN 1: Logika penanganan tipe soal di PDF Export
        if (q.type === 'multiple-choice' && q.options && q.options.length > 0) {
          questionType = 'Pilihan Ganda';
          answerSection = q.options
            .map((opt, i) => {
              const label = String.fromCharCode(65 + i);
              // Catatan: correctAnswer bisa jadi string atau number, tapi untuk PG harus number
              const isCorrect = typeof q.correctAnswer === 'number' && i === q.correctAnswer;
              return `${isCorrect ? '->' : '  '} ${label}. ${renderContent(opt)}`;
            })
            .join('\n');
        } else if (q.type === 'essay') {
          questionType = 'Uraian (Essay)';
          answerSection = `Kunci Jawaban Uraian:\n${renderContent(q.correctAnswer)}`;
        } else {
          // Default: fill-in-the-blank atau tipe lain
          questionType = 'Isian Singkat';
          answerSection = `Jawaban Singkat: ${renderContent(q.correctAnswer)}`;
        }
        // AKHIR PERUBAHAN 1

        return [`${index + 1}. [${questionType}] ${content}`, answerSection];
      });

      autoTable(doc, {
        startY: 30,
        head: [['Pertanyaan', 'Pilihan / Jawaban']],
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 3,
          valign: 'top', // Ubah ke top untuk uraian
        },
        headStyles: {
          fillColor: [76, 85, 128],
          textColor: 255,
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: 95 },
          1: { cellWidth: 90 },
        }
      });

      doc.save(`Soal - ${questions[0]?.subject || 'umum'}.pdf`);

} catch (error) {
      console.error("Gagal membuat PDF:", error);
      
      let errorMessage = "Terjadi kesalahan saat membuat PDF yang tidak diketahui.";

      // Pengecekan tipe untuk mengakses properti 'message' dengan aman
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      alert(`Terjadi kesalahan saat membuat PDF: ${errorMessage}`);
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
      case 'mudah':
        return 'text-green-400 bg-green-400/20';
      case 'medium':
      case 'sedang':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'hard':
      case 'sulit':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  // BARU: Fungsi untuk menentukan ikon tipe soal
  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple-choice':
        return <BookOpen className="w-5 h-5 text-gray-400" />;
      case 'fill-in-the-blank':
        return <Type className="w-5 h-5 text-gray-400" />;
      case 'essay':
        return <Edit className="w-5 h-5 text-gray-400" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  }

  // ... (Pengecekan isGenerating dan questions.length === 0 tetap) ...

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
      {/* ... (Header dan tombol Regenerate/Export tetap) ... */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Soal yang Dihasilkan</h2>
          {/* Tampilan Tingkat Kesulitan yang Diminta */}
          {requestedDifficulty && (
            <div className="flex items-center text-gray-300 mb-2">
              <Target className="w-4 h-4 mr-2 text-purple-400" />
              <span className="font-medium text-sm">Kesulitan yang Diminta:</span>
              <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold uppercase ${getDifficultyColor(requestedDifficulty)}`}>
                {requestedDifficulty}
              </span>
            </div>
          )}
          <p className="text-gray-300 text-sm">{questions.length} soal berhasil dibuat</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onRegenerateQuestions}
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
                {/* Tampilan Kesulitan Soal Individual */}
                {question.difficulty && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(question.difficulty)}`}>
                    {question.difficulty}
                  </span>
                )}
              </div>
              {/* BARU: Menampilkan ikon tipe soal */}
              {getQuestionTypeIcon(question.type || 'unknown')}
            </div>

            <h3 className="text-lg font-semibold text-white mb-4">{renderContent(question.question)}</h3>

            {/* PERUBAHAN 2: Logika tampilan untuk PG, Isian, dan Uraian */}
            {question.type === 'multiple-choice' && question.options && question.options.length > 0 ? (
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
            ) : question.type === 'essay' ? (
              <div className="mt-4 bg-purple-900/50 border border-purple-700 rounded-lg p-3 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <Edit className="w-5 h-5 text-purple-400" />
                  <span className="text-purple-300 font-medium">Kunci Jawaban Uraian:</span>
                </div>
                {/* Menggunakan whitespace-pre-wrap agar format jawaban panjang dari AI tetap terjaga */}
                <p className="text-white font-normal pl-8 whitespace-pre-wrap">{renderContent(question.correctAnswer)}</p>
              </div>
            ) : (
              <div className="mt-4 bg-green-900/50 border border-green-700 rounded-lg p-3 flex items-center gap-3">
                <Type className="w-5 h-5 text-green-400" />
                <span className="text-green-300 font-medium">Jawaban Isian Singkat:</span>
                <span className="text-white font-semibold">{renderContent(question.correctAnswer)}</span>
              </div>
            )}
            {/* AKHIR PERUBAHAN 2 */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionDisplay;