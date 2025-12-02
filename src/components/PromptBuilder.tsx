// src/components/PromptBuilder.tsx

import React, { useState, useEffect } from 'react'; 
// Impor ikon baru untuk file upload dan clear
import { MessageSquare, Lightbulb, Target, Clock, BarChart3, FileText, XCircle } from 'lucide-react'; 

interface PromptBuilderProps {
  customPrompt: string;
  onPromptChange: (prompt: string) => void;
  onDifficultyChange: (difficulty: string) => void; 
  subject: string;
  grade: string;
  // BARU: Prop untuk Material Content dan Nama File
  materialContent: string;
  onMaterialContentChange: (content: string) => void;
  fileName: string;
  onFileNameChange: (name: string) => void;
}

const PromptBuilder: React.FC<PromptBuilderProps> = ({ 
  onPromptChange, 
  onDifficultyChange, 
  subject, 
  grade,
  // BARU: Destructuring prop material
  materialContent,
  onMaterialContentChange,
  fileName,
  onFileNameChange,
}) => {
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  // PERUBAHAN 1: Tambahkan 'essay' ke state
  const [questionType, setQuestionType] = useState('multiple-choice');
  const [topic, setTopic] = useState('');

  const generatePrompt = React.useCallback(() => { 
    // ... (subjectMap, gradeMap, difficultyMap tetap sama) ...
    const subjectMap: { [key: string]: string } = {
      'matematika': 'Matematika',
      'bahasa-indonesia': 'Bahasa Indonesia',
      'ipa': 'IPA',
      'ips': 'IPS',
      'seni-budaya': 'Seni Budaya',
      'pjok': 'PJOK'
    };

    const gradeMap: { [key: string]: string } = {
      'kelas-1': 'Kelas 1',
      'kelas-2': 'Kelas 2',
      'kelas-3': 'Kelas 3',
      'kelas-4': 'Kelas 4',
      'kelas-5': 'Kelas 5',
      'kelas-6': 'Kelas 6'
    };

    const difficultyMap: { [key: string]: string } = {
      'easy': 'mudah',
      'medium': 'sedang',
      'hard': 'sulit',
      'mixed': 'campur'
    };

    // PERUBAHAN 2: Tambahkan 'essay' ke typeMap
    const typeMap: { [key: string]: string } = {
      'multiple-choice': 'pilihan ganda',
      'fill-blank': 'isian singkat', // Ganti 'isian' menjadi 'isian singkat' agar lebih jelas
      'essay': 'uraian/essay'
    };
    // ... (end of typeMap) ...

    const displayDifficulty = difficultyMap[difficulty] || difficulty;
    
    // PERUBAHAN 3: Suntikkan instruksi materi ke prompt
    let prompt = `Buatkan ${questionCount} soal ${typeMap[questionType]} untuk mata pelajaran ${subjectMap[subject]} tingkat ${gradeMap[grade]} dengan tingkat kesulitan ${displayDifficulty}.`;
    
    if (topic) {
      prompt += ` Fokus pada topik: ${topic}.`;
    }
    
    if (materialContent) {
        prompt += ` Soal HARUS dibuat BERSUMBER dari MATERI yang disertakan.`;
    }

    prompt += ` Pastikan soal sesuai dengan kurikulum SD dan mudah dipahami anak-anak.`;

    onPromptChange(prompt);
    onDifficultyChange(displayDifficulty);
  }, [questionCount, difficulty, questionType, topic, subject, grade, onPromptChange, onDifficultyChange, materialContent]); // Tambahkan materialContent sebagai dependency

  useEffect(() => {
    generatePrompt();
  }, [generatePrompt]);

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDifficulty(e.target.value);
  }

  // BARU: Fungsi untuk menangani upload file dan ekstraksi teks
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Batasan ukuran file (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB.');
        e.target.value = '';
        return;
    }

    onFileNameChange(file.name);
    e.target.value = ''; // Reset input agar bisa upload file yang sama lagi

    // Hanya file .txt yang bisa langsung dibaca di client-side
    if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        onMaterialContentChange(text);
      };
      reader.onerror = () => {
        alert("Gagal membaca file .txt.");
        onMaterialContentChange('');
        onFileNameChange('');
      };
      reader.readAsText(file);
    } else if (file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf') || file.type.includes('word') || file.name.toLowerCase().endsWith('.docx')) {
        // Logika untuk PDF/DOCX: Minta pengguna untuk menyalin teks karena
        // parsing file kompleks membutuhkan library yang besar/tambahan
        alert(`Untuk file ${file.name} (.pdf, .docx), Anda harus menyalin teks materinya. Silakan tempelkan konten teks di area di bawah setelah mengklik OK.`);
        onMaterialContentChange(``); // Kosongkan, biarkan pengguna menempelkan
    } else {
        alert('Format file tidak didukung. Harap gunakan file .txt, .pdf, atau .docx.');
        onMaterialContentChange('');
        onFileNameChange('');
    }
  };

  const clearMaterial = () => {
    onMaterialContentChange('');
    onFileNameChange('');
  }
  
  const MAX_CHAR_COUNT = 5000;


  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
      {/* ... (Header remains the same) ... */}

      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <MessageSquare className="w-8 h-8 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Buat Prompt Soal</h2>
        </div>
        <p className="text-gray-300">Sesuaikan detail soal yang ingin dibuat</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Question Count (Remains the same) */}
        <div className="bg-gray-700/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <label className="text-white font-semibold">Jumlah Soal</label>
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

        {/* Difficulty (Remains the same) */}
        <div className="bg-gray-700/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-green-400" />
            <label className="text-white font-semibold">Tingkat Kesulitan</label>
          </div>
          <select
            value={difficulty}
            onChange={handleDifficultyChange}
            className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="easy">Mudah</option>
            <option value="medium">Sedang</option>
            <option value="hard">Sulit</option>
            <option value="mixed">Campur</option>
          </select>
        </div>

        {/* Question Type (Updated with essay) */}
        <div className="bg-gray-700/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-orange-400" />
            <label className="text-white font-semibold">Jenis Soal</label>
          </div>
          <select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
            className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="multiple-choice">Pilihan Ganda</option>
            <option value="fill-blank">Isian Singkat</option>
            <option value="essay">Uraian/Essay</option>
          </select>
        </div>

        {/* Topic (Remains the same) */}
        <div className="bg-gray-700/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="w-6 h-6 text-yellow-400" />
            <label className="text-white font-semibold">Topik Khusus (Opsional)</label>
          </div>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Contoh: Penjumlahan, Membaca, dll."
            className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>
      
      {/* BARU: File Upload / Text Area Section */}
      <div className="md:col-span-2 bg-gray-700/50 rounded-2xl p-6 mt-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-indigo-400" />
            <label className="text-white font-semibold">Upload Materi Sumber (Opsional)</label>
          </div>
          
          {materialContent && materialContent.length > 0 ? (
              <div className="bg-gray-600 border border-indigo-500 p-3 rounded-lg flex items-center justify-between">
                  <span className="text-white text-sm truncate">{fileName || 'Teks Tempel'} ({materialContent.length} karakter)</span>
                  <button onClick={clearMaterial} className="text-red-400 hover:text-red-500 flex items-center gap-1">
                      <XCircle className="w-5 h-5" />
                      Hapus
                  </button>
              </div>
          ) : (
              <>
                  <label htmlFor="material-upload" className="block w-full text-center p-4 border-2 border-dashed border-indigo-500 rounded-lg cursor-pointer hover:bg-gray-600/50 transition-colors">
                      <p className="text-indigo-400 font-medium">Klik untuk upload file</p>
                      <p className="text-xs text-gray-400 mt-1">Dukungan: .TXT, .PDF, .DOCX (Harap pastikan konten teks dapat diekstrak)</p>
                      <input
                          id="material-upload"
                          type="file"
                          accept=".txt,.pdf,.docx"
                          onChange={handleFileUpload}
                          className="hidden"
                      />
                  </label>
                  <textarea
                      value={materialContent}
                      onChange={(e) => onMaterialContentChange(e.target.value)}
                      placeholder="Atau, tempelkan teks materi langsung di sini. Gunakan teks yang jelas agar hasil soal maksimal."
                      maxLength={MAX_CHAR_COUNT}
                      rows={6}
                      className="w-full mt-4 p-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="text-right text-xs text-gray-400">
                      {materialContent.length}/{MAX_CHAR_COUNT} Karakter
                  </div>
              </>
          )}
          
      </div>

    </div>
  );
};

export default PromptBuilder;