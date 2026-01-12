import { ArrowLeft, ArrowRight, RefreshCw, Sparkles, Loader2 } from 'lucide-react';
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
        <div className="relative z-20 shrink-0">
            {/* Gradient Border Top */}
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

            <div className="p-4 md:p-6 bg-slate-900/80 backdrop-blur-xl flex justify-end items-center gap-3 md:gap-4">

                {/* Step Progress Indicator */}
                <div className="hidden sm:flex items-center gap-2 mr-auto">
                    {[1, 2, 3, 4].map((step) => (
                        <div key={step} className="flex items-center">
                            <div className={`
                                w-2 h-2 rounded-full transition-all duration-300
                                ${step === currentStep
                                    ? 'w-8 bg-gradient-to-r from-purple-500 to-cyan-400'
                                    : step < currentStep
                                        ? 'bg-green-500'
                                        : 'bg-slate-600'
                                }
                            `} />
                            {step < 4 && (
                                <div className={`
                                    w-8 h-0.5 transition-colors duration-300
                                    ${step < currentStep ? 'bg-green-500/50' : 'bg-slate-700'}
                                `} />
                            )}
                        </div>
                    ))}
                </div>

                {showBackButton && (
                    <button
                        onClick={onBack}
                        className="group flex items-center gap-2 px-5 md:px-6 py-3 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl font-medium transition-all duration-300 border border-slate-600/50 hover:border-slate-500"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        <span className="hidden sm:inline">Kembali</span>
                    </button>
                )}

                {showNextButton && (
                    <button
                        onClick={onNext}
                        disabled={!canProceed}
                        className={`
                            group relative flex items-center justify-center gap-2 px-6 md:px-8 py-3 rounded-xl font-bold 
                            transition-all duration-300 overflow-hidden
                            ${canProceed
                                ? 'text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02]'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                            }
                        `}
                    >
                        {/* Gradient Background */}
                        {canProceed && (
                            <>
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-500 transition-opacity" />
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </>
                        )}
                        <span className="relative z-10">Lanjutkan</span>
                        <ArrowRight className="relative z-10 w-4 h-4 transition-transform group-hover:translate-x-1" />
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
                        className="group relative flex items-center justify-center gap-2 px-6 md:px-8 py-3 rounded-xl font-bold text-white transition-all duration-300 overflow-hidden shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02]"
                    >
                        {/* Gradient Background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-500 transition-opacity" />
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <RefreshCw className="relative z-10 w-4 h-4 transition-transform group-hover:rotate-180 duration-500" />
                        <span className="relative z-10">Buat Soal Baru</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default ActionBar;
