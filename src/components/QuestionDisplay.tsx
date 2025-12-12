import { useState } from 'react';
import { Question } from '../types/Question';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Download, RefreshCw, Gauge, User, BarChart3, Eye, EyeOff, CheckCircle, Plus, X, Settings2 } from 'lucide-react';

interface QuestionDisplayProps {
  questions: Question[];
  isGenerating: boolean;
  onRegenerateQuestions: () => void;
  // Updated: onAddQuestions now accepts configuration
  onAddQuestions: (config: { type: string; count: number; instruction: string }) => void;
  isAppending: boolean;
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

const QuestionDisplay = ({ questions, isGenerating, isAppending, onRegenerateQuestions, onAddQuestions, subject, grade, requestedDifficulty }: QuestionDisplayProps) => {
  const [showAnswers, setShowAnswers] = useState(false);

  // State for Add Question Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addConfig, setAddConfig] = useState({
    type: 'Campuran',
    count: 5,
    instruction: ''
  });

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let cursorY = 20;

    // Helper: Wrap text
    const wrapText = (text: string, width: number) => doc.splitTextToSize(text, width);

    // Helper: Cek Page Break
    const checkPageBreak = (neededHeight: number) => {
      if (cursorY + neededHeight > pageHeight - margin) {
        doc.addPage();
        cursorY = margin;
        return true;
      }
      return false;
    };

    // --- HALAMAN 1 (HEADER) ---
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("LATIHAN SOAL", pageWidth / 2, cursorY, { align: "center" });
    cursorY += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Mata Pelajaran : ${subject}`, margin, cursorY);
    cursorY += 5;
    doc.text(`Kelas          : ${grade}`, margin, cursorY);
    cursorY += 5;
    doc.text(`Tanggal        : ${new Date().toLocaleDateString('id-ID')}`, margin, cursorY);
    cursorY += 5;
    doc.setLineWidth(0.5);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 10;

    // --- LOOP SOAL ---
    questions.forEach((q, index) => {
      doc.setFontSize(11);

      // 1. Siapkan Teks Soal (Wrapped)
      const qPrefix = `${index + 1}. `;
      // Kurangi lebar sedikit agar tidak mepet kanan
      const qLines = wrapText(q.question, contentWidth - 10);
      const qHeight = qLines.length * 5; // Estimasi tinggi per baris ~5 unit

      // 2. Siapkan Opsi (Jika ada)
      let optionsRenderData: { text: any, height: number }[] = [];
      let totalOptionsHeight = 0;

      if (q.type === 'multiple-choice' && q.options) {
        q.options.forEach((opt, i) => {
          const optPrefix = `${String.fromCharCode(65 + i)}. `;
          // Wrap tekst opsi. Beri indentasi 15 unit
          const optLines = wrapText(opt, contentWidth - 20);
          const optBlockHeight = optLines.length * 5;

          optionsRenderData.push({
            text: optLines,
            height: optBlockHeight
          });
          totalOptionsHeight += optBlockHeight;
        });
      }

      // 3. Cek apakah BLOCK soal ini muat?
      const totalBlockHeight = qHeight + totalOptionsHeight + 10; // +10 space
      checkPageBreak(totalBlockHeight);

      // 4. Render Soal
      doc.setFont("helvetica", "bold");
      doc.text(qPrefix, margin, cursorY);

      doc.setFont("helvetica", "normal");
      // Render lines soal. Perhatikan: doc.text array, x, y akan render multiline otomatis.
      // Kita perlu geser sedikit X-nya biar rapi dengan nomor.
      doc.text(qLines, margin + 7, cursorY);
      cursorY += qHeight + 2;

      // 5. Render Opsi
      if (q.type === 'multiple-choice') {
        optionsRenderData.forEach((optData, i) => {
          doc.text(`${String.fromCharCode(65 + i)}. `, margin + 12, cursorY);
          doc.text(optData.text, margin + 18, cursorY);
          cursorY += optData.height;
        });
      } else {
        // Space untuk jawaban essay
        cursorY += 5;
      }

      cursorY += 5; // Jarak antar nomor
    });

    // --- HALAMAN KUNCI JAWABAN ---
    doc.addPage();
    cursorY = margin;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("KUNCI JAWABAN", pageWidth / 2, cursorY, { align: "center" });
    cursorY += 15;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    questions.forEach((q, index) => {
      // Ambil jawaban yang valid
      const answerVal = q.correctAnswer || (q as any).answer || q.explanation || "Menunggu koreksi guru";
      let answerTextRaw = "";

      if (q.type === 'multiple-choice') {
        if (typeof q.correctAnswer === 'number') {
          answerTextRaw = String.fromCharCode(65 + q.correctAnswer);
        } else {
          // Kadang AI kasih string "0" atau "A"
          answerTextRaw = String(answerVal);
        }
      } else {
        answerTextRaw = String(answerVal);
      }

      const fullAnswerLine = `${index + 1}. ${answerTextRaw}`;
      const answerLines = wrapText(fullAnswerLine, contentWidth);
      const neededHeight = answerLines.length * 6;

      checkPageBreak(neededHeight);

      doc.text(answerLines, margin, cursorY);
      cursorY += neededHeight + 2;
    });

    doc.save(`soal_${subject.replace(/\s/g, '_')}_kelas_${grade}.pdf`);
  };

  const handleConfirmAdd = () => {
    onAddQuestions(addConfig);
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
      {/* ADD QUESTION MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Plus className="text-purple-400" />
              Tambah Soal Baru
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Jenis Soal</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Campuran', 'Pilihan Ganda', 'Isian', 'Uraian'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setAddConfig({ ...addConfig, type })}
                      className={`px-3 py-2 rounded-lg text-sm transition-all ${addConfig.type === type
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                          : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                        }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Jumlah Soal: <span className="text-purple-400 font-bold">{addConfig.count}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={addConfig.count}
                  onChange={(e) => setAddConfig({ ...addConfig, count: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Instruksi Khusus (Opsional)</label>
                <textarea
                  value={addConfig.instruction}
                  onChange={(e) => setAddConfig({ ...addConfig, instruction: e.target.value })}
                  placeholder="Contoh: Fokuskan pada materi pecahan..."
                  className="w-full px-4 py-3 bg-slate-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white text-sm min-h-[80px]"
                />
              </div>

              <button
                onClick={handleConfirmAdd}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-purple-900/20 transition-all transform hover:scale-[1.02] mt-2"
              >
                Tambahkan {addConfig.count} Soal
              </button>
            </div>
          </div>
        </div>
      )}

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
          <button
            onClick={() => setIsAddModalOpen(true)}
            disabled={isAppending}
            className={`w-full sm:w-auto flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm md:text-base ${isAppending ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isAppending ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Plus className="w-4 h-4" />}
            {isAppending ? 'Menambahkan...' : 'Tambah Soal'}
          </button>
          <button onClick={handleDownloadPDF} className="w-full sm:w-auto flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm md:text-base">
            <Download className="w-4 h-4" /> Unduh PDF
          </button>
          <button onClick={() => setShowAnswers(!showAnswers)} className="w-full sm:w-auto flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm md:text-base">
            {showAnswers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showAnswers ? 'Sembunyikan' : 'Jawaban'}
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
              <p className="p-2 md:p-3 rounded-md bg-green-500/20 border border-green-500 text-white italic text-sm">
                {q.correctAnswer || (q as any).answer || q.explanation || "Jawaban tidak tersedia"}
              </p>
            </div>
          )}
          {showAnswers && q.type === 'essay' && (
            <div className="mt-2">
              <p className="text-xs md:text-sm text-gray-400">Panduan Jawaban:</p>
              <p className="p-2 md:p-3 rounded-md bg-green-500/20 border border-green-500 text-gray-300 text-sm">
                {q.correctAnswer || (q as any).answer || q.explanation || "Jawaban tidak tersedia"}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default QuestionDisplay;