import { useState } from 'react';
import { Plus, X, Sparkles, Loader2 } from 'lucide-react';

interface AddQuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (config: { type: string; count: number; instruction: string }) => void;
    isLoading: boolean;
}

const questionTypes = [
    { id: 'Campuran', label: 'Campuran', emoji: '🎨' },
    { id: 'Pilihan Ganda', label: 'Pilihan Ganda', emoji: '📝' },
    { id: 'Isian', label: 'Isian', emoji: '✏️' },
    { id: 'Uraian', label: 'Uraian', emoji: '📖' },
];

const AddQuestionModal = ({ isOpen, onClose, onConfirm, isLoading }: AddQuestionModalProps) => {
    const [addConfig, setAddConfig] = useState({
        type: 'Campuran',
        count: 5,
        instruction: ''
    });

    if (!isOpen) return null;

    return (
        <div className="modal-overlay !items-start pt-20 md:pt-28" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-content w-full max-w-lg mx-4 p-6 md:p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/20 flex items-center justify-center">
                            <Plus className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Tambah Soal</h3>
                            <p className="text-xs text-gray-500">Konfigurasi soal tambahan</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-lg bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Question Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">Jenis Soal</label>
                        <div className="grid grid-cols-2 gap-3">
                            {questionTypes.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setAddConfig({ ...addConfig, type: type.id })}
                                    className={`
                                        relative p-3.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2.5
                                        ${addConfig.type === type.id
                                            ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/15 border border-purple-500/40 text-white shadow-lg shadow-purple-500/10'
                                            : 'bg-slate-800/60 border border-slate-600/50 text-gray-400 hover:border-slate-500 hover:text-white'
                                        }
                                    `}
                                >
                                    <span className="text-base">{type.emoji}</span>
                                    <span>{type.label}</span>
                                    {addConfig.type === type.id && (
                                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-400" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Question Count */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-gray-300">Jumlah Soal</label>
                            <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30">
                                <span className="text-white font-bold">{addConfig.count}</span>
                            </div>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={addConfig.count}
                            onChange={(e) => setAddConfig({ ...addConfig, count: parseInt(e.target.value) })}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>1</span>
                            <span>5</span>
                            <span>10</span>
                        </div>
                    </div>

                    {/* Instruction */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                            Instruksi Khusus <span className="text-gray-500 font-normal">(Opsional)</span>
                        </label>
                        <textarea
                            value={addConfig.instruction}
                            onChange={(e) => setAddConfig({ ...addConfig, instruction: e.target.value })}
                            placeholder="Contoh: Fokuskan pada materi pecahan, buat lebih menantang..."
                            className="form-input min-h-[100px] resize-none"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={() => onConfirm(addConfig)}
                        disabled={isLoading}
                        className={`
                            w-full relative flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white transition-all duration-300 overflow-hidden
                            ${isLoading
                                ? 'bg-purple-600/50 cursor-not-allowed'
                                : 'shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02]'
                            }
                        `}
                    >
                        {!isLoading && (
                            <>
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-500" />
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-400 opacity-0 hover:opacity-100 transition-opacity" />
                            </>
                        )}
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Menambahkan Soal...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="relative z-10 w-5 h-5" />
                                <span className="relative z-10">Tambahkan {addConfig.count} Soal</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddQuestionModal;
