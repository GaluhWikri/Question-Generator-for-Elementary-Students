// Bypass index.js yang memicu auto-test cli mode
const pdf = require('pdf-parse/lib/pdf-parse.js');

async function parsePdfBuffer(buffer) {
    try {
        console.log("[DEBUG] Using Classic PDF-Parse v1.1.1...");

        // Panggilan API standar
        const data = await pdf(buffer);

        // Log untuk memastikan
        console.log(`[DEBUG] Extraction success. Info: ${JSON.stringify(data.info || {})}`);
        console.log(`[DEBUG] Text length: ${data.text.length}`);

        return data.text;
    } catch (error) {
        console.error("[PDF PARSE ERROR]", error);
        throw new Error("Gagal parsing PDF: " + error.message);
    }
}

module.exports = { parsePdfBuffer };
