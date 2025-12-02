// server.mjs

import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { Buffer } from "buffer";
// BARU: Import createRequire untuk memuat modul CommonJS
import { createRequire } from "module";

// FIX KRITIS: Menggunakan createRequire untuk memuat library CJS (pdf-parse) dengan benar.
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse"); // pdfParse sekarang adalah fungsi parsing
const mammoth = require("mammoth"); // DOCX parser

const app = express();
const port = process.env.PORT || 8080;

// --- PERBAIKAN CORS KRITIS UNTUK PREFLIGHT OPTIONS ---
app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);
// Tingkatkan limit JSON untuk menerima teks/Base64 materi yang panjang
app.use(express.json({ limit: "5mb" }));
app.options("/api/generate", cors());
// --- Akhir Perbaikan CORS ---

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Backend Server is running!",
    version: "20.0-gemini-migration-prompt-update",
  });
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

// Fungsi untuk mengekstrak teks dari Base64 content (Mendukung PDF, DOCX, TXT)
async function extractTextFromMaterial(materialData) {
  if (!materialData || !materialData.content) return "";

  const { content, type } = materialData;
  const buffer = Buffer.from(content, "base64");

  try {
    if (type === "text/plain") {
      return buffer.toString("utf8");
    } else if (type === "application/pdf") {
      // PENGGUNAAN pdf-parse yang dimuat via require
      let data = await pdfParse(buffer);
      return data.text;
    } else if (
      type.includes("word") ||
      type.includes("officedocument.wordprocessingml.document")
    ) {
      // Parsing DOCX (tetap sama)
      let result = await mammoth.extractRawText({ buffer: buffer });
      return result.value;
    }
  } catch (error) {
    console.error("Gagal mengekstrak teks dari file:", error);
    // Pesan error diubah untuk mencerminkan bahwa file mungkin masih terlalu kompleks untuk library.
    throw new Error(
      `Gagal memproses file PDF. File mungkin rusak, terenkripsi, atau memiliki format yang kompleks.`
    );
  }

  return "";
}

app.post("/api/generate", async (request, response) => {
  const { prompt, materialData } = request.body;

  if (!prompt) {
    return response
      .status(400)
      .json({ error: { message: "Prompt tidak boleh kosong." } });
  }

  // Ekstraksi teks material
  let materialContent = "";
  if (materialData) {
    try {
      materialContent = await extractTextFromMaterial(materialData);
    } catch (error) {
      // Kirim error spesifik jika gagal memproses file
      return response.status(400).json({ error: { message: error.message } });
    }
  }

  // Cari GEMINI_API_KEY
  dotenv.config();
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return response
      .status(500)
      .json({
        error: {
          message:
            "Konfigurasi Gemini API di server belum diatur. Mohon atur GEMINI_API_KEY.",
        },
      });
  }

  // --- PROMPT GENERASI SOAL ---

  const material_context = materialContent
    ? `\n\n### MATERI SUMBER SOAL:\n\n${materialContent}\n\n`
    : "";
  const material_instruction = materialContent
    ? "5. **WAJIB** gunakan informasi dari MATERI SUMBER SOAL yang diberikan untuk membuat semua pertanyaan."
    : "";
  const knowledge_source = materialContent
    ? "Gunakan hanya MATERI SUMBER SOAL yang diberikan."
    : "Akses pengetahuan Anda tentang topik tersebut.";

  const system_prompt = `Anda adalah seorang GURU SD AHLI dari Indonesia. Tugas Anda adalah menghasilkan soal berkualitas tinggi dalam format JSON yang 100% valid dan akurat berdasarkan permintaan.

### ATURAN UTAMA:
1. **Output HARUS HANYA** berupa satu objek JSON.
2. Kunci utama hasil HARUS "questions".
3. **JANGAN PERNAH** menambahkan teks, penjelasan, atau kode markdown (seperti \`\`\`json) di luar objek JSON.
4. **Semua konten soal dan jawaban HARUS akurat secara faktual** sesuai dengan materi SD.
${material_instruction}

### STRUKTUR SOAL:
Semua objek soal dalam array "questions" HARUS memiliki kunci "type" yang valid.
- **Soal Pilihan Ganda:**
    - \`type\`: "multiple-choice"
    - \`options\` array (4 string).
    - \`correctAnswer\` adalah indeks **(angka 0-3)**.
- **Soal Isian Singkat:**
    - \`type\`: "fill-in-the-blank"
    - \`options\` array kosong \`[]\`.
    - \`correctAnswer\` adalah jawaban singkat **(string)**.
- **Soal Uraian/Essay:**
    - \`type\`: "essay" // Jenis soal baru
    - \`options\` array kosong \`[]\`.
    - \`correctAnswer\` adalah kunci jawaban/panduan penilaian **(string, bisa panjang/deskriptif)**.

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
  // --- AKHIR DARI PROMPT BARU ---

  try {
    // Endpoint ke Gemini API
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
      const errorMessage =
        aiResponse.error?.message ||
        `Gemini API request failed with status: ${geminiResponse.status}`;
      console.error("Gemini API Error:", errorMessage);
      return response.status(geminiResponse.status).json({
        error: {
          message: `Gagal memanggil Gemini API. Status: ${geminiResponse.status}. Pesan: ${errorMessage}`,
        },
      });
    }

    const generatedText = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text;
    const finishReason = aiResponse.candidates?.[0]?.finishReason;

    if (!generatedText) {
      if (finishReason === "SAFETY") {
        throw new Error(
          `Permintaan diblokir oleh filter keamanan AI. Coba ubah topik soal Anda.`
        );
      }

      if (finishReason === "STOP") {
        throw new Error(
          `AI gagal menghasilkan output JSON yang valid atau lengkap. Coba ulangi atau sederhanakan permintaan.`
        );
      }

      throw new Error(
        `AI tidak memberikan konten jawaban. Alasan henti: ${
          finishReason || "UNKNOWN"
        }.`
      );
    }

    const parsedJson = parseDirtyJson(generatedText);

    if (!parsedJson.questions) {
      throw new Error('Kunci "questions" tidak ditemukan dalam respons JSON.');
    }

    return response.status(200).json(parsedJson);
  } catch (error) {
    console.error("Internal Server Error:", error);
    return response
      .status(500)
      .json({ error: { message: `Internal Server Error: ${error.message}` } });
  }
});

app.listen(port, () => {
  console.log(`✅ Backend server berjalan di port ${port}`);
});
export default app;