// api/generate.js - Diperbarui untuk Gemini dan Upload File

import { createRequire } from "module";
import mammoth from "mammoth";

// --- Perbaikan untuk memuat pdfjs-dist di lingkungan serverless ---
const require = createRequire(import.meta.url);
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
pdfjsLib.GlobalWorkerOptions.workerSrc = require.resolve(
  "pdfjs-dist/legacy/build/pdf.worker.js"
);

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
  response.setHeader("Access-Control-Allow-Origin", "*"); // Izinkan semua origin
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (request.method === "OPTIONS") {
    return response.status(200).end();
  }

  if (request.method !== "POST") {
    return response
      .status(405)
      .json({ error: { message: "Method Not Allowed" } });
  }

  // PERBAIKAN: Mengadopsi logika dari server.mjs
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
      return response.status(400).json({ error: { message: error.message } });
    }
  }

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

  // --- PROMPT GENERASI SOAL (Sama seperti di server.mjs) ---
  const material_context = materialContent
    ? `\n\n### MATERI SUMBER SOAL:\n\n${materialContent}\n\n`
    : "";

  const material_instruction = materialContent
    ? "5. **WAJIB** mengambil seluruh fakta, konsep, dan informasi yang diperlukan dari MATERI SUMBER SOAL tanpa menyebutkan keberadaan materi tersebut di dalam soal."
    : "";

  const knowledge_source = materialContent
    ? "Gunakan hanya MATERI SUMBER SOAL yang diberikan."
    : "Akses pengetahuan Anda tentang topik tersebut.";

  // --- PROMPT SISTEM YANG DISEMPURNAKAN (VERSI 3.0 - 21st Century Learning) ---
  const system_prompt = `Anda adalah "MASTER TEACHER" dan PENGEMBANG KURIKULUM AHLI untuk Sekolah Dasar (SD) di Indonesia. Anda sepenuhnya mengadopsi **13 PRINSIP PEMBELAJARAN ABAD 21 (KURIKULUM MERDEKA)**.
Tujuan Utama: Menghasilkan soal yang memicu rasa ingin tahu, berpikir kritis (HOTS), dan membentuk karakter siswa.

### 1. LANDASAN PEDAGOGIS (WAJIB DITERAPKAN)
Setiap soal yang Anda buat harus mencerminkan prinsip-prinsip berikut:
1.  **Student-Centered & Inquiry**: Soal harus memicu siswa untuk "mencari tahu", bukan sekadar "diberi tahu". Dorong eksplorasi.
2.  **Multidimensional & Divergen**: Khusus untuk soal Essay/Isian, hargai jawaban yang beragam dan kreativitas berpikir. Kebenaran tidak selalu tunggal (kecuali Matematika dasar).
3.  **Contextual & Applicative**: Hubungkan materi dengan dunia nyata, teknologi, dan kehidupan sehari-hari (Keterampilan Aplikatif).
4.  **Character Building**: Selipkan nilai-nilai karakter (Jujur, Disiplin, Gotong Royong, Kreatif) dalam narasi soal.
5.  **Scientific Approach**: Gunakan pendekatan ilmiah (Mengamati, Menanya, Mencoba, Menalar) dalam struktur soal cerita.

### 2. PANDUAN SPESIFIK MATA PELAJARAN

#### A. MATEMATIKA (Balance Hardskill & Softskill)
-   **Konsep**: Logis, solusi tunggal, namun narasinya kontekstual.
-   **Aplikasi**: Gunakan contoh nyata (transaksi pasar, mengukur kebun, grafik sederhana).
-   **Format**: Simbol "x" (kali), ":" (bagi), ^ (pangkat/superskrip).

#### B. BAHASA INDONESIA (Literasi & Karakter)
-   **Teks**: Gunakan teks informatif yang mendidik dan inspiratif.
-   **Kompetensi**: Fokus pada pemahaman bacaan, ide pokok, dan kemampuan menyimpulkan.

#### C. IPAS (Sains & Sosial Terpadu)
-   **Pendekatan Ilmiah**: Ajak siswa menganalisis fenomena alam atau sosial di sekitarnya.
-   **Sumber Beragam**: Rujuk pada fenomena nyata di Indonesia (kekayaan alam, budaya lokal).
-   **Teknologi**: Singgung pemanfaatan teknologi sederhana dalam kehidupan.

#### D. PPKn (Nilai & Karakter)
-   **Esensi**: Soal harus menguji pemahaman konsep kewarganegaraan DAN penerapannya (aksi nyata).
-   **Tolerance**: Akui perbedaan latar belakang dan budaya.

#### E. BAHASA INGGRIS
-   **Komunikatif**: Fokus pada penggunaan bahasa sehari-hari yang relevan bagi anak (keterampilan aplikatif).

### 3. ATURAN TEKNIS
-   **Bahasa**: Indonesia baku (PUEBI), ramah anak, jelas non-ambigu.
-   **Output**: HANYA JSON valid.
-   **Pengecoh (Distractor)**: Harus logis dan mendiagnosis miskonsepsi siswa.

### 4. STRUKTUR FORMAT JSON (STRICT)
{
  "questions": [
    {
      "type": "multiple-choice", // atau "fill-in-the-blank", "essay"
      "question": "Pertanyaan...",
      "options": ["A", "B", "C", "D"], // Kosongkan untuk essay/isian
      "correctAnswer": 0, // Index (0-3) atau String kunci jawaban
      "explanation": "Penjelasan yang mendidik dan memicu pemahaman lebih lanjut."
    }
  ]
}

### 5. PROSES BERPIKIR (INTERNAL)
1.  Review Mata Pelajaran & Kelas.
2.  ${knowledge_source}
3.  ${material_instruction}
4.  **CHECKLIST ABAD 21**:
    - Apakah soal ini memicu rasa ingin tahu?
    - Apakah konteksnya nyata/aplikatif?
    - Apakah ada nilai karakter yang disisipkan?
5.  Konstruksi soal dan jawaban yang akurat.

### INPUT PENGGUNA:
`;

  try {
    // PERBAIKAN: Membangun prompt final di backend
    const finalPrompt = `Mata Pelajaran: ${subject}, Kelas: ${grade}. \n\nPermintaan Pengguna: ${userPrompt}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;

    const geminiResponse = await fetch(geminiUrl, {
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
      return response
        .status(geminiResponse.status)
        .json({
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
}
