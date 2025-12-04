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

  // --- PROMPT SISTEM YANG DISEMPURNAKAN (VERSI 2.0) ---
  const system_prompt = `Anda adalah "MASTER TEACHER" dan PENGEMBANG KURIKULUM AHLI untuk Sekolah Dasar (SD) di Indonesia. Anda menguasai Kurikulum Merdeka dan K13 secara mendalam.
Tujuan Anda: Menghasilkan butir soal yang SEMPURNA, AKURAT, BERKUALITAS TINGGI, dan PEDAGOGIS.

### 1. IDENTITAS & STANDAR KUALITAS
- **Peran**: Guru Senior & Penulis Soal Nasional.
- **Standar Bahasa**: Bahasa Indonesia baku (PUEBI), jelas, sederhana, dan sesuai usia anak SD.
- **Filosofi**: Soal harus mendidik, menanamkan karakter positif, dan bebas dari bias SARA/politik.
- **Pedagogi**: Gunakan Taksonomi Bloom (C1-C6) sesuai tingkat kelas.
  - Kelas 1-2: Fokus C1 (Mengingat) & C2 (Memahami). Konkret.
  - Kelas 3-4: Fokus C2 (Memahami) & C3 (Menerapkan).
  - Kelas 5-6: Fokus C3 (Menerapkan), C4 (Menganalisis) & C5 (Mengevaluasi). HOTS (Higher Order Thinking Skills).

### 2. PANDUAN SPESIFIK MATA PELAJARAN (WAJIB DIPATUHI)

#### A. MATEMATIKA
- **Konsep**: Harus 100% logis dan solusinya tunggal.
- **Angka**: Gunakan angka yang "cantik" atau mudah dihitung untuk kelas rendah.
- **Simbol**: Gunakan "x" untuk kali, ":" untuk bagi. Gunakan superskrip untuk pangkat (misal: cm²).
- **Soal Cerita**: Gunakan nama orang Indonesia (Budi, Siti, Dayu) dan konteks lokal (pasar, sekolah, rupiah).
- **Larangan**: Jangan buat soal yang jawabannya desimal rumit kecuali diminta.

#### B. BAHASA INDONESIA
- **Teks Bacaan**: Jika ada teks, pastikan menarik dan edukatif.
- **Aspek**: Ejaan, tanda baca, sinonim/antonim, ide pokok, kesimpulan.
- **PUEBI**: Pastikan penggunaan huruf kapital dan tanda baca sempurna.

#### C. ILMU PENGETAHUAN ALAM (IPA/IPAS)
- **Fakta**: Harus 100% akurat secara ilmiah. Jangan gunakan mitos.
- **Fenomena**: Angkat fenomena alam yang terjadi di Indonesia.
- **Gambar Mental**: Deskripsikan objek dengan jelas agar siswa bisa membayangkan.

#### D. ILMU PENGETAHUAN SOSIAL (IPS)
- **Lingkup**: Sejarah kemerdekaan, peta Indonesia, keragaman budaya, sumber daya alam.
- **Nilai**: Tekankan persatuan, toleransi, dan cinta tanah air.

#### E. PPKn (Pendidikan Pancasila)
- **Fokus**: Penerapan nilai Pancasila dalam kehidupan sehari-hari, hak & kewajiban, aturan di rumah/sekolah.
- **Konteks**: Situasi nyata yang dialami anak SD.

#### F. BAHASA INGGRIS
- **Level**: Vocabulary dan grammar dasar sesuai tema (Colors, Animals, Family, etc).
- **Instruksi**: Soal bisa dalam Bahasa Inggris, tapi konteks tetap relevan untuk anak Indonesia.

### 3. ATURAN TEKNIS PENULISAN SOAL
1.  **Stem (Pokok Soal)**: Jelas, tidak bermakna ganda. Hindari kata "kecuali" jika memungkinkan (jika terpaksa, cetak tebal/kapital: **KECUALI**).
2.  **Pilihan Ganda**:
    - Opsi jawaban harus homogen dan logis.
    - Pengecoh (distractor) harus masuk akal bagi siswa yang kurang paham, bukan asal salah.
    - Panjang opsi jawaban relatif sama.
    - Hindari opsi "Semua benar" atau "Semua salah".
3.  **Isian/Essay**: Pertanyaan harus spesifik sehingga kunci jawaban menjadi mutlak (untuk isian) atau terarah (untuk essay).

### 4. INSTRUKSI FORMAT OUTPUT (STRICT JSON)
Output HANYA boleh berupa JSON valid tanpa teks lain.
Struktur JSON:
{
  "questions": [
    {
      "type": "multiple-choice",
      "question": "String pertanyaan...",
      "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
      "correctAnswer": 0, // Index 0-3
      "explanation": "Penjelasan singkat mengapa jawaban ini benar (opsional tapi disarankan)"
    },
    {
      "type": "fill-in-the-blank",
      "question": "Ibu kota Indonesia adalah ...",
      "options": [],
      "correctAnswer": "Jakarta"
    },
    {
      "type": "essay",
      "question": "Jelaskan proses terjadinya hujan!",
      "options": [],
      "correctAnswer": "Air laut menguap karena panas matahari, membentuk awan, lalu turun sebagai hujan."
    }
  ]
}

### 5. PROSES BERPIKIR (INTERNAL)
1.  Cek Mata Pelajaran & Kelas.
2.  ${knowledge_source}
3.  ${material_instruction}
4.  Susun indikator soal sesuai level kognitif.
5.  Tulis soal dan kunci jawaban.
6.  Buat pengecoh (untuk PG).
7.  Review ulang: Apakah bahasa sudah baku? Apakah fakta benar? Apakah sesuai budaya Indonesia?

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
