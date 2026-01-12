import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, X, Sparkles } from 'lucide-react';

interface FAQModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const faqs = [
    {
        question: "Bagaimana cara menghasilkan soal dengan gambar?",
        answer: "Secara default, AI membuat soal teks agar cepat. Jika Anda ingin soal bergambar, TULIS kata kunci seperti \"sertakan gambar\", \"dengan ilustrasi\", atau \"tambahkan visual\" pada kolom 'Topik Khusus'. AI akan menggambar ilustrasi yang relevan untuk setiap soal.",
        icon: "🖼️"
    },
    {
        question: "Apakah saya bisa menggunakan materi pelajaran sendiri?",
        answer: "Tentu! Anda bisa mengunggah file materi berupa PDF, Word (.docx), atau Teks (.txt) di bagian 'Upload Materi Sumber'. AI akan otomatis membaca materi tersebut dan membuat soal ujian yang SANGAT RELEVAN dengan isi materi Anda.",
        icon: "📚"
    },
    {
        question: "Bagaimana cara menyimpan soal ke PDF?",
        answer: "Setelah soal berhasil dibuat oleh AI, tombol \"Unduh PDF\" berwarna hijau akan muncul di atas daftar soal. Klik tombol tersebut untuk mengunduh dokumen soal lengkap dengan kunci jawabannya.",
        icon: "📄"
    },
    {
        question: "Apakah kunci jawaban sudah pasti benar?",
        answer: "AI kami sangat canggih, namun tetaplah mesin. Kami menyarankan guru/orang tua untuk selalu memeriksa kembali kunci jawaban. Anda bisa mengaktifkan mode 'Lihat Jawaban' (tombol mata) untuk memverifikasi kebenarannya sebelum dicetak.",
        icon: "✅"
    },
    {
        question: "Berapa banyak soal yang bisa dibuat sekaligus?",
        answer: "Anda bisa membuat hingga 20 soal dalam sekali generate. Jika butuh lebih, Anda bisa menggunakan tombol 'Tambah Soal' setelah proses pertama selesai untuk menambahkan soal baru ke dalam daftar yang sama.",
        icon: "📊"
    }
];

const FAQModal = ({ isOpen, onClose }: FAQModalProps) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    if (!isOpen) return null;

    return (
        <div
            className="modal-overlay"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="modal-content w-full max-w-2xl mx-4">
                {/* Header */}
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/20 flex items-center justify-center">
                                <HelpCircle className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-white">FAQ & Bantuan</h2>
                                <p className="text-sm text-gray-500">Pertanyaan yang sering diajukan</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 space-y-3 overflow-y-auto max-h-[60vh] custom-scrollbar">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`
                                rounded-xl overflow-hidden transition-all duration-300 border
                                ${openIndex === index
                                    ? 'bg-gradient-to-r from-purple-500/10 to-cyan-500/5 border-purple-500/30'
                                    : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600'
                                }
                            `}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full px-5 py-4 flex items-center gap-4 text-left focus:outline-none group"
                            >
                                <span className="text-2xl shrink-0">{faq.icon}</span>
                                <span className={`flex-1 font-medium text-sm md:text-base transition-colors ${openIndex === index ? 'text-white' : 'text-gray-300 group-hover:text-white'
                                    }`}>
                                    {faq.question}
                                </span>
                                <div className={`
                                    w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0
                                    ${openIndex === index
                                        ? 'bg-purple-500/20 text-purple-400 rotate-180'
                                        : 'bg-slate-700/50 text-gray-500'
                                    }
                                `}>
                                    <ChevronDown className="w-4 h-4 transition-transform" />
                                </div>
                            </button>

                            <div
                                className={`
                                    transition-all duration-300 ease-in-out overflow-hidden
                                    ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                                `}
                            >
                                <div className="px-5 pb-5 pt-0">
                                    <div className="pl-10 border-l-2 border-purple-500/30">
                                        <p className="text-gray-400 text-sm leading-relaxed pl-4">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-cyan-500/5 border border-purple-500/20">
                        <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
                        <p className="text-sm text-gray-300">
                            Masih punya pertanyaan? Hubungi kami melalui tombol <span className="text-purple-400 font-medium">Tanggapan</span> di sidebar.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQModal;
