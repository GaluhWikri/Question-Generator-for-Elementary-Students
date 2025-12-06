# 🧠 AI Question Generator untuk Siswa SD (Sekolah Dasar)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tech Stack: React | Gemini AI | Node.js](https://img.shields.io/badge/Tech%20Stack-React%20%7C%20Gemini%20AI%20%7C%20Node.js-informational)](https://github.com/google/gemini-2.5-pro)

Selamat datang di **AI Question Generator**, sebuah alat berbasis web yang memanfaatkan kekuatan Model Bahasa Besar (LLM) dari Google Gemini untuk secara otomatis membuat soal-soal latihan yang relevan dengan kurikulum Sekolah Dasar (SD) di Indonesia.
https://question-generator-for-elementary-s.vercel.app/

## ✨ Fitur Utama

* **Pembuatan Soal Cerdas:** Menghasilkan soal-soal dalam Bahasa Indonesia yang disesuaikan untuk berbagai tingkat kelas (Kelas 1-6) dan mata pelajaran (Matematika, IPA, Bahasa Indonesia, dll.).
* **Kustomisasi Mendalam:** Kontrol jumlah soal, tingkat kesulitan (**Mudah, Sedang, Sulit, Campur**), dan jenis soal (Pilihan Ganda atau Isian).
* **Antarmuka Bertahap:** Alur kerja yang intuitif dalam 4 langkah: Pilih Mata Pelajaran, Pilih Kelas, Atur Prompt, dan Lihat Hasil.
* **Export Praktis:** Soal yang telah dihasilkan dapat diunduh langsung dalam format PDF, lengkap dengan kunci jawaban, siap untuk dicetak.

## 💻 Tumpukan Teknologi (Tech Stack)

Aplikasi ini dibangun dengan fokus pada modernitas, kecepatan, dan performa:

* **Frontend:** `React` & `TypeScript` dengan `Vite` untuk performa *bundling* yang cepat.
* **Backend (API):** `Node.js` & `Express.js` untuk menghandle *request* ke API AI.
* **Generative AI:** Menggunakan **Google Gemini 2.5 PRO** untuk memastikan hasil soal yang berkualitas dan dalam format JSON yang terstruktur.
* **Styling:** `Tailwind CSS` untuk desain yang cepat dan menarik.

## 🚀 Instalasi dan Menjalankan Proyek (Lokal)

Ikuti panduan di bawah ini untuk menjalankan aplikasi di mesin lokal Anda.

### Prasyarat

* [Node.js](https://nodejs.org/) (Disarankan versi 18+)
* Kunci API Google Gemini (dapat diperoleh dari Google AI Studio)

### Langkah-Langkah

1.  **Klon Repositori:**
    ```bash
    git clone <URL_REPOSitori_ANDA>
    cd <NAMA_FOLDER_PROYEK>
    ```

2.  **Instal Dependensi:**
    ```bash
    npm install
    ```

3.  **Konfigurasi Lingkungan:**
    Buat file bernama `.env` di *root* proyek dan tambahkan Kunci API Gemini Anda:
    ```env
    GEMINI_API_KEY="PASTE_KUNCI_API_GEMINI_ANDA_DI_SINI"
    # URL Backend untuk Frontend (default: http://localhost:8080)
    VITE_API_BASE_URL="http://localhost:8080" 
    ```

4.  **Jalankan Server Backend:**
    Buka terminal pertama dan jalankan server Node.js:
    ```bash
    npm start
    # Server akan berjalan di http://localhost:8080
    ```

5.  **Jalankan Frontend (Aplikasi Web):**
    Buka terminal kedua dan jalankan aplikasi Vite:
    ```bash
    npm run dev
    # Aplikasi akan terbuka di browser (biasanya http://localhost:5173)
    ```

## 🛠️ Struktur Proyek
