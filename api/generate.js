// api/generate.js

// Kita tidak lagi menggunakan Express, ini adalah format asli Vercel
export default async function handler(request, response) {
  // Izinkan koneksi dari domain Vercel Anda (ganti jika perlu)
  response.setHeader('Access-Control-Allow-Origin', 'https://question-generator-for-elementary-s.vercel.app');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Menangani preflight request dari browser
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

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
            { role: "system", content: 'You are an expert elementary school teacher from Indonesia. You must strictly follow all rules.' },
            { role: "user", content: `Generate questions based on this user request: "${prompt}". Your final output MUST be a valid JSON object with a single root key "questions".` }
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
    return response.status(500).json({ error: { message: error.message } });
  }
}