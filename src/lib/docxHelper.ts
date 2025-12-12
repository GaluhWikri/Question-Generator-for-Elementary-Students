import mammoth from "mammoth";
import { Buffer } from "buffer";

/**
 * Mengekstrak teks mentah dari file Word (DOCX) menggunakan Mammoth.
 * @param buffer - Buffer file DOCX
 */
export async function parseDocxBuffer(buffer: Buffer): Promise<string> {
    try {
        const result = await mammoth.extractRawText({ buffer: buffer });
        // result.messages bisa berisi warning, tapi kita fokus ke value (teks)
        if (result.messages && result.messages.length > 0) {
            console.warn("[DOCX WARN]", result.messages);
        }
        return result.value || "";
    } catch (error: any) {
        console.error("[DOCX ERROR]", error);
        throw new Error(`Gagal membaca file Word: ${error.message}`);
    }
}
