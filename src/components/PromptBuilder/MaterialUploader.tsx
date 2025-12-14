import React from 'react';
import { FileText, XCircle } from 'lucide-react';

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
            // Ambil bagian Base64 saja dari Data URL
            const base64Content = (event.target?.result as string).split(',')[1];

            // Simpan Base64 content dan file type untuk dikirim ke backend
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

        // Baca semua file (TXT, PDF, DOCX) sebagai Data URL (Base64)
        reader.readAsDataURL(file);
    };

    const clearMaterial = () => {
        onMaterialDataChange(null);
        onFileNameChange('');
    }

    return (
        <div className="md:col-span-2 bg-gray-700/50 rounded-2xl p-4 md:p-6 mt-4 md:mt-6">
            <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 md:w-6 md:h-6 text-indigo-400" />
                <label className="text-white font-semibold text-sm md:text-base">Upload Materi Sumber (Opsional)</label>
            </div>

            {materialData && materialData.content.length > 0 ? (
                <div className="bg-gray-600 border border-indigo-500 p-3 rounded-lg flex items-center justify-between">
                    {/* Menampilkan informasi file/teks yang sudah di-load */}
                    <span className="text-white text-xs md:text-sm truncate max-w-[200px] md:max-w-md">{fileName || ''} ({materialData.content.length} karakter)</span>
                    <button onClick={clearMaterial} className="text-red-400 hover:text-red-500 flex items-center gap-1 text-sm">
                        <XCircle className="w-4 h-4 md:w-5 md:h-5" />
                        Hapus
                    </button>
                </div>
            ) : (
                <>
                    <label htmlFor="material-upload" className="block w-full text-center p-4 border-2 border-dashed border-indigo-500 rounded-lg cursor-pointer hover:bg-gray-600/50 transition-colors">
                        <p className="text-indigo-400 font-medium text-sm md:text-base">Klik untuk upload file</p>
                        <p className="text-xs text-gray-400 mt-1">Dukungan: .TXT, .PDF, .DOCX (Max 5MB)</p>
                        <input
                            id="material-upload"
                            type="file"
                            accept=".txt,.pdf,.docx"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </label>
                </>
            )}
        </div>
    );
};

export default MaterialUploader;
