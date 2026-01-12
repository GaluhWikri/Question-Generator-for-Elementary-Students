import { HelpCircle, Check, Sparkles, Home } from 'lucide-react';
import FeedbackButton from './FeedbackButton';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    currentStep: number;
    setCurrentStep: (step: number) => void;
    hasQuestions: boolean;
    onOpenFAQ: () => void;
    onGoHome?: () => void;
}

const Sidebar = ({
    isOpen,
    setIsOpen,
    currentStep,
    setCurrentStep,
    hasQuestions,
    onOpenFAQ,
    onGoHome
}: SidebarProps) => {
    return (
        <aside className={`
            fixed inset-y-0 left-0 z-40 w-72 flex flex-col transition-all duration-500 ease-out
            md:translate-x-0 md:static md:shrink-0 pt-20 md:pt-0
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
            {/* Sidebar Background with Glass Effect */}
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-2xl border-r border-white/5 md:block hidden" />
            <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-2xl border-r border-white/5 md:hidden block" />

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full">

                {/* Logo Section - Clickable to go back to landing */}
                <button
                    onClick={onGoHome}
                    className="p-6 border-b border-white/5 hidden md:block text-left hover:bg-white/5 transition-colors duration-300 group"
                >
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <img src="/icon/icon1.png" alt="Logo" className="w-12 h-12 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-purple-500/40 blur-xl rounded-full scale-150" />
                        </div>
                        <div className="flex-1">
                            <span className="text-xl font-bold gradient-text block">
                                Soal.gw
                            </span>
                            <p className="text-xs text-gray-500 mt-0.5 group-hover:text-purple-400 transition-colors">Kembali ke Beranda</p>
                        </div>
                        <Home className="w-4 h-4 text-gray-600 group-hover:text-purple-400 transition-colors opacity-0 group-hover:opacity-100" />
                    </div>
                </button>

                {/* Navigation Steps */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 no-scrollbar">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
                        Langkah Pembuatan
                    </p>

                    {[
                        { step: 1, label: 'Mata Pelajaran', desc: 'Pilih subjek' },
                        { step: 2, label: 'Pilih Kelas', desc: 'Tingkat kesulitan' },
                        { step: 3, label: 'Pengaturan', desc: 'Kustomisasi soal' },
                        { step: 4, label: 'Hasil Soal', desc: 'Lihat & unduh' },
                    ].map((item, index) => {
                        const isActive = currentStep === item.step;
                        const isCompleted = item.step < currentStep || (hasQuestions && item.step === 4 && currentStep !== 4);
                        const isAccessible = item.step <= currentStep || (hasQuestions && item.step === 4);

                        return (
                            <button
                                key={item.step}
                                onClick={() => {
                                    if (isAccessible) {
                                        setCurrentStep(item.step);
                                        if (window.innerWidth < 768) setIsOpen(false);
                                    }
                                }}
                                disabled={!isAccessible}
                                className={`
                                    w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left transition-all duration-300
                                    ${isActive
                                        ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/10 border border-purple-500/30'
                                        : isAccessible
                                            ? 'hover:bg-white/5'
                                            : 'opacity-40 cursor-not-allowed'
                                    }
                                `}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {/* Step Indicator */}
                                <div className={`
                                    step-indicator shrink-0
                                    ${isActive ? 'active' : isCompleted ? 'completed' : 'pending'}
                                `}>
                                    {isCompleted && item.step !== 4 ? (
                                        <Check className="w-4 h-4" />
                                    ) : (
                                        <span>{item.step}</span>
                                    )}
                                </div>

                                {/* Step Info */}
                                <div className="flex-1 min-w-0">
                                    <span className={`
                                        font-semibold text-sm block truncate
                                        ${isActive ? 'text-purple-300' : isCompleted ? 'text-green-400' : 'text-gray-400'}
                                    `}>
                                        {item.label}
                                    </span>
                                    <span className="text-xs text-gray-500 truncate block">
                                        {item.desc}
                                    </span>
                                </div>

                                {/* Active Indicator */}
                                {isActive && (
                                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shrink-0" />
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 space-y-3 border-t border-white/5">
                    <button
                        onClick={() => { onOpenFAQ(); setIsOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 text-blue-300 rounded-xl border border-blue-500/20 transition-all duration-300 group"
                    >
                        <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <HelpCircle className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                            <span className="font-medium text-sm block">FAQ & Bantuan</span>
                            <span className="text-xs text-blue-400/60">Punya pertanyaan?</span>
                        </div>
                    </button>

                    <FeedbackButton />
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-white/5">
                    <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity duration-300">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Developed by</p>
                            <p className="text-xs font-semibold text-gray-300">Galuh Wikri Ramadhan</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
