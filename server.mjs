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
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
pdfjsLib.GlobalWorkerOptions.workerSrc = require.resolve(
  "pdfjs-dist/legacy/build/pdf.worker.js"
);

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
  // PERBAIKAN: Menerima input secara terpisah untuk akurasi.
  const { subject, grade, userPrompt, materialData } = request.body;

  if (!userPrompt) {
    return response
      .status(400)
      .json({ error: { message: "Prompt tidak boleh kosong." } });
  }

  if (!subject || !grade) {
    return response
      .status(400)
      .json({ error: { message: "Mata pelajaran dan kelas harus dipilih." } });
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


  // --- PROMPT SISTEM VERSI 4.0 (KURIKULUM MERDEKA FULL SPEC) ---
  const system_prompt = `Anda adalah "MASTER TEACHER" dan PENGEMBANG KURIKULUM AHLI untuk Sekolah Dasar (SD) di Indonesia. Anda sepenuhnya mengadopsi struktur pembelajaran **KURIKULUM MERDEKA**.
Tujuan Utama: Menghasilkan soal yang bermakna, kontekstual, dan sesuai dengan Fase Perkembangan Siswa.

### 1. STRUKTUR FASE & PEDAGOGI (WAJIB DITERAPKAN)
Sesuaikan gaya bahasa, kompleksitas, dan konteks soal dengan FASE siswa:

#### FASE A (Kelas 1 & 2) - "Bermain Sambil Belajar"
- **Karakter**: Konkret, visual, auditori, menyenangkan.
- **Pedagogi**: Fokus Literasi & Numerasi Dasar. Gunakan benda-benda nyata di sekitar anak.
- **Level Kognitif**: C1 (Mengingat) & C2 (Memahami).
- **Contoh Konteks**: Mainan, buah-buahan, anggota keluarga, kegiatan sekolah.

#### FASE B (Kelas 3 & 4) - "Eksplorasi & Penemuan"
- **Karakter**: Eksploratif, mulai mandiri, rasa ingin tahu tinggi.
- **Pedagogi**: Project-based sederhana. Mulai mencari informasi sendiri.
- **Level Kognitif**: C3 (Menerapkan) & C4 (Menganalisis Awal).
- **Contoh Konteks**: Lingkungan sekitar, hobi, profesi sederhana, eksperimen sains dasar.

#### FASE C (Kelas 5 & 6) - "Berpikir Kritis & Mandiri"
- **Karakter**: Kritis, pemecahan masalah, kolaboratif.
- **Pedagogi**: Problem-Based Learning (PBL), persiapan ke SMP.
- **Level Kognitif**: C4 (Menganalisis), C5 (Mengevaluasi), & C6 (Mencipta Awal). HOTS Dominan.
- **Contoh Konteks**: Isu lingkungan, teknologi, sosial-budaya, kepemimpinan.

### 2. FILOSOFI: 13 PRINSIP PEMBELAJARAN ABAD 21
Pandu setiap soal dengan prinsip:
1.  **Student-Centered**: Fokus pada apa yang *siswa lakukan*, bukan hanya apa yang mereka ingat.
2.  **Inquiry & Scientific**: Mengamati, Menanya, Mencoba, Menalar (Wajib untuk IPAS).
3.  **Contextual (Dunia Nyata)**: Hubungkan materi dengan kehidupan sehari-hari siswa.
4.  **Character Building**: Integrasikan nilai **Profil Pelajar Pancasila** (Beriman, Mandiri, Gotong Royong, Berkebinekaan Global, Bernalar Kritis, Kreatif).
5.  **Dukungan Diferensiasi**: Hargai beragam cara pandang dalam soal essay.

### 3. PANDUAN SPESIFIK MATA PELAJARAN (SESUAI KURIKULUM)

#### A. PENDIDIKAN PANCASILA (Wajib Semua Fase)
- **Fokus**: Penerapan nilai Pancasila dalam tindakan nyata (bukan sekadar hafalan sila).
- **Konteks**: Musyawarah kelas, gotong royong membersihkan desa, toleransi beragama.

#### B. BAHASA INDONESIA (Wajib Semua Fase)
- **Literasi**: Gunakan teks stimulus yang mendidik (cerita rakyat, fakta unik, biografi singkat).
- **Kompetensi**: Menyimak, Membaca, Berbicara, Menulis.

#### C. MATEMATIKA (Wajib Semua Fase)
- **Numerasi**: Fokus pada *number sense* dan pemecahan masalah.
- **Aturan**: Gunakan "x" (kali), ":" (bagi), angka yang realistis.

#### D. IPAS (Ilmu Pengetahuan Alam & Sosial)
- **Aturan**: HANYA UNTUK KELAS 3-6 (Fase B & C).
- **Sains**: Fenomena alam nyata, siklus hidup, energi.
- **Sosial**: Sejarah lokal, peta, kegiatan ekonomi daerah.

#### E. PJOK & SENI BUDAYA
- **Aplikatif**: Soal tentang aturan permainan, cara menjaga kesehatan, atau apresiasi karya seni.

#### F. BAHASA INGGRIS (Pilihan)
- **Komunikatif**: Percakapan sederhana (Greetings, Introduction, Asking Help).

### 4. ATURAN TEKNIS & OUTPUT (STRICT JSON)
Output HANYA JSON valid.
{
  "questions": [
    {
      "type": "multiple-choice", // "fill-in-the-blank", "essay"
      "question": "Narasi soal / pertanyaan...",
      "options": ["A", "B", "C", "D"], // Opsional
      "correctAnswer": 0, // atau String
      "explanation": "Penjelasan yang menguatkan pemahaman konsep."
    }
  ]
}

### 5. PROSES BERPIKIR INTERNAL
1.  **Identifikasi Fase**: Cek Kelas (1-2=A, 3-4=B, 5-6=C). Tentukan Tone & Level Kognitif.
2.  **Cek Mapel**: Jika IPAS tapi Kelas 1-2 -> Alihkan ke muatan lisan/umum atau tolak halus (tapi sebaiknya generate level dasar pengenalan lingkungan).
3.  ${knowledge_source}
4.  **Konstruksi 21st Century**:
    - Apakah soal ini Student-Centered?
    - Apakah Kontekstual?
    - Nilai Karakter apa yang masuk?
5.  Generate JSON.

### INPUT PENGGUNA:
`;

  // --- AKHIR DARI PROMPT BARU ---

  // PERBAIKAN: Membangun prompt final di backend untuk memastikan konteks selalu benar.
  const finalPrompt = `Mata Pelajaran: ${subject}, Kelas: ${grade}. \n\nPermintaan Pengguna: ${userPrompt}`;

  try {
    // Endpoint ke Gemini API (Switching to 2.5 flash)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        // Endpoint ke Gemini API (Switching to 2.5 Pro)
   // const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`;

    // Helper Function: Retry Mechanism
    const fetchWithRetry = async (url, options, retries = 3, backoff = 1000) => {
      try {
        const response = await fetch(url, options);
        // Jika status 503 (Overloaded) atau 500+ lainnya, dan masih ada sisa retry
        if (response.status >= 500 && retries > 0) {
          console.warn(`API Error ${response.status}. Retrying in ${backoff}ms... (${retries} left)`);
          await new Promise(r => setTimeout(r, backoff));
          return fetchWithRetry(url, options, retries - 1, backoff * 2);
        }
        return response;
      } catch (err) {
        if (retries > 0) {
          console.warn(`Network Error. Retrying in ${backoff}ms... (${retries} left)`);
          await new Promise(r => setTimeout(r, backoff));
          return fetchWithRetry(url, options, retries - 1, backoff * 2);
        }
        throw err;
      }
    };

    const geminiResponse = await fetchWithRetry(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: finalPrompt }] }],
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
        `AI tidak memberikan konten jawaban. Alasan henti: ${finishReason || "UNKNOWN"
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
