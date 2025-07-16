// server.mjs

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Memuat environment variables
dotenv.config({ path: '.env.local' });

const app = express();
const port = process.env.PORT || 4000;
const host = '0.0.0.0';

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Backend Server is running!', version: '1.2-final' });
});

app.post('/api/generate', async (request, response) => {
  const { prompt } = request.body;
  if (!prompt) {
    return response.status(400).json({ error: { message: 'Prompt tidak boleh kosong.' } });
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    return response.status(500).json({ error: { message: 'Konfigurasi Groq API di server belum diatur.' } });
  }

  // --- PROMPT FINAL DENGAN ATURAN SUPER KETAT ---
  const system_prompt = `Anda adalah AI super canggih yang bertugas sebagai guru pembuat soal SD di Indonesia. Tugas Anda adalah menghasilkan soal berkualitas tinggi dalam format JSON yang sempurna. Patuhi SEMUA aturan berikut tanpa kecuali.

  ATURAN #1: BAHASA
  - Seluruh teks, termasuk pertanyaan, pilihan jawaban, dan semua nilai string dalam JSON, WAJIB menggunakan Bahasa Indonesia yang baik dan benar. JANGAN PERNAH menggunakan Bahasa Inggris.

  ATURAN #2: AKURASI & KUALITAS
  - Jika permintaan adalah soal matematika, Anda WAJIB melakukan proses berpikir internal: 1. Baca soal. 2. Hitung jawabannya dengan teliti. 3. Tetapkan jawaban yang benar. 4. Baru buat tiga pilihan pengecoh yang salah namun masuk akal. Jangan pernah menebak jawaban matematika.
  - Pilihan jawaban pengecoh harus relevan dengan pertanyaan.

  ATURAN #3: FORMAT JSON
  - Output Anda HARUS HANYA berupa objek JSON yang valid. Jangan ada teks pembuka, penutup, atau penjelasan apa pun di luar JSON.
  - Objek JSON ini harus memiliki satu kunci utama: "questions". Nilai dari "questions" adalah sebuah array dari objek-objek soal.

  ATURAN #4: JENIS SOAL (SANGAT PENTING)
  - Perhatikan permintaan jenis soal dari pengguna dan gunakan format yang benar:
  - Untuk "Pilihan Ganda": Kunci "options" harus berisi sebuah array dengan 4 string. "correctAnswer" adalah indeks jawaban yang benar (angka dari 0 sampai 3).
  - Untuk "Isian": Kunci "options" HARUS berupa sebuah array kosong ([]). "correctAnswer" adalah jawaban singkatnya dalam bentuk string. Contoh: {"question": "Ibukota Indonesia adalah...", "options": [], "correctAnswer": "Jakarta", ...}`;

  const user_prompt = `Berdasarkan permintaan pengguna berikut, hasilkan JSON sesuai dengan SEMUA aturan yang telah ditetapkan dalam peran sistem Anda.

  Permintaan Pengguna: "${prompt}"`;
  // --- AKHIR DARI PROMPT FINAL ---

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
          model: "llama3-8b-8192",
          temperature: 0.5, // Dibuat lebih rendah untuk akurasi
          max_tokens: 2048,
          response_format: { type: "json_object" },
        }),
      }
    );

    const aiResponse = await groqResponse.json();
    
    if (!groqResponse.ok) {
        return response.status(500).json({ error: { message: `Groq API request failed: ${aiResponse.error.message}` } });
    }
    
    const generatedText = aiResponse.choices[0]?.message?.content;
    if (!generatedText) {
        throw new Error("AI tidak memberikan konten jawaban.");
    }

    const parsedJson = JSON.parse(generatedText);
    return response.status(200).json(parsedJson);

  } catch (error) {
    console.error('Internal Server Error:', error);
    return response.status(500).json({ error: { message: error.message } });
  }
});

app.listen(port, host, () => {
  console.log(`✅ Backend server berjalan di http://${host}:${port}`);
});