// server.mjs

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

const app = express();
const port = process.env.PORT || 8080; 

// --- PERBAIKAN CORS KRITIS UNTUK PREFLIGHT OPTIONS ---
app.use(cors({
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204
}));
app.use(express.json());
app.options('/api/generate', cors()); 
// --- Akhir Perbaikan CORS ---


app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Backend Server is running!', version: '20.0-gemini-migration-prompt-update' });
});

// Fungsi pembersih JSON yang sudah ada
function parseDirtyJson(dirtyJson) {
  const match = dirtyJson.match(/```json\s*([\s\S]*?)\s*```/);
  let jsonString = dirtyJson;
  if (match && match[1]) {
    jsonString = match[1];
  }
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    let cleanedString = jsonString.replace(/,\s*([\]}])/g, '$1');
    try {
        return JSON.parse(cleanedString);
    } catch (finalError) {
        throw new Error("AI mengembalikan format JSON yang tidak bisa diperbaiki.");
    }
  }
}


app.post('/api/generate', async (request, response) => {
  const { prompt } = request.body;
  if (!prompt) {
    return response.status(400).json({ error: { message: 'Prompt tidak boleh kosong.' } });
  }

  // Cari GEMINI_API_KEY
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

  if (!GEMINI_API_KEY) {
    return response.status(500).json({ error: { message: 'Konfigurasi Gemini API di server belum diatur. Mohon atur GEMINI_API_KEY.' } });
  }

  // --- PROMPT FINAL DENGAN LOGIKA BERLAPIS DAN VERIFIKASI DIRI ---
  // Menggunakan prompt yang diminta pengguna dengan penyesuaian untuk Gemini
  const system_prompt = `Anda adalah seorang GURU SD AHLI dari Indonesia yang sangat teliti, presisi, dan anti-salah. Misi utama Anda adalah menghasilkan soal berkualitas tinggi dalam format JSON yang 100% valid dan akurat untuk semua mata pelajaran (Matematika, Bahasa Indonesia, IPA, IPS, Seni Budaya, PJOK).

  ### PROSES BERPIKIR WAJIB (Ikuti langkah demi langkah tanpa kecuali):
  1.  **ANALISIS PERMINTAAN:** Pahami permintaan pengguna secara mendalam: Mata Pelajaran, Topik, Kelas, Tingkat Kesulitan, Jumlah Soal, dan Jenis Soal.
  
  2.  **PEMBUATAN KONTEN INTERNAL:**
      -   Buat draf pertanyaan dalam Bahasa Indonesia yang **SESUAI** dengan semua parameter dari Langkah 1.
      -   **Jika soal MATEMATIKA, HITUNG jawabannya dengan cermat. Tuliskan perhitunganmu dalam pikiranmu.** Contoh: "Permintaan adalah akar dari 144. Aku tahu 12 * 12 = 144. Jawabannya PASTI 12."
      -   Untuk mata pelajaran lain (IPA, IPS, dll.), pastikan faktanya akurat dan relevan dengan kurikulum SD di Indonesia.
      -   Tentukan jawaban yang benar (\`correctAnswer\`).
      -   Buat 3 pilihan jawaban pengecoh yang relevan, masuk akal, tetapi salah.
  
  3.  **VERIFIKASI DIRI & KOREKSI (Langkah Wajib Kedua):**
      -   Periksa kembali konten yang baru saja Anda buat. Apakah jawaban matematisnya sudah 100% akurat? Apakah faktanya benar? Apakah tingkat kesulitannya sesuai? Jika ada kesalahan, **PERBAIKI SEKARANG**.
  
  4.  **PENYUSUNAN & VERIFIKASI JSON FINAL:**
      -   Susun konten yang sudah terverifikasi ke dalam format JSON.
      -   Periksa kembali JSON tersebut. Apakah sudah 100% valid? Apakah tidak ada teks tambahan di luar JSON? Apakah kunci utamanya adalah "questions"?
      -   Kirimkan HANYA JSON yang sudah lolos semua verifikasi.

  ### ATURAN OUTPUT FINAL:
  -   Output HARUS HANYA berupa satu objek JSON yang valid.
  -   **JANGAN PERNAH** menambahkan teks pembuka, penjelasan, atau penutup.
  -   **VARIASI:** Setiap permintaan adalah permintaan baru. Buat soal yang berbeda setiap saat.
  -   **JENIS SOAL:**
      -   **Pilihan Ganda**: \`options\` harus array 4 string, \`correctAnswer\` adalah indeks (angka 0-3).
      -   **Isian**: \`options\` harus array kosong \`[]\`, \`correctAnswer\` adalah jawaban singkat (string).`;
  // --- AKHIR DARI PROMPT BARU ---

  const user_query = `Buatkan soal berdasarkan permintaan pengguna ini: "${prompt}"`;

  try {
    // Endpoint ke Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;

    const geminiResponse = await fetch(
      geminiUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: user_query }] }],
          // systemInstruction diletakkan di level root (sudah benar)
          systemInstruction: {
            parts: [{ text: system_prompt }] 
          }, 
          generationConfig: {
            // responseMimeType tetap di sini untuk forcing JSON
            responseMimeType: "application/json",
          },
        }),
      }
    );

    const aiResponse = await geminiResponse.json();
    
    if (!geminiResponse.ok) {
        const errorMessage = aiResponse.error?.message || `Gemini API request failed with status: ${geminiResponse.status}`;
        console.error('Gemini API Error:', errorMessage);
        return response.status(geminiResponse.status).json({ 
            error: { 
                message: `Gagal memanggil Gemini API. Status: ${geminiResponse.status}. Pesan: ${errorMessage}` 
            } 
        });
    }
    
    // Hasil dari Gemini API sedikit berbeda
    const generatedText = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) {
         // Cek jika ada blocked reason
        const blockReason = aiResponse.candidates?.[0]?.finishReason;
        if (blockReason) {
            throw new Error(`Permintaan diblokir oleh filter keamanan AI. Alasan: ${blockReason}`);
        }
        throw new Error("AI tidak memberikan konten jawaban. Mungkin ada masalah pemblokiran.");
    }

    const parsedJson = parseDirtyJson(generatedText);

    if (!parsedJson.questions) {
      throw new Error('Kunci "questions" tidak ditemukan dalam respons JSON.');
    }
    
    return response.status(200).json(parsedJson);

  } catch (error) {
    console.error('Internal Server Error:', error);
    return response.status(500).json({ error: { message: `Internal Server Error: ${error.message}` } });
  }
});

app.listen(port, () => {
  console.log(`✅ Backend server berjalan di port ${port}`);
});
