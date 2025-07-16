// server.mjs

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Memuat environment variables dari file .env.local
dotenv.config({ path: '.env.local' });

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

app.post('/api/generate', async (request, response) => {
  const { prompt } = request.body;
  if (!prompt) {
    return response.status(400).json({ error: { message: 'Prompt tidak boleh kosong.' } });
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    return response.status(500).json({ error: { message: 'Konfigurasi Groq API di server belum diatur.' } });
  }

  // --- PROMPT YANG DISERHANAKAN ---
  const system_prompt = `Anda adalah guru SD ahli dari Indonesia. Anda harus mengikuti semua aturan dengan ketat.
  ATURAN KUALITAS:
  1.  Selalu gunakan Bahasa Indonesia.
  2.  Untuk soal matematika, hitung dulu jawabannya untuk memastikan kebenaran.
  3.  Pilihan jawaban pengecoh harus masuk akal.

  ATURAN FORMAT JSON (SANGAT PENTING):
  -   Jika diminta membuat "Pilihan Ganda": "options" harus berisi array 4 string, dan "correctAnswer" berisi indeks jawaban (0-3).
  -   Jika diminta membuat "Isian": "options" harus berupa array kosong [], dan "correctAnswer" berisi string jawaban singkatnya.
  -   Output akhir HARUS HANYA berupa objek JSON yang valid tanpa teks tambahan, dengan satu kunci utama "questions".`;

  const user_prompt = `Permintaan Pengguna: "${prompt}".
  Patuhi ATURAN FORMAT JSON yang sudah dijelaskan.
  Struktur objek soal: "question" (string), "options" (array), "correctAnswer" (number atau string), "subject" (string), "grade" (string), "difficulty" (string).`;
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
          model: "llama3-8b-8192",
          temperature: 0.6,
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

app.listen(port, () => {
  console.log(`✅ Backend server berjalan di http://localhost:${port}`);
});