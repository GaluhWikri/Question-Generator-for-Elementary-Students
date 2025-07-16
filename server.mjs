// server.mjs

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Memuat environment variables
dotenv.config({ path: '.env.local' });

const app = express();
// Gunakan port dari hosting atau fallback ke 4000
const port = process.env.PORT || 4000; 

// --- PERBAIKAN CORS: Izinkan semua origin ---
app.use(cors());
// --- AKHIR DARI PERBAIKAN ---

app.use(express.json());

// Endpoint untuk memeriksa apakah server berjalan
app.get('/', (req, res) => {
  res.send('Backend Server is running!');
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
            { role: "system", content: 'You are a helpful assistant that generates a valid JSON object. The root object must have a key "questions".' },
            { role: "user", content: `Generate questions based on this prompt: "${prompt}". Each object in the "questions" array must have keys: "question", "options", "correctAnswer", "subject", "grade", and "difficulty".` }
          ],
          model: "llama3-8b-8192",
          temperature: 0.7,
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