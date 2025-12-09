import { useState } from 'react';
import { Question } from '../types/Question';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Download, RefreshCw, Gauge, User, BarChart3, Eye, EyeOff, CheckCircle } from 'lucide-react';

interface QuestionDisplayProps {
  questions: Question[];
  isGenerating: boolean;
  onRegenerateQuestions: () => void;
  prompt: string;
  requestedDifficulty: string;
  subject: string;
  grade: string;
}

// Helper untuk memformat teks agar pas di PDF
const formatText = (text: string, doc: jsPDF, startX: number, startY: number, maxWidth: number) => {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, startX, startY);
  // Mengembalikan tinggi teks yang ditambahkan
  return lines.length * doc.getLineHeight();
};

const QuestionDisplay = ({ questions, isGenerating, onRegenerateQuestions, subject, grade, requestedDifficulty }: QuestionDisplayProps) => {
  const [showAnswers, setShowAnswers] = useState(false);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    let cursorY = 20;

    // Judul
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Latihan Soal", pageWidth / 2, cursorY, { align: "center" });
    cursorY += 10;

    // Informasi Mata Pelajaran dan Kelas
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Mata Pelajaran: ${subject}`, margin, cursorY);
    doc.text(`Kelas: ${grade}`, pageWidth / 2, cursorY);
    cursorY += 15;

    questions.forEach((q, index) => {
      if (cursorY > 260) { // Pindah halaman jika hampir penuh
        doc.addPage();
        cursorY = 20;
      }

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      const questionText = `${index + 1}. ${q.question}`;
      const questionHeight = formatText(questionText, doc, margin, cursorY, contentWidth);
      cursorY += questionHeight + 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);

      if (q.type === 'multiple-choice' && q.options) {
        const options = ['A', 'B', 'C', 'D'];
        q.options.forEach((opt, i) => {
          const optionText = `${options[i]}. ${opt}`;
          const optionHeight = formatText(optionText, doc, margin + 5, cursorY, contentWidth - 5);
          cursorY += optionHeight;
        });
      }
      cursorY += 10; // Spasi antar soal
    });

    doc.save(`soal_${subject.replace(/\s/g, '_')}_kelas_${grade}.pdf`);
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
    <div className="space-y-6 md:space-y-8">
      <div className="p-4 md:p-6 bg-slate-800/50 rounded-xl shadow-lg">
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-purple-300 border-b-2 border-purple-500/30 pb-3">Ringkasan Soal</h2>

        {/* Tampilan Baru untuk Mata Pelajaran dan Kelas */}
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
          <button onClick={handleDownloadPDF} className="w-full sm:w-auto flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm md:text-base">
            <Download className="w-4 h-4" /> Unduh PDF
          </button>
          <button onClick={() => setShowAnswers(!showAnswers)} className="w-full sm:w-auto flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm md:text-base">
            {showAnswers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showAnswers ? 'Sembunyikan Jawaban' : 'Tampilkan Jawaban'}
          </button>
        </div>
      </div>

      {questions.map((q, index) => (
        <div key={index} className="p-4 md:p-6 bg-slate-800/50 rounded-xl shadow-lg transition-all hover:bg-slate-800/80">
          <p className="font-semibold mb-3 md:mb-4 text-base md:text-lg">
            <span className="text-purple-400 mr-2">{index + 1}.</span>{q.question}
          </p>
          {q.type === 'multiple-choice' && q.options && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 text-sm">
              {q.options.map((option, i) => (
                <div key={i} className={`p-2 md:p-3 rounded-md border transition-all flex items-center justify-between ${showAnswers && i === q.correctAnswer ? 'bg-green-500/20 border-green-500 text-white' : 'bg-slate-700/50 border-slate-600 text-gray-300'}`}>
                  <div className="flex-1">
                    <span className={`font-mono mr-2 ${showAnswers && i === q.correctAnswer ? 'text-green-400' : 'text-gray-500'}`}>{String.fromCharCode(65 + i)}.</span>
                    <span>{option}</span>
                  </div>
                  {showAnswers && i === q.correctAnswer && (
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-400 shrink-0 ml-2" />
                  )}
                </div>
              ))}
            </div>
          )}
          {showAnswers && q.type === 'fill-in-the-blank' && (
            <div className="mt-2">
              <p className="text-xs md:text-sm text-gray-400">Kunci Jawaban:</p>
              <p className="p-2 md:p-3 rounded-md bg-green-500/20 border border-green-500 text-white italic text-sm">{q.correctAnswer}</p>
            </div>
          )}
          {showAnswers && q.type === 'essay' && (
            <div className="mt-2">
              <p className="text-xs md:text-sm text-gray-400">Panduan Jawaban:</p>
              <p className="p-2 md:p-3 rounded-md bg-green-500/20 border border-green-500 text-gray-300 text-sm">{q.correctAnswer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default QuestionDisplay;