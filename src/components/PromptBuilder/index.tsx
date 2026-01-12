import React, { useState, useEffect } from 'react';
import { Settings, BookOpen, GraduationCap } from 'lucide-react';
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
    selectedSubject: string;
    selectedGrade: string;
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
        <div className="glass-card p-6 md:p-10 animate-fade-in-up">
            {/* Header */}
            <div className="text-center mb-8 md:mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/20 mb-4">
                    <Settings className="w-8 h-8 text-purple-400" />
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3">
                    Konfigurasi <span className="gradient-text">Soal</span>
                </h2>

                {/* Subject & Grade Tags */}
                <div className="flex flex-wrap items-center justify-center gap-3 mb-4 mt-5">
                    <span className="tag tag-purple">
                        <BookOpen className="w-4 h-4" />
                        {selectedSubject}
                    </span>
                    <span className="tag tag-cyan">
                        <GraduationCap className="w-4 h-4" />
                        {selectedGrade}
                    </span>
                </div>

                <p className="text-gray-400 text-sm md:text-base max-w-md mx-auto">
                    Sesuaikan jumlah, tipe, dan tingkat kesulitan soal sesuai kebutuhan
                </p>
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

            {/* Divider */}
            <div className="divider" />

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
