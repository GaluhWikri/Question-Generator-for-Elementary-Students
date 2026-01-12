import React from 'react';
import { Hash, Gauge, ListChecks, Lightbulb, Sparkles } from 'lucide-react';

interface ConfigurationFormProps {
    questionCount: number;
    setQuestionCount: (val: number) => void;
    difficulty: string;
    setDifficulty: (val: string) => void;
    questionType: string;
    setQuestionType: (val: string) => void;
    topic: string;
    setTopic: (val: string) => void;
    handleDifficultyChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const ConfigurationForm: React.FC<ConfigurationFormProps> = ({
    questionCount,
    setQuestionCount,
    difficulty,
    questionType,
    setQuestionType,
    topic,
    setTopic,
    handleDifficultyChange
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">

            {/* Question Count */}
            <div className="glass-card-sm p-5 md:p-6">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <Hash className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <label className="text-white font-semibold text-sm block">Jumlah Soal</label>
                        <span className="text-xs text-gray-500">Min 3, Max 20</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <input
                        type="range"
                        min="3"
                        max="20"
                        value={questionCount}
                        onChange={(e) => setQuestionCount(Number(e.target.value))}
                        className="flex-1"
                    />
                    <div className="w-14 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">{questionCount}</span>
                    </div>
                </div>
            </div>

            {/* Difficulty */}
            <div className="glass-card-sm p-5 md:p-6">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                        <Gauge className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                        <label className="text-white font-semibold text-sm block">Tingkat Kesulitan</label>
                        <span className="text-xs text-gray-500">Sesuai kemampuan siswa</span>
                    </div>
                </div>
                <select
                    value={difficulty}
                    onChange={handleDifficultyChange}
                    className="form-input form-select"
                >
                    <option value="easy">🟢 Mudah</option>
                    <option value="medium">🟡 Sedang</option>
                    <option value="hard">🔴 Sulit</option>
                    <option value="mixed">🎨 Campur</option>
                </select>
            </div>

            {/* Question Type */}
            <div className="glass-card-sm p-5 md:p-6">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                        <ListChecks className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                        <label className="text-white font-semibold text-sm block">Jenis Soal</label>
                        <span className="text-xs text-gray-500">Format jawaban</span>
                    </div>
                </div>
                <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value)}
                    className="form-input form-select"
                >
                    <option value="multiple-choice">📝 Pilihan Ganda</option>
                    <option value="fill-blank">✏️ Isian Singkat</option>
                    <option value="essay">📖 Uraian/Essay</option>
                </select>
            </div>

            {/* Topic */}
            <div className="glass-card-sm p-5 md:p-6">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                        <Lightbulb className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                        <label className="text-white font-semibold text-sm block">Topik Khusus</label>
                        <span className="text-xs text-gray-500">Opsional</span>
                    </div>
                </div>
                <div className="relative">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Contoh: Penjumlahan, Membaca, dll."
                        className="form-input pr-10"
                    />
                    {topic && (
                        <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConfigurationForm;
