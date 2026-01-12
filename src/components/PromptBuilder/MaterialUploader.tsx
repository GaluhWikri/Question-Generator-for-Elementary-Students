import React from 'react';
import { FileText, XCircle, Upload, FileCheck, CloudUpload } from 'lucide-react';

interface MaterialUploaderProps {
    materialData: { content: string, type: string } | null;
    onMaterialDataChange: (data: { content: string, type: string } | null) => void;
    fileName: string;
    onFileNameChange: (name: string) => void;
}

const MaterialUploader: React.FC<MaterialUploaderProps> = ({
    materialData,
    onMaterialDataChange,
    fileName,
    onFileNameChange
}) => {

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('Ukuran file maksimal 5MB. Gunakan file yang lebih kecil.');
            e.target.value = '';
            return;
        }

        onFileNameChange(file.name);
        e.target.value = '';

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64Content = (event.target?.result as string).split(',')[1];
            onMaterialDataChange({
                content: base64Content,
                type: file.type || 'application/octet-stream'
            });
        };

        reader.onerror = () => {
            alert("Gagal membaca file.");
            onMaterialDataChange(null);
            onFileNameChange('');
        };

        reader.readAsDataURL(file);
    };

    const clearMaterial = () => {
        onMaterialDataChange(null);
        onFileNameChange('');
    }

    return (
        <div className="glass-card-sm p-5 md:p-6">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                    <label className="text-white font-semibold text-sm block">Upload Materi Sumber</label>
                    <span className="text-xs text-gray-500">Opsional - AI akan membuat soal berdasarkan materi</span>
                </div>
            </div>

            {materialData && materialData.content.length > 0 ? (
                <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 p-4 rounded-xl flex items-center justify-between animate-fade-in">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                            <FileCheck className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-white text-sm font-medium truncate">{fileName}</p>
                            <p className="text-xs text-gray-400">{materialData.content.length.toLocaleString()} karakter</p>
                        </div>
                    </div>
                    <button
                        onClick={clearMaterial}
                        className="flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-all duration-300 shrink-0"
                    >
                        <XCircle className="w-4 h-4" />
                        <span className="text-sm font-medium hidden sm:inline">Hapus</span>
                    </button>
                </div>
            ) : (
                <label
                    htmlFor="material-upload"
                    className="group block w-full text-center p-6 md:p-8 border-2 border-dashed border-slate-600 hover:border-purple-500/50 rounded-xl cursor-pointer bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-300"
                >
                    <div className="flex flex-col items-center">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                            <CloudUpload className="w-7 h-7 text-purple-400" />
                        </div>
                        <p className="text-white font-medium mb-2">Drop file atau klik untuk upload</p>
                        <p className="text-xs text-gray-400">
                            <span className="text-purple-400">.TXT</span>, <span className="text-cyan-400">.PDF</span>, <span className="text-pink-400">.DOCX</span>
                            <span className="text-gray-500 ml-2">(Max 5MB)</span>
                        </p>
                    </div>
                    <input
                        id="material-upload"
                        type="file"
                        accept=".txt,.pdf,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                </label>
            )}
        </div>
    );
};

export default MaterialUploader;
