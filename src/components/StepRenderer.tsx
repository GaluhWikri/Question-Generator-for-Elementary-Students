import SubjectSelector from '@/components/SubjectSelector';
import GradeSelector from '@/components/GradeSelector';
import PromptBuilder from '@/components/PromptBuilder/index';
import QuestionDisplay from '@/components/QuestionDisplay';
import { Question } from '@/types/Question';

interface StepRendererProps {
    currentStep: number;
    selectedSubject: string;
    onSubjectChange: (val: string) => void;
    selectedGrade: string;
    onGradeChange: (val: string) => void;
    customPrompt: string;
    onPromptChange: (val: string) => void;
    onDifficultyChange: (val: string) => void;
    materialData: { content: string, type: string } | null;
    onMaterialDataChange: (val: { content: string, type: string } | null) => void;
    fileName: string;
    onFileNameChange: (val: string) => void;
    questions: Question[];
    isGenerating: boolean;
    isAppending: boolean;
    onGenerate: (userPrompt: string, material: { content: string, type: string } | null, isAppendMode?: boolean) => void;
    requestedDifficulty: string;
}

const StepRenderer = ({
    currentStep,
    selectedSubject,
    onSubjectChange,
    selectedGrade,
    onGradeChange,
    customPrompt,
    onPromptChange,
    onDifficultyChange,
    materialData,
    onMaterialDataChange,
    fileName,
    onFileNameChange,
    questions,
    isGenerating,
    isAppending,
    onGenerate,
    requestedDifficulty
}: StepRendererProps) => {

    const handleAddQuestions = (config: { type: string; count: number; instruction: string }) => {
        const appendPrompt = `${customPrompt}\n\n[INSTRUKSI WAJIB - MODE TAMBAHAN]:\n1. HANYA BUATKAN TEPAT ${config.count} SOAL BARU (JANGAN LEBIH, JANGAN KURANG).\n2. Tipe soal: ${config.type}.\n3. Abaikan permintaan jumlah soal dari prompt sebelumnya, ikuti instruksi ini: TEPAT ${config.count} SOAL.\n${config.instruction ? `4. Instruksi khusus: ${config.instruction}` : ''}`;
        onGenerate(appendPrompt, materialData, true);
    };

    switch (currentStep) {
        case 1:
            return <SubjectSelector selectedSubject={selectedSubject} onSubjectChange={onSubjectChange} />;
        case 2:
            return <GradeSelector selectedGrade={selectedGrade} onGradeChange={onGradeChange} />;
        case 3:
            return (
                <PromptBuilder
                    customPrompt={customPrompt}
                    onPromptChange={onPromptChange}
                    onDifficultyChange={onDifficultyChange}
                    materialData={materialData}
                    onMaterialDataChange={onMaterialDataChange}
                    fileName={fileName}
                    onFileNameChange={onFileNameChange}
                    selectedSubject={selectedSubject}
                    selectedGrade={selectedGrade}
                />
            );
        case 4:
            return (
                <QuestionDisplay
                    questions={questions}
                    isGenerating={isGenerating}
                    isAppending={isAppending}
                    onRegenerateQuestions={() => onGenerate(customPrompt, materialData)}
                    onAddQuestions={handleAddQuestions}
                    prompt={customPrompt}
                    requestedDifficulty={requestedDifficulty}
                    subject={selectedSubject}
                    grade={selectedGrade}
                />
            );
        default:
            return null;
    }
};

export default StepRenderer;
