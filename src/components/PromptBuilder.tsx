// src/components/PromptBuilder.tsx

import React, { useState, useEffect } from 'react';
import { MessageSquare, Lightbulb, Gauge, ListChecks, Hash, FileText, XCircle } from 'lucide-react';

interface PromptBuilderProps {
  customPrompt: string;
  onPromptChange: (prompt: string) => void;
  onDifficultyChange: (difficulty: string) => void;
  // BARU: Prop untuk Material Content dan Nama File
  materialData: { content: string, type: string } | null;
  onMaterialDataChange: (data: { content: string, type: string } | null) => void;
  fileName: string;
  onFileNameChange: (name: string) => void;
}

const PromptBuilder: React.FC<PromptBuilderProps> = ({
  // Hapus customPrompt dari destructuring
  onPromptChange,
  onDifficultyChange,
  // BARU: Destructuring prop material
  materialData,
  onMaterialDataChange,
  fileName,
  onFileNameChange,
}) => {
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [questionType, setQuestionType] = useState('multiple-choice');
  const [topic, setTopic] = useState('');


  const generatePrompt = React.useCallback(() => {
    const difficultyMap: { [key: string]: string } = {
      'easy': 'mudah',
      'medium': 'sedang',
      'hard': 'sulit',
      'mixed': 'campur'
    };

    const typeMap: { [key: string]: string } = {
      'multiple-choice': 'pilihan ganda',
      'fill-blank': 'isian singkat',
      'essay': 'uraian/essay'
    };

    const displayDifficulty = difficultyMap[difficulty] || difficulty;

    // PERBAIKAN: Prompt sekarang lebih sederhana, karena detail subjek dan kelas ditangani backend.
    let prompt = `Buatkan ${questionCount} soal ${typeMap[questionType]} dengan tingkat kesulitan ${displayDifficulty}.`;

    if (topic) {
      prompt += ` Fokus pada topik: ${topic}.`;
    }

    // Pengecekan hanya berdasarkan keberadaan data, parsing akan dilakukan di backend
    if (materialData && materialData.content) {
      prompt += ` Soal HARUS dibuat BERSUMBER dari MATERI yang disertakan.`;
    }

    prompt += ` Pastikan soal sesuai dengan kurikulum SD dan mudah dipahami anak-anak.`;

    onPromptChange(prompt);
    onDifficultyChange(displayDifficulty);
  }, [questionCount, difficulty, questionType, topic, onPromptChange, onDifficultyChange, materialData]);

  useEffect(() => {
    generatePrompt();
  }, [generatePrompt]);

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDifficulty(e.target.value);
  }

  // BARU: Fungsi untuk menangani upload file dan EKSTRAKSI TEKS
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB. Gunakan file yang lebih kecil.');
      e.target.value = '';
      return;
    }

    onFileNameChange(file.name);
    e.target.value = '';

    const reader = new FileReader();
    reader.onload = (event) => {
      // Ambil bagian Base64 saja dari Data URL
      const base64Content = (event.target?.result as string).split(',')[1];

      // Simpan Base64 content dan file type untuk dikirim ke backend
      onMaterialDataChange({
        content: base64Content,
        type: file.type || 'application/octet-stream'
      });
    };

    reader.onerror = () => {
      alert("Gagal membaca file.");
      onMaterialDataChange(null);
      onFileNameChange('');
    };

    // Baca semua file (TXT, PDF, DOCX) sebagai Data URL (Base64)
    reader.readAsDataURL(file);
  };


  const clearMaterial = () => {
    onMaterialDataChange(null);
    onFileNameChange('');
  }




  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-gray-700">
      <div className="text-center mb-6 md:mb-8">
        <div className="flex items-center justify-center gap-3 mb-2 md:mb-4">
          <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
          <h2 className="text-xl md:text-2xl font-bold text-white">Buat Prompt Soal</h2>
        </div>
        <p className="text-sm md:text-base text-gray-300">Sesuaikan detail soal yang ingin dibuat</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Question Count */}
        <div className="bg-gray-700/50 rounded-xl p-4 md:p-6">
          <div className="flex items-center gap-3 mb-4">
            <Hash className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
            <label className="text-white font-semibold text-sm md:text-base">Jumlah Soal</label>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="3"
              max="20"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-white font-bold text-lg w-8">{questionCount}</span>
          </div>
        </div>

        {/* Difficulty */}
        <div className="bg-gray-700/50 rounded-xl p-4 md:p-6">
          <div className="flex items-center gap-3 mb-4">
            <Gauge className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
            <label className="text-white font-semibold text-sm md:text-base">Tingkat Kesulitan</label>
          </div>
          <select
            value={difficulty}
            onChange={handleDifficultyChange}
            className="w-full p-2 md:p-3 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm md:text-base"
          >
            <option value="easy">Mudah</option>
            <option value="medium">Sedang</option>
            <option value="hard">Sulit</option>
            <option value="mixed">Campur</option>
          </select>
        </div>

        {/* Question Type */}
        <div className="bg-gray-700/50 rounded-xl p-4 md:p-6">
          <div className="flex items-center gap-3 mb-4">
            <ListChecks className="w-5 h-5 md:w-6 md:h-6 text-orange-400" />
            <label className="text-white font-semibold text-sm md:text-base">Jenis Soal</label>
          </div>
          <select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
            className="w-full p-2 md:p-3 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm md:text-base"
          >
            <option value="multiple-choice">Pilihan Ganda</option>
            <option value="fill-blank">Isian Singkat</option>
            <option value="essay">Uraian/Essay</option>
          </select>
        </div>

        {/* Topic */}
        <div className="bg-gray-700/50 rounded-xl p-4 md:p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
            <label className="text-white font-semibold text-sm md:text-base">Topik Khusus (Opsional)</label>
          </div>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Contoh: Penjumlahan, Membaca, dll."
            className="w-full p-2 md:p-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm md:text-base"
          />
        </div>
      </div>

      {/* File Upload / Text Area Section */}
      <div className="md:col-span-2 bg-gray-700/50 rounded-2xl p-4 md:p-6 mt-4 md:mt-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-5 h-5 md:w-6 md:h-6 text-indigo-400" />
          <label className="text-white font-semibold text-sm md:text-base">Upload Materi Sumber (Opsional)</label>
        </div>

        {materialData && materialData.content.length > 0 ? (
          <div className="bg-gray-600 border border-indigo-500 p-3 rounded-lg flex items-center justify-between">
            {/* Menampilkan informasi file/teks yang sudah di-load */}
            <span className="text-white text-xs md:text-sm truncate max-w-[200px] md:max-w-md">{fileName || ''} ({materialData.content.length} karakter)</span>
            <button onClick={clearMaterial} className="text-red-400 hover:text-red-500 flex items-center gap-1 text-sm">
              <XCircle className="w-4 h-4 md:w-5 md:h-5" />
              Hapus
            </button>
          </div>
        ) : (
          <>
            <label htmlFor="material-upload" className="block w-full text-center p-4 border-2 border-dashed border-indigo-500 rounded-lg cursor-pointer hover:bg-gray-600/50 transition-colors">
              <p className="text-indigo-400 font-medium text-sm md:text-base">Klik untuk upload file</p>
              <p className="text-xs text-gray-400 mt-1">Dukungan: .TXT, .PDF, .DOCX (Max 5MB)</p>
              <input
                id="material-upload"
                type="file"
                accept=".txt,.pdf,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            {/* Text area untuk input manual */}

          </>
        )}

      </div>

    </div>
  );
};

export default PromptBuilder;