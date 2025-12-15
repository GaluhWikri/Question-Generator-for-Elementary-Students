import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import ConfigurationForm from './ConfigurationForm';
import MaterialUploader from './MaterialUploader';

export interface PromptBuilderProps {
    customPrompt: string;
    onPromptChange: (prompt: string) => void;
    onDifficultyChange: (difficulty: string) => void;
    materialData: { content: string, type: string } | null;
    onMaterialDataChange: (data: { content: string, type: string } | null) => void;
    fileName: string;
    onFileNameChange: (name: string) => void;
    selectedSubject: string; // BARU
    selectedGrade: string;   // BARU
}

const PromptBuilder: React.FC<PromptBuilderProps> = ({
    onPromptChange,
    onDifficultyChange,
    materialData,
    onMaterialDataChange,
    fileName,
    onFileNameChange,
    selectedSubject,
    selectedGrade
}) => {
    // ... (state logic tetap sama)
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

        // PERBAIKAN: Masukkan Subject dan Kelas ke dalam prompt agar AI lebih spesifik
        let prompt = `Buatkan ${questionCount} soal ${typeMap[questionType]} untuk ${selectedGrade} mata pelajaran ${selectedSubject} dengan tingkat kesulitan ${displayDifficulty}.`;

        if (topic) {
            prompt += ` Fokus pada topik: ${topic}.`;
        }

        if (materialData && materialData.content) {
            prompt += ` Soal HARUS dibuat BERSUMBER dari MATERI yang disertakan.`;
        }

        prompt += ` Pastikan soal sesuai dengan kurikulum SD dan mudah dipahami anak-anak.`;

        onPromptChange(prompt);
        onDifficultyChange(displayDifficulty);
    }, [questionCount, difficulty, questionType, topic, onPromptChange, onDifficultyChange, materialData, selectedSubject, selectedGrade]);

    useEffect(() => {
        generatePrompt();
    }, [generatePrompt]);

    const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setDifficulty(e.target.value);
    }

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-gray-700">
            {/* Header */}
            <div className="text-center mb-6 md:mb-8">
                <div className="flex items-center justify-center gap-3 mb-2 md:mb-4">
                    <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
                    <h2 className="text-xl md:text-2xl font-bold text-white">Buat Prompt Soal</h2>
                </div>

                {/* INFO BAR BARU */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-sm font-medium">
                        {selectedSubject}
                    </span>
                    <span className="px-3 py-1 bg-green-500/20 text-green-300 border border-green-500/30 rounded-full text-sm font-medium">
                        {selectedGrade}
                    </span>
                </div>

                <p className="text-sm md:text-base text-gray-300">Sesuaikan detail soal yang ingin dibuat</p>
            </div>

            {/* Form Configuration */}
            <ConfigurationForm
                questionCount={questionCount}
                setQuestionCount={setQuestionCount}
                difficulty={difficulty}
                setDifficulty={setDifficulty}
                questionType={questionType}
                setQuestionType={setQuestionType}
                topic={topic}
                setTopic={setTopic}
                handleDifficultyChange={handleDifficultyChange}
            />

            {/* Material Uploader */}
            <MaterialUploader
                materialData={materialData}
                onMaterialDataChange={onMaterialDataChange}
                fileName={fileName}
                onFileNameChange={onFileNameChange}
            />

        </div>
    );
};

export default PromptBuilder;
