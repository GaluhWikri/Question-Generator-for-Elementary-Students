import { NextRequest, NextResponse } from "next/server";
import { Buffer } from "buffer";
import { parsePdfBuffer } from "../../../lib/pdfHelper"; // Helper PDF
import { parseDocxBuffer } from "../../../lib/docxHelper"; // Helper Word
import { SYSTEM_PROMPT } from "../../../lib/promptGenerator"; // Helper Prompt

export const maxDuration = 60; // Timeout deployment

// --- UTILS: JSON CLEANER ---
function parseDirtyJson(dirtyJson: string) {
    const match = dirtyJson.match(/```json\s*([\s\S]*?)\s*```/);
    let jsonString = dirtyJson;
    if (match && match[1]) {
        jsonString = match[1];
    }
    // Hapus karakter backticks sisa jika ada
    jsonString = jsonString.replace(/`/g, '');

    try {
        return JSON.parse(jsonString);
    } catch (e) {
        // Fallback: cleaning sederhana
        let cleanedString = jsonString.replace(/,\s*([\]}])/g, "$1");
        try {
            return JSON.parse(cleanedString);
        } catch (finalError) {
            throw new Error("AI output bukan JSON valid dan tidak bisa diperbaiki.");
        }
    }
}

// --- UTILS: TEXT EXTRACTOR ---
async function extractTextFromMaterial(materialData: { content: string, type: string }) {
    if (!materialData || !materialData.content) return "";

    const { content, type } = materialData;
    const buffer = Buffer.from(content, "base64");

    // Potong buffer jika kebesaran (opsional, untuk safety)
    // if (buffer.length > 5 * 1024 * 1024) throw new Error("File terlalu besar (Max 5MB)");

    try {
        if (type === "text/plain") {
            return buffer.toString("utf8");

        } else if (type === "application/pdf") {
            // Delegasi ke PDF Helper
            return await parsePdfBuffer(buffer);

        } else if (type.includes("word") || type.includes("officedocument.wordprocessingml.document")) {
            // Delegasi ke DOCX Helper
            return await parseDocxBuffer(buffer);
        }
    } catch (error: any) {
        console.error(`[EXTRACT ERROR] Type: ${type}`, error);
        throw new Error(`Gagal membaca file (${type}): ${error.message}`);
    }

    return "";
}

// --- UTILS: NETWORK ---
const fetchWithRetry = async (url: string, options: any, retries = 3, backoff = 1000): Promise<Response> => {
    try {
        const response = await fetch(url, options);
        if (response.status >= 500 && retries > 0) {
            console.warn(`API Error ${response.status}. Hubungi ulang... (${retries} sisa)`);
            await new Promise(r => setTimeout(r, backoff));
            return fetchWithRetry(url, options, retries - 1, backoff * 2);
        }
        return response;
    } catch (err) {
        if (retries > 0) {
            console.warn(`Network Error. Coba lagi... (${retries} sisa)`);
            await new Promise(r => setTimeout(r, backoff));
            return fetchWithRetry(url, options, retries - 1, backoff * 2);
        }
        throw err;
    }
};

// --- MAIN HANDLER ---
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { subject, grade, userPrompt, materialData } = body;

        console.log("------------------------------------------");
        console.log(`[API START] Subject: ${subject}, Grade: ${grade}`);

        // Cek API Key
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {
            return NextResponse.json(
                { error: { message: "Server Error: GEMINI_API_KEY is missing." } },
                { status: 500 }
            );
        }

        // 1. Ekstraksi Materi (Jika Ada)
        let materialContent = "";
        if (materialData) {
            console.log(`[UPLOAD] Processing file type: ${materialData.type}`);
            try {
                const text = await extractTextFromMaterial(materialData);
                // Batasi panjang teks agar tidak overload token (misal 15.000 karakter)
                materialContent = text ? text.substring(0, 15000) : "";
                console.log(`[UPLOAD] Text extracted. Length: ${materialContent.length} chars`);
            } catch (error: any) {
                return NextResponse.json({ error: { message: error.message } }, { status: 400 });
            }
        }

        // 2. Konstruksi Prompt
        const material_context = materialContent
            ? `\n\n### MATERI SUMBER (WAJIB DIGUNAKAN):\n\n${materialContent}\n\nInstruksi: Gunakan materi di atas sebagai sumber utama pertanyaan, tapi jangan sebut "berdasarkan teks di atas" secara eksplisit.`
            : "Gunakan pengetahuan umum kurikulum.";

        const finalPrompt = `Buatkan soal untuk Mata Pelajaran: ${subject}, Kelas: ${grade}.\n\n${material_context}\n\nPermintaan Khusus User: ${userPrompt}\n\nIngat: Output JSON only.`;

        // 3. Panggil Gemini API
        // Gunakan model Flash terbaru untuk kecepatan
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

        console.log(`[AI] Calling Gemini API...`);

        const geminiResponse = await fetchWithRetry(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: finalPrompt }] }],
                systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }, // Import dari lib
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 0.5, // Seimbang antara kreatif dan patuh
                },
            }),
        });

        // 4. Handle Response
        if (!geminiResponse.ok) {
            const errText = await geminiResponse.text();
            console.error(`[AI FAIL] Status: ${geminiResponse.status} - ${errText}`);
            throw new Error(`AI Error ${geminiResponse.status}: ${errText}`);
        }

        const responseJson = await geminiResponse.json();
        const generatedText = responseJson.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
            throw new Error("AI tidak memberikan jawaban teks.");
        }

        // 5. Parsing & Validasi JSON Output
        const parsedData = parseDirtyJson(generatedText);

        if (!parsedData.questions || !Array.isArray(parsedData.questions)) {
            throw new Error("Format JSON AI salah: Tidak ada array 'questions'.");
        }

        console.log(`[SUCCESS] Generated ${parsedData.questions.length} questions.`);
        return NextResponse.json(parsedData);

    } catch (error: any) {
        console.error("[SERVER ERROR]", error);
        return NextResponse.json(
            { error: { message: error.message || "Terjadi kesalahan internal server." } },
            { status: 500 }
        );
    }
}


