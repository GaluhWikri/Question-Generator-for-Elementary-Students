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
  res.json({ status: 'ok', message: 'Backend Server is running!', version: '20.0-gemini-migration' });
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

  // MENGGANTI: Cari GEMINI_API_KEY, bukan GROQ_API_KEY
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

  if (!GEMINI_API_KEY) {
    return response.status(500).json({ error: { message: 'Konfigurasi Gemini API di server belum diatur. Mohon atur GEMINI_API_KEY.' } });
  }

  // --- PROMPT FINAL UNTUK GEMINI ---
  const system_prompt = `Anda adalah seorang GURU SD AHLI dari Indonesia yang sangat teliti, presisi, dan anti-salah. Misi utama Anda adalah menghasilkan soal berkualitas tinggi dalam format JSON yang 100% valid dan akurat untuk semua mata pelajaran (Matematika, Bahasa Indonesia, IPA, IPS, Seni Budaya, PJOK).

  ### ATURAN OUTPUT FINAL:
  - Output HARUS HANYA berupa satu objek JSON yang valid.
  - JANGAN PERNAH menambahkan teks pembuka, penjelasan, atau penutup.
  - Kunci utamanya HARUS "questions".
  - **JENIS SOAL (WAJIB):**
      - **Pilihan Ganda**: Array string \`options\` harus berisi 4 pilihan, \`correctAnswer\` adalah indeks (angka 0-3).
      - **Isian**: Array \`options\` harus kosong \`[]\`, \`correctAnswer\` adalah jawaban singkat (string).
  - Pastikan tingkat kesulitan dan topik sesuai dengan kurikulum SD di Indonesia.`;

  const user_query = `Buatkan soal berdasarkan permintaan pengguna ini: "${prompt}"`;
  // --- AKHIR DARI PROMPT ---

  try {
    // MENGGANTI: Endpoint ke Gemini API
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
          // PINDAH: systemInstruction dipindahkan ke level root di sini
          systemInstruction: system_prompt, 
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
