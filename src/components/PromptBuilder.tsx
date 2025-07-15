import React, { useState } from 'react';
import { MessageSquare, Lightbulb, Target, Clock, BarChart3 } from 'lucide-react';

interface PromptBuilderProps {
  customPrompt: string;
  onPromptChange: (prompt: string) => void;
  subject: string;
  grade: string;
}

const PromptBuilder: React.FC<PromptBuilderProps> = ({ 
  customPrompt, 
  onPromptChange, 
  subject, 
  grade 
}) => {
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [questionType, setQuestionType] = useState('multiple-choice');
  const [topic, setTopic] = useState('');

  const generatePrompt = () => {
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

    const typeMap: { [key: string]: string } = {
      'multiple-choice': 'pilihan ganda',
      'true-false': 'benar-salah',
      'fill-blank': 'isian'
    };

    let prompt = `Buatkan ${questionCount} soal ${typeMap[questionType]} untuk mata pelajaran ${subjectMap[subject]} tingkat ${gradeMap[grade]} dengan tingkat kesulitan ${difficultyMap[difficulty]}.`;
    
    if (topic) {
      prompt += ` Fokus pada topik: ${topic}.`;
    }

    prompt += ` Pastikan soal sesuai dengan kurikulum SD dan mudah dipahami anak-anak.`;

    onPromptChange(prompt);
  };

  React.useEffect(() => {
    generatePrompt();
  }, [questionCount, difficulty, questionType, topic, subject, grade]);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <MessageSquare className="w-8 h-8 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Buat Prompt Soal</h2>
        </div>
        <p className="text-gray-300">Sesuaikan detail soal yang ingin dibuat</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Question Count */}
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

        {/* Difficulty */}
        <div className="bg-gray-700/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-green-400" />
            <label className="text-white font-semibold">Tingkat Kesulitan</label>
          </div>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="easy">Mudah</option>
            <option value="medium">Sedang</option>
            <option value="hard">Sulit</option>
            <option value="mixed">Campur</option>
          </select>
        </div>

        {/* Question Type */}
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
            <option value="true-false">Benar-Salah</option>
            <option value="fill-blank">Isian</option>
          </select>
        </div>

        {/* Topic */}
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

    </div>
  );
};

export default PromptBuilder;