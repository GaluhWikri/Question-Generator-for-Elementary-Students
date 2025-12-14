import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface AddQuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (config: { type: string; count: number; instruction: string }) => void;
    isLoading: boolean;
}

const AddQuestionModal = ({ isOpen, onClose, onConfirm, isLoading }: AddQuestionModalProps) => {
    const [addConfig, setAddConfig] = useState({
        type: 'Campuran',
        count: 5,
        instruction: ''
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-800 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Plus className="text-purple-400" />
                    Tambah Soal Baru
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Jenis Soal</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['Campuran', 'Pilihan Ganda', 'Isian', 'Uraian'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setAddConfig({ ...addConfig, type })}
                                    className={`px-3 py-2 rounded-lg text-sm transition-all ${addConfig.type === type
                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                                        : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Jumlah Soal: <span className="text-purple-400 font-bold">{addConfig.count}</span>
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={addConfig.count}
                            onChange={(e) => setAddConfig({ ...addConfig, count: parseInt(e.target.value) })}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>1</span>
                            <span>5</span>
                            <span>10</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Instruksi Khusus (Opsional)</label>
                        <textarea
                            value={addConfig.instruction}
                            onChange={(e) => setAddConfig({ ...addConfig, instruction: e.target.value })}
                            placeholder="Contoh: Fokuskan pada materi pecahan..."
                            className="w-full px-4 py-3 bg-slate-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white text-sm min-h-[80px]"
                        />
                    </div>

                    <button
                        onClick={() => onConfirm(addConfig)}
                        disabled={isLoading}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-purple-900/20 transition-all transform hover:scale-[1.02] mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Menambahkan...' : `Tambahkan ${addConfig.count} Soal`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddQuestionModal;
