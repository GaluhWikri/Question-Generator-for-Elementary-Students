// api/generate.js

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: { message: 'Method Not Allowed' } });
  }

  const { prompt } = request.body;
  if (!prompt) {
    return response.status(400).json({ error: { message: 'Prompt tidak boleh kosong.' } });
  }

  // Ganti nama variabel untuk mencerminkan API baru
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    return response.status(500).json({ error: { message: 'Konfigurasi Groq API di server belum diatur.' } });
  }

  try {
    const groqResponse = await fetch(
      // --- MENGGUNAKAN GROQ API YANG STABIL ---
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Menggunakan format pesan yang lebih modern
          messages: [
            {
              role: "system",
              content: `You are a helpful assistant. You must generate a valid JSON object inside a markdown code block. The JSON object must have a key "questions" which is an array of question objects.`
            },
            {
              role: "user",
              content: `Generate questions based on this prompt: "${prompt}". Each object in the "questions" array must have these keys: "question", "options", "correctAnswer", "subject", "grade", and "difficulty".`
            }
          ],
          model: "llama3-8b-8192", // Model Llama 3 yang cepat dan cerdas
          temperature: 0.7,
          max_tokens: 2048,
          // Memaksa output menjadi JSON
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!groqResponse.ok) {
      const errorBody = await groqResponse.json();
      return response.status(500).json({ error: { message: `Groq API request failed: ${errorBody.error.message}` } });
    }
    
    const aiResponse = await groqResponse.json();
    const generatedText = aiResponse.choices[0]?.message?.content;

    if (!generatedText) {
      throw new Error('Tidak ada teks yang dihasilkan oleh AI.');
    }
    
    // Groq dengan response_format sudah menghasilkan JSON, jadi kita bisa langsung parsing
    const parsedJson = JSON.parse(generatedText);
    return response.status(200).json(parsedJson);

  } catch (error) {
    console.error('Internal Server Error:', error);
    return response.status(500).json({ error: { message: error.message } });
  }
}