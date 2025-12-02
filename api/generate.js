// api/generate.js - Diperbarui untuk Gemini dan Upload File

import { createRequire } from "module";
import mammoth from "mammoth";

// --- Perbaikan untuk memuat pdfjs-dist di lingkungan serverless ---
const require = createRequire(import.meta.url);
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
pdfjsLib.GlobalWorkerOptions.workerSrc = require.resolve('pdfjs-dist/legacy/build/pdf.worker.js');

// Fungsi pembersih JSON
function parseDirtyJson(dirtyJson) {
  const match = dirtyJson.match(/```json\s*([\s\S]*?)\s*```/);
  let jsonString = dirtyJson;
  if (match && match[1]) {
    jsonString = match[1];
  }
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    let cleanedString = jsonString.replace(/,\s*([\]}])/g, "$1");
    try {
      return JSON.parse(cleanedString);
    } catch (finalError) {
      throw new Error(
        "AI mengembalikan format JSON yang tidak bisa diperbaiki."
      );
    }
  }
}

// Fungsi untuk mengekstrak teks dari Base64 content
async function extractTextFromMaterial(materialData) {
  if (!materialData || !materialData.content) return "";

  const { content, type } = materialData;
  const buffer = Buffer.from(content, "base64");

  try {
    if (type === "text/plain") {
      return buffer.toString("utf8");
    } else if (type === "application/pdf") {
      const uint8Array = new Uint8Array(buffer);
      const doc = await pdfjsLib.getDocument({ data: uint8Array }).promise;
      let allText = "";
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(" ");
        allText += pageText + "\n";
      }
      return allText;
    } else if (
      type.includes("word") ||
      type.includes("officedocument.wordprocessingml.document")
    ) {
      let result = await mammoth.extractRawText({ buffer: buffer });
      return result.value;
    }
  } catch (error) {
    console.error("Gagal mengekstrak teks dari file:", error);
    throw new Error(
      `Gagal memproses file PDF,doc,text: ${error.message}. File mungkin rusak, terenkripsi, atau memiliki format yang kompleks.`
    );
  }

  return "";
}

export default async function handler(request, response) {
  // Pengaturan CORS
  response.setHeader('Access-Control-Allow-Origin', '*'); // Izinkan semua origin
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: { message: 'Method Not Allowed' } });
  }

  const { prompt, materialData } = request.body;
  if (!prompt) {
    return response.status(400).json({ error: { message: 'Prompt tidak boleh kosong.' } });
  }

  // Ekstraksi teks material
  let materialContent = "";
  if (materialData) {
    try {
      materialContent = await extractTextFromMaterial(materialData);
    } catch (error) {
      return response.status(400).json({ error: { message: error.message } });
    }
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return response.status(500).json({ error: { message: 'Konfigurasi Gemini API di server belum diatur. Mohon atur GEMINI_API_KEY.' } });
  }

  // --- PROMPT GENERASI SOAL (Sama seperti di server.mjs) ---
  const material_context = materialContent ? `\n\n### MATERI SUMBER SOAL:\n\n${materialContent}\n\n` : "";
  const material_instruction = materialContent ? "5. **WAJIB** gunakan informasi dari MATERI SUMBER SOAL yang diberikan untuk membuat semua pertanyaan." : "";
  const knowledge_source = materialContent ? "Gunakan hanya MATERI SUMBER SOAL yang diberikan." : "Akses pengetahuan Anda tentang topik tersebut.";
  const system_prompt = `Anda adalah seorang GURU SD AHLI dari Indonesia. Tugas Anda adalah menghasilkan soal berkualitas tinggi dalam format JSON yang 100% valid dan akurat berdasarkan permintaan.

### ATURAN UTAMA:
1. **Output HARUS HANYA** berupa satu objek JSON.
2. Kunci utama hasil HARUS "questions".
3. **JANGAN PERNAH** menambahkan teks, penjelasan, atau kode markdown (seperti \`\`\`json) di luar objek JSON.
4. **Semua konten soal dan jawaban HARUS akurat secara faktual** sesuai dengan materi SD.
${material_instruction}

### STRUKTUR SOAL:
Semua objek soal dalam array "questions" HARUS memiliki kunci "type" yang valid.
- **Soal Pilihan Ganda:** \`type\`: "multiple-choice", \`options\` array (4 string), \`correctAnswer\` adalah indeks **(angka 0-3)**.
- **Soal Isian Singkat:** \`type\`: "fill-in-the-blank", \`options\` array kosong \`[]\`, \`correctAnswer\` adalah jawaban singkat **(string)**.
- **Soal Uraian/Essay:** \`type\`: "essay", \`options\` array kosong \`[]\`, \`correctAnswer\` adalah kunci jawaban/panduan penilaian **(string, bisa panjang/deskriptif)**.

### STRATEGI VERIFIKASI JAWABAN (PENTING):
Sebelum menghasilkan JSON, lakukan langkah-langkah berikut secara internal (tidak perlu ditampilkan):
1. **Pahami permintaan:** Identifikasi mata pelajaran, kelas, dan topik soal.
2. **Kumpulkan fakta:** ${knowledge_source}
3. **Tulis Soal & Kunci Jawaban:** Buat soal dan tentukan jawaban yang benar terlebih dahulu (kunci jawaban).
4. **Buat Pengecoh (untuk PG):** Buat 3 opsi pengecoh yang masuk akal, tetapi salah.
5. **Finalisasi JSON:** Pastikan \`correctAnswer\` dan \`type\` sudah benar.

${material_context}

Buatkan soal yang akurat sesuai dengan permintaan pengguna.
`;

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: {
          parts: [{ text: system_prompt }],
        },
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.5,
        },
      }),
    });

    const aiResponse = await geminiResponse.json();

    if (!geminiResponse.ok) {
      const errorMessage = aiResponse.error?.message || `Gemini API request failed with status: ${geminiResponse.status}`;
      return response.status(geminiResponse.status).json({ error: { message: `Gagal memanggil Gemini API. Status: ${geminiResponse.status}. Pesan: ${errorMessage}` } });
    }

    const generatedText = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text;
    const finishReason = aiResponse.candidates?.[0]?.finishReason;

    if (!generatedText) {
      if (finishReason === "SAFETY") {
        throw new Error(`Permintaan diblokir oleh filter keamanan AI. Coba ubah topik soal Anda.`);
      }
      if (finishReason === "STOP") {
        throw new Error(`AI gagal menghasilkan output JSON yang valid atau lengkap. Coba ulangi atau sederhanakan permintaan.`);
      }
      throw new Error(`AI tidak memberikan konten jawaban. Alasan henti: ${finishReason || "UNKNOWN"}.`);
    }

    const parsedJson = parseDirtyJson(generatedText);

    if (!parsedJson.questions) {
      throw new Error('Kunci "questions" tidak ditemukan dalam respons JSON.');
    }

    return response.status(200).json(parsedJson);

  } catch (error) {
    console.error("Internal Server Error:", error);
    return response.status(500).json({ error: { message: `Internal Server Error: ${error.message}` } });
  }
}