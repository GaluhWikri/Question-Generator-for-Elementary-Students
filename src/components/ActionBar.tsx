import QuestionGenerator from '@/components/QuestionGenerator';

interface ActionBarProps {
    currentStep: number;
    onBack: () => void;
    onNext: () => void;
    canProceed: boolean;
    onReset: () => void;
    onGenerate: () => void;
    isGenerating: boolean;
    prompt: string;
}

const ActionBar = ({
    currentStep,
    onBack,
    onNext,
    canProceed,
    onReset,
    onGenerate,
    isGenerating,
    prompt
}: ActionBarProps) => {

    // Tombol Kembali muncul di Step 2 dan 3 (antara step 1 dan 4)
    const showBackButton = currentStep > 1 && currentStep < 4;

    // Tombol Lanjut muncul di Step 1 dan 2 (sebelum Step 3)
    const showNextButton = currentStep < 3;

    // Tombol Generate muncul di Step 3
    const showGenerateButton = currentStep === 3;

    // Tombol Buat Soal Baru muncul di Step 4
    const showResetButton = currentStep === 4;

    return (
        <div className="p-4 md:p-6 bg-slate-900/80 backdrop-blur-md border-t border-gray-800 shrink-0 relative z-20 flex justify-end gap-3 md:gap-4">
            {showBackButton && (
                <button
                    onClick={onBack}
                    className="px-4 md:px-6 py-2 md:py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors border border-slate-700 text-sm md:text-base"
                >
                    Kembali
                </button>
            )}

            {showNextButton && (
                <button
                    onClick={onNext}
                    disabled={!canProceed}
                    className={`px-6 md:px-8 py-2 md:py-3 rounded-xl font-bold shadow-lg transition-all transform hover:scale-105 text-sm md:text-base ${canProceed
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-purple-500/25'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        }`}
                >
                    Lanjutkan
                </button>
            )}

            {showGenerateButton && (
                <div className="w-full max-w-xs">
                    <QuestionGenerator
                        onGenerateQuestions={onGenerate}
                        isGenerating={isGenerating}
                        disabled={!canProceed}
                        prompt={prompt}
                    />
                </div>
            )}

            {showResetButton && (
                <button
                    onClick={onReset}
                    className="px-6 md:px-8 py-2 md:py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-green-900/20 transition-all transform hover:scale-105 text-sm md:text-base"
                >
                    Buat Soal Baru
                </button>
            )}
        </div>
    );
};

export default ActionBar;
