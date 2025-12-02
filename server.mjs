// server.mjs

import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { Buffer } from "buffer";
// BARU: Import createRequire untuk memuat modul CommonJS
import { createRequire } from "module";
import mammoth from "mammoth"; // Ini sudah benar

// --- Perbaikan Final untuk memuat pdfjs-dist ---
const require = createRequire(import.meta.url);
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
pdfjsLib.GlobalWorkerOptions.workerSrc = require.resolve('pdfjs-dist/legacy/build/pdf.worker.js');

const app = express();
const port = 8080; // Port untuk backend server

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
      // Menggunakan pdfjs-dist untuk ekstraksi teks
      // KONVERSI PENTING: pdfjs-dist membutuhkan Uint8Array, bukan Buffer Node.js
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
      // Parsing DOCX (tetap sama)
      let result = await mammoth.extractRawText({ buffer: buffer });
      return result.value;
    }
  } catch (error) {
    console.error("Gagal mengekstrak teks dari file:", error);
    // Pesan error diubah untuk mencerminkan bahwa file mungkin masih terlalu kompleks untuk library.
    throw new Error(
      `Gagal memproses file PDF,doc,text: ${error.message}. File mungkin rusak, terenkripsi, atau memiliki format yang kompleks.`
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
    return response.status(500).json({
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
  ? "5. **WAJIB** mengambil seluruh fakta, konsep, dan informasi yang diperlukan dari MATERI SUMBER SOAL tanpa menyebutkan keberadaan materi tersebut di dalam soal."
  : "";

const knowledge_source = materialContent
  ? "Gunakan hanya MATERI SUMBER SOAL yang diberikan sebagai sumber pengetahuan, tetapi JANGAN pernah menyatakan bahwa informasi tersebut berasal dari materi."
  : "Akses pengetahuan Anda tentang topik tersebut.";

const system_prompt = `
Anda adalah seorang GURU SD AHLI dari Indonesia. Tugas Anda adalah menghasilkan soal berkualitas tinggi dalam format JSON yang 100% valid dan akurat.

### ATURAN UTAMA:
1. **Output HARUS HANYA** berupa satu objek JSON.
2. Kunci utama hasil HARUS "questions".
3. **JANGAN PERNAH** menambahkan teks, penjelasan, atau kode markdown (\`\`\`json) di luar objek JSON.
4. **Semua konten soal dan jawaban HARUS akurat secara faktual** sesuai standar Kompentesi SD.
${material_instruction}

### STRUKTUR SOAL:
- **Pilihan Ganda**
  - \`type\`: "multiple-choice"
  - \`options\`: array berisi 4 opsi (string)
  - \`correctAnswer\`: indeks opsi yang benar (0–3)

- **Isian Singkat**
  - \`type\`: "fill-in-the-blank"
  - \`options\`: []
  - \`correctAnswer\`: string jawaban singkat

- **Essay**
  - \`type\`: "essay"
  - \`options\`: []
  - \`correctAnswer\`: deskripsi kunci jawaban

### STRATEGI VERIFIKASI INTERNAL (tidak ditampilkan):
1. Identifikasi mata pelajaran, kelas, dan topik.
2. ${knowledge_source}
3. Tentukan jawaban yang benar terlebih dahulu.
4. Buat 3 pengecoh masuk akal (untuk PG).
5. Pastikan struktur JSON valid dan lengkap.

${material_context}

Buatkan soal yang akurat sesuai permintaan pengguna.
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
