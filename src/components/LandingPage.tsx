'use client';

import { useState } from 'react';
import {
    Sparkles,
    Zap,
    FileText,
    Download,
    CheckCircle,
    ArrowRight,
    BookOpen,
    GraduationCap,
    Brain,
    Clock,
    Shield,
    Star,
    ChevronDown,
    ChevronUp,
    Users,
    Award
} from 'lucide-react';

interface LandingPageProps {
    onStartApp: () => void;
}

const features = [
    {
        icon: Brain,
        title: 'AI Canggih',
        description: 'Menggunakan teknologi AI terbaru untuk menghasilkan soal berkualitas tinggi sesuai kurikulum SD.',
        gradient: 'from-purple-500 to-violet-400'
    },
    {
        icon: BookOpen,
        title: '8 Mata Pelajaran',
        description: 'Dukungan lengkap untuk Matematika, Bahasa Indonesia, IPA, IPS, dan mata pelajaran lainnya.',
        gradient: 'from-blue-500 to-cyan-400'
    },
    {
        icon: Zap,
        title: 'Instan & Cepat',
        description: 'Buat hingga 20 soal dalam hitungan detik. Hemat waktu Anda dalam menyiapkan ujian.',
        gradient: 'from-yellow-500 to-orange-400'
    },
    {
        icon: Download,
        title: 'Export PDF',
        description: 'Unduh soal dalam format PDF yang rapi, lengkap dengan kunci jawaban.',
        gradient: 'from-green-500 to-emerald-400'
    },
    {
        icon: FileText,
        title: 'Upload Materi',
        description: 'Upload materi pelajaran Anda sendiri dan AI akan membuat soal berdasarkan materi tersebut.',
        gradient: 'from-pink-500 to-rose-400'
    },
    {
        icon: GraduationCap,
        title: 'Kelas 1-6 SD',
        description: 'Tingkat kesulitan otomatis disesuaikan dengan level kognitif setiap kelas.',
        gradient: 'from-indigo-500 to-purple-400'
    }
];

const steps = [
    {
        number: '01',
        title: 'Pilih Mata Pelajaran',
        description: 'Pilih dari 8 mata pelajaran yang tersedia sesuai kebutuhan Anda.'
    },
    {
        number: '02',
        title: 'Tentukan Kelas',
        description: 'Pilih tingkat kelas untuk menyesuaikan kompleksitas soal.'
    },
    {
        number: '03',
        title: 'Konfigurasi Soal',
        description: 'Atur jumlah, tipe, dan tingkat kesulitan soal sesuai keinginan.'
    },
    {
        number: '04',
        title: 'Generate & Download',
        description: 'AI akan membuat soal dalam hitungan detik. Unduh dalam format PDF!'
    }
];

const faqs = [
    {
        question: 'Apakah soal yang dihasilkan sesuai kurikulum?',
        answer: 'Ya, AI kami dilatih dengan materi sesuai kurikulum SD terbaru sehingga soal yang dihasilkan relevan dan sesuai standar pendidikan.'
    },
    {
        question: 'Berapa banyak soal yang bisa dibuat sekaligus?',
        answer: 'Anda bisa membuat hingga 20 soal dalam sekali generate. Jika butuh lebih, gunakan fitur "Tambah Soal" untuk menambahkan soal baru.'
    },
    {
        question: 'Apakah saya bisa menggunakan materi sendiri?',
        answer: 'Tentu! Upload file materi (PDF, DOCX, TXT) dan AI akan membuat soal berdasarkan materi tersebut.'
    },
    {
        question: 'Bagaimana cara mengunduh soal?',
        answer: 'Setelah soal dibuat, klik tombol "Unduh PDF" untuk mengunduh dokumen soal lengkap dengan kunci jawaban.'
    }
];

const stats = [
    { value: '10K+', label: 'Soal Dibuat' },
    { value: '500+', label: 'Guru Aktif' },
    { value: '8', label: 'Mata Pelajaran' },
    { value: '99%', label: 'Kepuasan' }
];

export default function LandingPage({ onStartApp }: LandingPageProps) {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <div className="min-h-screen relative overflow-x-hidden">
            {/* Animated Background */}
            <div className="animated-bg" />

            {/* Decorative Elements */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[10%] left-[5%] w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute top-[60%] right-[10%] w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-[20%] left-[30%] w-64 h-64 bg-pink-500/10 rounded-full blur-3xl" />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <img src="/icon/icon1.png" alt="Logo" className="w-10 h-10 relative z-10" />
                                <div className="absolute inset-0 bg-purple-500/30 blur-lg rounded-full" />
                            </div>
                            <span className="text-xl font-bold gradient-text">Soal.gw</span>
                        </div>
                        <button
                            onClick={onStartApp}
                            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
                        >
                            Mulai Gratis
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm font-medium mb-8 animate-fade-in-up">
                        <Sparkles className="w-4 h-4" />
                        <span>Powered by Advanced AI</span>
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in-up">
                        Buat Soal Ujian SD
                        <br />
                        <span className="gradient-text">dalam Hitungan Detik</span>
                    </h1>

                    {/* Subheading */}
                    <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 animate-fade-in-up delay-100">
                        Generator soal AI canggih untuk guru SD. Hemat waktu Anda dalam menyiapkan soal ujian berkualitas tinggi sesuai kurikulum.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-200">
                        <button
                            onClick={onStartApp}
                            className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 flex items-center gap-2"
                        >
                            <Sparkles className="w-5 h-5" />
                            <span>Mulai Buat Soal</span>
                            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </button>
                        <a
                            href="#features"
                            className="px-8 py-4 bg-slate-800/60 text-white font-semibold rounded-2xl border border-slate-600/50 hover:bg-slate-800 hover:border-slate-500 transition-all duration-300"
                        >
                            Lihat Fitur
                        </a>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 animate-fade-in-up delay-300">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">{stat.value}</div>
                                <div className="text-sm text-gray-400">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-300 text-sm font-medium mb-4">
                            <Zap className="w-4 h-4" />
                            <span>Fitur Unggulan</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                            Semua yang Anda <span className="gradient-text">Butuhkan</span>
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Fitur lengkap untuk membantu guru membuat soal ujian berkualitas dengan cepat dan mudah.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={index}
                                    className="glass-card p-6 md:p-8 group hover:border-purple-500/30 transition-all duration-500"
                                >
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} p-0.5 mb-5`}>
                                        <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center">
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-300 text-sm font-medium mb-4">
                            <CheckCircle className="w-4 h-4" />
                            <span>Cara Kerja</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                            4 Langkah <span className="gradient-text">Mudah</span>
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Proses pembuatan soal yang simpel dan cepat. Tidak perlu keahlian teknis khusus.
                        </p>
                    </div>

                    {/* Steps */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className="glass-card p-6 md:p-8 flex items-start gap-5 group hover:border-purple-500/30 transition-all duration-500"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/20 flex items-center justify-center shrink-0">
                                    <span className="text-2xl font-bold gradient-text">{step.number}</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                                    <p className="text-gray-400">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Subjects Preview */}
            <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="glass-card p-8 md:p-12">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                                8 Mata Pelajaran Tersedia
                            </h2>
                            <p className="text-gray-400">Dukungan lengkap untuk semua mata pelajaran di SD</p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { name: 'Matematika', emoji: '📐' },
                                { name: 'Bahasa Indonesia', emoji: '📖' },
                                { name: 'Bahasa Inggris', emoji: '🔤' },
                                { name: 'IPA', emoji: '🔬' },
                                { name: 'IPS', emoji: '🌍' },
                                { name: 'PJOK', emoji: '⚽' },
                                { name: 'Seni Budaya', emoji: '🎨' },
                                { name: 'Pancasila', emoji: '🇮🇩' }
                            ].map((subject, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center hover:border-purple-500/30 hover:bg-slate-800 transition-all duration-300"
                                >
                                    <span className="text-2xl mb-2 block">{subject.emoji}</span>
                                    <span className="text-sm text-gray-300 font-medium">{subject.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    {/* Section Header */}
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Pertanyaan <span className="gradient-text">Umum</span>
                        </h2>
                        <p className="text-gray-400">Jawaban untuk pertanyaan yang sering diajukan</p>
                    </div>

                    {/* FAQ Items */}
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className={`glass-card overflow-hidden transition-all duration-300 ${openFaq === index ? 'border-purple-500/30' : ''
                                    }`}
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="w-full p-5 flex items-center justify-between text-left"
                                >
                                    <span className="font-semibold text-white pr-4">{faq.question}</span>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${openFaq === index ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700/50 text-gray-500'
                                        }`}>
                                        {openFaq === index ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </div>
                                </button>
                                <div className={`transition-all duration-300 overflow-hidden ${openFaq === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                                    }`}>
                                    <div className="px-5 pb-5">
                                        <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="glass-card p-8 md:p-12 text-center relative overflow-hidden">
                        {/* Background Glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10" />

                        <div className="relative z-10">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/20 flex items-center justify-center mx-auto mb-6">
                                <Sparkles className="w-10 h-10 text-purple-400" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Siap Membuat Soal?
                            </h2>
                            <p className="text-gray-400 max-w-lg mx-auto mb-8">
                                Bergabung dengan ratusan guru yang sudah menggunakan Soal.gw untuk membuat soal ujian berkualitas.
                            </p>
                            <button
                                onClick={onStartApp}
                                className="group px-10 py-4 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 inline-flex items-center gap-2"
                            >
                                <span>Mulai Sekarang - Gratis!</span>
                                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 py-10 px-4 sm:px-6 lg:px-8 border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <img src="/icon/icon1.png" alt="Logo" className="w-8 h-8" />
                            <span className="font-bold text-white">Soal.gw</span>
                        </div>
                        <p className="text-sm text-gray-500">
                            © 2026 Soal.gw by Galuh Wikri Ramadhan. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
