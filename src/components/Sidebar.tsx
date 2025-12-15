import { HelpCircle } from 'lucide-react';
import FeedbackButton from './FeedbackButton';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    currentStep: number;
    setCurrentStep: (step: number) => void;
    hasQuestions: boolean;
    onOpenFAQ: () => void;
}

const Sidebar = ({
    isOpen,
    setIsOpen,
    currentStep,
    setCurrentStep,
    hasQuestions,
    onOpenFAQ
}: SidebarProps) => {
    return (
        <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-gray-800 flex flex-col transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:shrink-0 pt-20 md:pt-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
            <div className="p-4 border-b border-gray-800 hidden md:block">
                <div className="flex items-center gap-3">
                    <img src="/icon/icon1.png" alt="Logo" className="w-10 h-10" />
                    <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
                        SOAL GW
                    </span>
                </div>
                <p className="text-xs text-gray-400 mt-2">Buat soal berkualitas untuk anak SD </p>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2 no-scrollbar">
                {[
                    { step: 1, label: 'Mata Pelajaran', icon: 'item-1' },
                    { step: 2, label: 'Pilih Kelas', icon: 'item-2' },
                    { step: 3, label: 'Pengaturan', icon: 'item-3' },
                    { step: 4, label: 'Hasil Soal', icon: 'item-4' },
                ].map((item) => (
                    <button
                        key={item.step}
                        onClick={() => {
                            if (item.step <= currentStep || (hasQuestions && item.step === 4)) {
                                setCurrentStep(item.step);
                                // Only close sidebar on mobile if clicking a link (logic handled by parent usually, but here we invoke setIsOpen)
                                if (window.innerWidth < 768) setIsOpen(false);
                            }
                        }}
                        disabled={item.step > currentStep && !hasQuestions}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200
                ${currentStep === item.step
                                ? 'bg-purple-600/10 text-purple-400 border border-purple-600/20'
                                : item.step < currentStep || (hasQuestions && item.step === 4)
                                    ? 'text-green-400 hover:bg-slate-800'
                                    : 'text-gray-500 cursor-not-allowed'
                            }
              `}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-colors
                ${currentStep === item.step
                                ? 'border-purple-500 bg-purple-500 text-white shadow-[0_0_10px_purple]'
                                : item.step < currentStep || (hasQuestions && item.step === 4)
                                    ? 'border-green-500 bg-green-500/20 text-green-400'
                                    : 'border-slate-700 bg-slate-800 text-slate-500'
                            }
              `}>
                            {item.step < currentStep && item.step !== 4 ? '✓' : item.step}
                        </div>
                        <span className="font-medium">{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* FEEDBACK BUTTON IN SIDEBAR */}
            <div className="px-3 pb-2 shrink-0 space-y-3">
                <button
                    onClick={() => { onOpenFAQ(); setIsOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-xl border border-blue-500/30 transition-all duration-300 group"
                >
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <HelpCircle className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm">FAQ & Bantuan</span>
                </button>

                <FeedbackButton />
            </div>

            <div className="p-6 border-t border-gray-800 shrink-0">
                <div className="space-y-1 opacity-50 hover:opacity-100 transition-opacity duration-300">
                    <p className="text-xs text-gray-400">Developed by</p>
                    <p className="text-xs font-semibold text-gray-300">Galuh Wikri Ramadhan</p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
