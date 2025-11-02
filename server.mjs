// server.mjs

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Hapus baris ini karena Shipper sudah menyediakan variabel lingkungan secara langsung.
// dotenv.config({ path: '.env.local' });

const app = express();
// Mengubah port fallback ke 8080, port yang lebih umum di lingkungan container
const port = process.env.PORT || 8080; 

// --- PERBAIKAN CORS KRITIS UNTUK PREFLIGHT OPTIONS ---
// Menggunakan middleware CORS
app.use(cors({
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Tambahkan semua metode yang diperlukan
    preflightContinue: false,
    optionsSuccessStatus: 204 // Merespons OPTIONS dengan status 204
}));

app.use(express.json());

// --- EXPLICITLY HANDLE OPTIONS REQUESTS ---
// Untuk memastikan permintaan OPTIONS (preflight) tidak dicegat
app.options('/api/generate', cors()); 
// --- Akhir Perbaikan CORS ---


app.get('/', (req, res) => {
  // Pesan status untuk memverifikasi bahwa server sedang berjalan
  res.json({ status: 'ok', message: 'Backend Server is running!', version: '20.0-master-prompt' });
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

  // Sekarang process.env.GROQ_API_KEY akan langsung membaca dari variabel Shipper
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    return response.status(500).json({ error: { message: 'Konfigurasi Groq API di server belum diatur.' } });
  }

  // --- PROMPT FINAL DENGAN LOGIKA BERLAPIS DAN VERIFIKASI DIRI ---
  const system_prompt = `Anda adalah seorang GURU SD AHLI dari Indonesia yang sangat teliti, presisi, dan anti-salah. Misi utama Anda adalah menghasilkan soal berkualitas tinggi dalam format JSON yang 100% valid dan akurat untuk semua mata pelajaran (Matematika, Bahasa Indonesia, IPA, IPS, Seni Budaya, PJOK).

  ### PROSES BERPIKIR WAJIB (Ikuti langkah demi langkah tanpa kecuali):
  1.  **ANALISIS PERMINTAAN:** Pahami permintaan pengguna secara mendalam: Mata Pelajaran, Topik, Kelas, Tingkat Kesulitan, Jumlah Soal, dan Jenis Soal.
  
  2.  **PEMBUATAN KONTEN INTERNAL:**
      -   Buat draf pertanyaan dalam Bahasa Indonesia yang **SESUAI** dengan semua parameter dari Langkah 1.
      -   **Jika soal MATEMATIKA, HITUNG jawabannya dengan cermat. Tuliskan perhitunganmu dalam pikiranmu.** Contoh: "Permintaan adalah akar dari 144. Aku tahu 12 * 12 = 144. Jawabannya PASTI 12."
      -   Untuk mata pelajaran lain (IPA, IPS, dll.), pastikan faktanya akurat dan relevan dengan kurikulum SD di Indonesia.
      -   Tentukan jawaban yang benar (\`correctAnswer\`).
      -   Buat 3 pilihan jawaban pengecoh yang relevan, masuk akal, tetapi salah.
  
  3.  **VERIFIKASI DIRI & KOREKSI (Langkah Wajib Kedua):**
      -   Periksa kembali konten yang baru saja Anda buat. Apakah jawaban matematisnya sudah 100% akurat? Apakah faktanya benar? Apakah tingkat kesulitannya sesuai? Jika ada kesalahan, **PERBAIKI SEKARANG**.
  
  4.  **PENYUSUNAN & VERIFIKASI JSON FINAL:**
      -   Susun konten yang sudah terverifikasi ke dalam format JSON.
      -   Periksa kembali JSON tersebut. Apakah sudah 100% valid? Apakah tidak ada teks tambahan di luar JSON? Apakah kunci utamanya adalah "questions"?
      -   Kirimkan HANYA JSON yang sudah lolos semua verifikasi.

  ### ATURAN OUTPUT FINAL:
  -   Output HARUS HANYA berupa satu objek JSON yang valid.
  -   **JANGAN PERNAH** menambahkan teks pembuka atau penutup.
  -   **VARIASI:** Setiap permintaan adalah permintaan baru. Buat soal yang berbeda setiap saat.
  -   **JENIS SOAL:**
      -   **Pilihan Ganda**: \`options\` harus array 4 string, \`correctAnswer\` adalah indeks (angka 0-3).
      -   **Isian**: \`options\` harus array kosong \`[]\`, \`correctAnswer\` adalah jawaban singkat (string).`;

  const user_prompt = `Gunakan PROSES BERPIKIR WAJIB dan semua ATURAN untuk permintaan ini. Pastikan akurasi dan relevansinya sempurna untuk semua mata pelajaran. Jika diminta soal 'campur', buatlah soal dengan tingkat kesulitan yang bervariasi.

  **Permintaan Pengguna:** "${prompt}"
  
  (ID Variasi Unik: ${Date.now()})`;
  // --- AKHIR DARI PROMPT ---

  try {
    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: system_prompt },
            { role: "user", content: user_prompt }
          ],
          model: "llama-3.1-405b", // DIGANTI ke model yang benar-benar aktif
          temperature: 0.6, // Suhu seimbang untuk akurasi dan variasi
          max_tokens: 3000,
          response_format: { type: "json_object" },
        }),
      }
    );

    const aiResponse = await groqResponse.json();
    
    if (!groqResponse.ok) {
        // --- PERBAIKAN PENTING DI SINI ---
        // Mendapatkan pesan error yang lebih spesifik dari API Groq
        const errorMessage = aiResponse.error?.message || `Groq API request failed with status: ${groqResponse.status}`;
        console.error('Groq API Error:', errorMessage);
        return response.status(groqResponse.status).json({ 
            error: { 
                message: `Gagal memanggil Groq API. Status: ${groqResponse.status}. Pesan: ${errorMessage}` 
            } 
        });
        // --- Akhir Perbaikan ---
    }
    
    const generatedText = aiResponse.choices[0]?.message?.content;
    if (!generatedText) {
        throw new Error("AI tidak memberikan konten jawaban.");
    }

    const parsedJson = parseDirtyJson(generatedText);

    if (!parsedJson.questions) {
      throw new Error('Kunci "questions" tidak ditemukan dalam respons JSON.');
    }
    
    return response.status(200).json(parsedJson);

  } catch (error) {
    console.error('Internal Server Error:', error);
    // Perbarui pesan error untuk lebih jelas di sisi frontend
    return response.status(500).json({ error: { message: `Internal Server Error: ${error.message}` } });
  }
});

app.listen(port, () => {
  console.log(`✅ Backend server berjalan di port ${port}`);
});
