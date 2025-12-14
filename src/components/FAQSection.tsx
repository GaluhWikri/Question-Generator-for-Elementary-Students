import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, X } from 'lucide-react';

interface FAQModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const faqs = [
    {
        question: "Bagaimana cara menghasilkan soal dengan gambar?",
        answer: "Secara default, AI membuat soal teks agar cepat. Jika Anda ingin soal bergambar, TULIS kata kunci seperti \"sertakan gambar\", \"dengan ilustrasi\", atau \"tambahkan visual\" pada kolom 'Topik Khusus'. AI akan menggambar ilustrasi yang relevan untuk setiap soal."
    },
    {
        question: "Apakah saya bisa menggunakan materi pelajaran sendiri?",
        answer: "Tentu! Anda bisa mengunggah file materi berupa PDF, Word (.docx), atau Teks (.txt) di bagian 'Upload Materi Sumber'. AI akan otomatis membaca materi tersebut dan membuat soal ujian yang SANGAT RELEVAN dengan isi materi Anda."
    },
    {
        question: "Bagaimana cara menyimpan soal ke PDF?",
        answer: "Setelah soal berhasil dibuat oleh AI, tombol \"Unduh PDF\" berwarna hijau akan muncul di atas daftar soal. Klik tombol tersebut untuk mengunduh dokumen soal lengkap dengan kunci jawabannya."
    },
    {
        question: "Apakah kunci jawaban sudah pasti benar?",
        answer: "AI kami sangat canggih, namun tetaplah mesin. Kami menyarankan guru/orang tua untuk selalu memeriksa kembali kunci jawaban. Anda bisa mengaktifkan mode 'Lihat Jawaban' (tombol mata) untuk memverifikasi kebenarannya sebelum dicetak."
    },
    {
        question: "Berapa banyak soal yang bisa dibuat sekaligus?",
        answer: "Anda bisa membuat hingga 20 soal dalam sekali generate. Jika butuh lebih, Anda bisa menggunakan tombol 'Tambah Soal' setelah proses pertama selesai untuk menambahkan soal baru ke dalam daftar yang sama."
    }
];

const FAQModal = ({ isOpen, onClose }: FAQModalProps) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-800 border border-gray-700 rounded-2xl w-full max-w-2xl shadow-2xl p-6 relative animate-in zoom-in duration-200 max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 border-b border-gray-700/50 pb-4">
                    <div className="flex items-center gap-2">
                        <HelpCircle className="w-6 h-6 text-purple-400" />
                        <h2 className="text-xl md:text-2xl font-bold text-white">Bantuan & FAQ</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-gray-800/40 border border-gray-700/50 rounded-xl overflow-hidden transition-all duration-300 hover:border-purple-500/30 shrink-0"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                            >
                                <span className="font-semibold text-gray-200">{faq.question}</span>
                                {openIndex === index ? (
                                    <ChevronUp className="w-5 h-5 text-purple-400" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                )}
                            </button>

                            <div
                                className={`transition-all duration-300 ease-in-out px-6 ${openIndex === index ? 'max-h-96 py-4 opacity-100' : 'max-h-0 py-0 opacity-0'
                                    }`}
                            >
                                <p className="text-gray-400 text-sm leading-relaxed border-t border-gray-700/50 pt-4">
                                    {faq.answer}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FAQModal;
