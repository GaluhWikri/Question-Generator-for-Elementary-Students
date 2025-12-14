import React from 'react';
import { Hash, Gauge, ListChecks, Lightbulb } from 'lucide-react';

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
    );
};

export default ConfigurationForm;
