import { useState } from 'react';
import { Question } from '../../types/Question';
import { generateQuestionPDF } from '../../lib/pdfExporter';
import { Download, RefreshCw, Gauge, User, BarChart3, Eye, EyeOff, Plus } from 'lucide-react';

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

  const handleDownloadPDF = async () => {
    const btn = document.getElementById('btn-download-pdf');
    if (btn) btn.innerText = "Mengunduh...";

    await generateQuestionPDF({
      questions,
      subject,
      grade
    });

    if (btn) btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download w-4 h-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg> Unduh PDF';
  };

  const handleConfirmAdd = (config: { type: string; count: number; instruction: string }) => {
    onAddQuestions(config);
    setIsAddModalOpen(false);
  };

  if (isGenerating) {
    return (
      <div className="text-center p-8 bg-slate-800/50 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
        <p className="mt-4 text-lg">AI sedang meracik soal-soal terbaik untuk Anda...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 relative">
      {/* 1. MODAL */}
      <AddQuestionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onConfirm={handleConfirmAdd}
        isLoading={isAppending}
      />

      {/* 2. HEADER & CONTROLS */}
      <div className="p-4 md:p-6 bg-slate-800/50 rounded-xl shadow-lg">
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-purple-300 border-b-2 border-purple-500/30 pb-3">Ringkasan Soal</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6 text-center">
          <div className="bg-slate-700/50 p-3 md:p-4 rounded-lg flex flex-col items-center justify-center">
            <Gauge className="w-5 h-5 md:w-6 md:h-6 mb-2 text-blue-400" />
            <span className="text-xs md:text-sm text-gray-400">Mata Pelajaran</span>
            <span className="font-semibold text-base md:text-lg">{subject}</span>
          </div>
          <div className="bg-slate-700/50 p-3 md:p-4 rounded-lg flex flex-col items-center justify-center">
            <User className="w-5 h-5 md:w-6 md:h-6 mb-2 text-green-400" />
            <span className="text-xs md:text-sm text-gray-400">Kelas</span>
            <span className="font-semibold text-base md:text-lg">{grade}</span>
          </div>
          <div className="bg-slate-700/50 p-3 md:p-4 rounded-lg flex flex-col items-center justify-center">
            <BarChart3 className="w-5 h-5 md:w-6 md:h-6 mb-2 text-yellow-400" />
            <span className="text-xs md:text-sm text-gray-400">Tingkat Kesulitan</span>
            <span className="font-semibold text-base md:text-lg capitalize">{requestedDifficulty || 'Standar'}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-4 md:mt-6">
          <button onClick={onRegenerateQuestions} className="w-full sm:w-auto flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm md:text-base">
            <RefreshCw className="w-4 h-4" /> Buat Ulang
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            disabled={isAppending}
            className={`w-full sm:w-auto flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm md:text-base ${isAppending ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isAppending ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Plus className="w-4 h-4" />}
            {isAppending ? 'Menambahkan...' : 'Tambah Soal'}
          </button>
          <button onClick={handleDownloadPDF} id="btn-download-pdf" className="w-full sm:w-auto flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm md:text-base">
            <Download className="w-4 h-4" /> Unduh PDF
          </button>
          <button onClick={() => setShowAnswers(!showAnswers)} className="w-full sm:w-auto flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm md:text-base">
            {showAnswers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showAnswers ? 'Sembunyikan' : 'Jawaban'}
          </button>
        </div>
      </div>

      {/* 3. QUESTION LIST */}
      {questions.map((q, index) => (
        <QuestionItem
          key={index}
          question={q}
          index={index}
          showAnswers={showAnswers}
        />
      ))}
    </div>
  );
};

export default QuestionDisplay;