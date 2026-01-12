import { useState } from 'react';
import { Question } from '../../types/Question';
import { generateQuestionPDF } from '../../lib/pdfExporter';
import { Download, RefreshCw, BookOpen, GraduationCap, BarChart3, Eye, EyeOff, Plus, Sparkles, FileDown, Loader2 } from 'lucide-react';

/* Sub-Components */
import AddQuestionModal from './AddQuestionModal';
import QuestionItem from './QuestionItem';

interface QuestionDisplayProps {
  questions: Question[];
  isGenerating: boolean;
  onRegenerateQuestions: () => void;
  onAddQuestions: (config: { type: string; count: number; instruction: string }) => void;
  isAppending: boolean;
  prompt: string;
  requestedDifficulty: string;
  subject: string;
  grade: string;
}

const QuestionDisplay = ({ questions, isGenerating, isAppending, onRegenerateQuestions, onAddQuestions, subject, grade, requestedDifficulty }: QuestionDisplayProps) => {
  const [showAnswers, setShowAnswers] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    await generateQuestionPDF({
      questions,
      subject,
      grade
    });
    setIsDownloading(false);
  };

  const handleConfirmAdd = (config: { type: string; count: number; instruction: string }) => {
    onAddQuestions(config);
    setIsAddModalOpen(false);
  };

  if (isGenerating) {
    return (
      <div className="glass-card p-12 text-center animate-fade-in">
        <div className="inline-flex flex-col items-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-purple-500/20 flex items-center justify-center">
              <div className="spinner" />
            </div>
            <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl animate-pulse" />
          </div>
          <p className="mt-6 text-xl font-medium text-white">AI sedang meracik soal...</p>
          <p className="mt-2 text-gray-400 text-sm">Mohon tunggu beberapa saat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in-up">
      {/* 1. MODAL */}
      <AddQuestionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onConfirm={handleConfirmAdd}
        isLoading={isAppending}
      />

      {/* 2. HEADER & CONTROLS */}
      <div className="glass-card p-5 md:p-8">
        {/* Title with Success Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Hasil <span className="gradient-text">Soal</span>
              </h2>
            </div>
            <p className="text-gray-400 text-sm ml-13">
              {questions.length} soal berhasil dibuat oleh AI
            </p>
          </div>

          {/* Answer Toggle */}
          <button
            onClick={() => setShowAnswers(!showAnswers)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300
              ${showAnswers
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700 border border-slate-600/50'
              }
            `}
          >
            {showAnswers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showAnswers ? 'Sembunyikan Jawaban' : 'Tampilkan Jawaban'}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 md:mb-8">
          <div className="stat-card">
            <div className="stat-icon bg-blue-500/20">
              <BookOpen className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-xs text-gray-400 block mb-1">Mata Pelajaran</span>
            <span className="font-semibold text-white text-lg">{subject}</span>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-green-500/20">
              <GraduationCap className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-xs text-gray-400 block mb-1">Kelas</span>
            <span className="font-semibold text-white text-lg">{grade}</span>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-yellow-500/20">
              <BarChart3 className="w-5 h-5 text-yellow-400" />
            </div>
            <span className="text-xs text-gray-400 block mb-1">Tingkat Kesulitan</span>
            <span className="font-semibold text-white text-lg capitalize">{requestedDifficulty || 'Standar'}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="divider" />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRegenerateQuestions}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl font-medium transition-all duration-300 border border-slate-600/50 hover:border-slate-500 group"
          >
            <RefreshCw className="w-4 h-4 transition-transform group-hover:-rotate-180 duration-500" />
            Buat Ulang
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            disabled={isAppending}
            className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 ${isAppending
                ? 'bg-purple-600/50 text-purple-200 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30'
              }`}
          >
            {isAppending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {isAppending ? 'Menambahkan...' : 'Tambah Soal'}
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex-1 relative flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-white transition-all duration-300 overflow-hidden shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-500" />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-0 hover:opacity-100 transition-opacity" />
            {isDownloading ? (
              <Loader2 className="relative z-10 w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="relative z-10 w-4 h-4" />
            )}
            <span className="relative z-10">{isDownloading ? 'Mengunduh...' : 'Unduh PDF'}</span>
          </button>
        </div>
      </div>

      {/* 3. QUESTION LIST */}
      <div className="space-y-4">
        {questions.map((q, index) => (
          <QuestionItem
            key={index}
            question={q}
            index={index}
            showAnswers={showAnswers}
          />
        ))}
      </div>
    </div>
  );
};

export default QuestionDisplay;