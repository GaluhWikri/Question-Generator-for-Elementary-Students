import { useState } from 'react';
import { Question } from '@/types/Question';

interface GeneratorParams {
    subject: string;
    grade: string;
    userPrompt: string;
    materialData: { content: string, type: string } | null;
    isAppendMode?: boolean;
}

export const useQuestionGenerator = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isAppending, setIsAppending] = useState(false);

    const generateQuestions = async ({
        subject,
        grade,
        userPrompt,
        materialData,
        isAppendMode = false
    }: GeneratorParams): Promise<boolean> => {

        // Prevent double submission
        if (isGenerating || isAppending) return false;

        if (isAppendMode) {
            setIsAppending(true);
        } else {
            setIsGenerating(true);
            setQuestions([]);
        }

        try {
            const response = await fetch('/api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject,
                    grade,
                    userPrompt,
                    materialData
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                let friendlyErrorMessage = data?.error?.message || 'Terjadi error yang tidak diketahui.';
                if (String(friendlyErrorMessage).toLowerCase().includes('service unavailable')) {
                    friendlyErrorMessage = "Layanan AI sedang sibuk atau tidak tersedia. Silakan coba lagi dalam beberapa saat.";
                }
                if (friendlyErrorMessage.includes('Gagal memproses file')) {
                    throw new Error(friendlyErrorMessage);
                }
                throw new Error(friendlyErrorMessage);
            }

            if (data.questions && Array.isArray(data.questions)) {
                if (isAppendMode) {
                    setQuestions(prev => [...prev, ...data.questions]);
                } else {
                    setQuestions(data.questions);
                }
                return true; // Success signal
            } else {
                throw new Error("Format respons dari server tidak valid.");
            }

        } catch (error) {
            console.error('Error generating questions:', error);
            if (error instanceof Error) {
                alert(`Gagal membuat soal: ${error.message}`);
            } else {
                alert("Gagal membuat soal karena error tak terduga.");
            }
            return false; // Failure signal
        } finally {
            setIsGenerating(false);
            setIsAppending(false);
        }
    };

    const clearQuestions = () => setQuestions([]);

    return {
        questions,
        isGenerating,
        isAppending,
        generateQuestions,
        clearQuestions,
        setQuestions
    };
};
