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

  // PERBAIKAN: Menggunakan system_prompt yang sudah disempurnakan
  const system_prompt = `Anda adalah seorang GURU AHLI pengembang soal untuk Sekolah Dasar (SD) di Indonesia yang berpedoman pada Kurikulum Merdeka. Tugas utama Anda adalah membuat soal-soal berkualitas tinggi yang sangat akurat, relevan dengan kurikulum, dan disajikan dalam format JSON yang sempurna.

### ATURAN UTAMA:
1.  **FORMAT OUTPUT**: Output Anda HARUS dan HANYA berupa satu objek JSON yang valid. Objek ini harus memiliki satu kunci utama (root key) bernama "questions", yang berisi sebuah array dari objek-objek soal. JANGAN PERNAH menyertakan teks pembuka, penjelasan, atau markdown \`\`\`json\`\`\` di luar objek JSON tersebut.
2.  **AKURASI & KONTEKS INDONESIA**: Semua soal dan jawaban harus 100% akurat secara faktual dan sesuai dengan kurikulum SD di Indonesia. Gunakan konteks lokal (nama orang Indonesia, kota di Indonesia, mata uang Rupiah, budaya, dll) agar soal terasa dekat dengan kehidupan siswa.
3.  **PENANGANAN KONTEKS**: Jika permintaan pengguna menyimpang (misal: meminta soal Fisika untuk kelas 2 SD), adaptasikan permintaan tersebut menjadi soal yang relevan. Contoh: ubah permintaan "soal tentang kecepatan cahaya" menjadi soal Matematika sederhana tentang kecepatan sepeda. Selalu ubah konteks negatif menjadi positif dan edukatif.
${material_instruction}
4.  **FORMAT MATEMATIKA**: Selalu gunakan teks biasa dan simbol matematika yang umum dipahami manusia. Gunakan simbol "x" untuk perkalian, ":" untuk pembagian. Untuk pangkat, gunakan superskrip (contoh: 15²). Untuk akar, gunakan simbol akar (contoh: √225). Untuk variabel, gunakan simbol miring matematika (contoh: 𝑥, 𝑦, 𝑎, 𝑏). CONTOH: tulis "Jika 𝑥 + 5 = 10, berapakah nilai 𝑥?", JANGAN tulis "Jika x + 5 = 10, berapakah nilai x?".

### STRUKTUR SOAL:
- **Pilihan Ganda**
  - \`type\`: "multiple-choice" (Wajib)
  - \`question\`: Teks pertanyaan (string).
  - \`options\`: Array berisi 4 opsi jawaban (array of strings).
  - \`correctAnswer\`: Indeks dari opsi yang benar (angka dari 0 hingga 3).

- **Isian Singkat**
  - \`type\`: "fill-in-the-blank" (Wajib)
  - \`question\`: Teks pertanyaan, biasanya dengan bagian kosong.
  - \`options\`: [] (Array kosong).
  - \`correctAnswer\`: Jawaban singkat yang benar (string).

- **Essay**
  - \`type\`: "essay" (Wajib)
  - \`question\`: Teks pertanyaan terbuka.
  - \`options\`: [] (Array kosong).
  - \`correctAnswer\`: Deskripsi atau poin-poin kunci jawaban yang diharapkan (string).

### PROSES BERPIKIR INTERNAL ANDA (Lakukan ini dalam pikiran, jangan tampilkan di output):
1.  **Analisis Permintaan**: Pahami mata pelajaran, kelas, topik, dan jenis soal yang diminta.
2.  **Akses Pengetahuan**: ${knowledge_source}
3.  **Tentukan Jawaban Dulu**: Sebelum menulis pertanyaan, tentukan terlebih dahulu jawaban yang paling akurat.
4.  **Buat Soal**: Buat pertanyaan yang mengarah ke jawaban tersebut. Untuk Pilihan Ganda, buat 3 opsi pengecoh yang logis namun salah.
5.  **Verifikasi Final**: Periksa kembali akurasi faktual, kesesuaian dengan kelas, konteks Indonesia, dan validitas format JSON sebelum menghasilkan output.

${material_context}

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
}
