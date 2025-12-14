import { jsPDF } from 'jspdf';
import { Question } from '../types/Question';

// Helper: Fetch Image to Base64
const getImageBase64 = async (url: string): Promise<string | null> => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("Failed to fetch image for PDF:", error);
        return null;
    }
};

interface PDFGeneratorParams {
    questions: Question[];
    subject: string;
    grade: string;
}

export const generateQuestionPDF = async ({ questions, subject, grade }: PDFGeneratorParams) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let cursorY = 20;

    // Helper: Wrap text
    const wrapText = (text: string, width: number) => doc.splitTextToSize(text, width);

    // Helper: Cek Page Break
    const checkPageBreak = (neededHeight: number) => {
        if (cursorY + neededHeight > pageHeight - margin) {
            doc.addPage();
            cursorY = margin;
            return true;
        }
        return false;
    };

    // --- HALAMAN 1 (HEADER) ---
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("LATIHAN SOAL", pageWidth / 2, cursorY, { align: "center" });
    cursorY += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Mata Pelajaran : ${subject}`, margin, cursorY);
    cursorY += 5;
    doc.text(`Kelas          : ${grade}`, margin, cursorY);
    cursorY += 5;
    doc.text(`Tanggal        : ${new Date().toLocaleDateString('id-ID')}`, margin, cursorY);
    cursorY += 5;
    doc.setLineWidth(0.5);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 10;

    // --- LOOP SOAL ---
    for (let index = 0; index < questions.length; index++) {
        const q = questions[index];

        doc.setFontSize(11);

        // 1. Siapkan Teks Soal (Wrapped)
        const qPrefix = `${index + 1}. `;
        const qLines = wrapText(q.question, contentWidth - 10);
        const qHeight = qLines.length * 5;

        // 2. Siapkan Opsi (Jika ada)
        let optionsRenderData: { text: any, height: number }[] = [];
        let totalOptionsHeight = 0;

        if (q.type === 'multiple-choice' && q.options) {
            q.options.forEach((opt, i) => {
                const optLines = wrapText(opt, contentWidth - 20);
                const optBlockHeight = optLines.length * 5;

                optionsRenderData.push({
                    text: optLines,
                    height: optBlockHeight
                });
                totalOptionsHeight += optBlockHeight;
            });
        }

        // 3. Estimasi Gambar
        let imageHeight = 0;
        let imageBase64: string | null = null;

        if (q.imagePrompt) {
            const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(q.imagePrompt + ", high quality, 4k, digital art, clear detailed vector, educational content, white background, no text, no blur")}`;
            imageBase64 = await getImageBase64(imageUrl);
            if (imageBase64) {
                imageHeight = 60; // Tinggi gambar fix di PDF
            }
        }

        // 4. Cek Page Break
        const totalBlockHeight = qHeight + totalOptionsHeight + imageHeight + 15;
        checkPageBreak(totalBlockHeight);

        // 5. Render Soal
        doc.setFont("helvetica", "bold");
        doc.text(qPrefix, margin, cursorY);

        doc.setFont("helvetica", "normal");
        doc.text(qLines, margin + 7, cursorY);
        cursorY += qHeight + 2;

        // 6. Render Gambar (Jika ada)
        if (imageBase64) {
            try {
                const imgWidth = 80;
                const imgX = margin + 7;
                doc.addImage(imageBase64, 'JPEG', imgX, cursorY, imgWidth, imageHeight);
                cursorY += imageHeight + 5;
            } catch (err) {
                console.error("Error adding image to PDF", err);
            }
        }

        // 7. Render Opsi
        if (q.type === 'multiple-choice') {
            optionsRenderData.forEach((optData, i) => {
                doc.text(`${String.fromCharCode(65 + i)}. `, margin + 12, cursorY);
                doc.text(optData.text, margin + 18, cursorY);
                cursorY += optData.height;
            });
        } else {
            cursorY += 5;
        }

        cursorY += 5; // Jarak antar nomor
    }

    // --- HALAMAN KUNCI JAWABAN ---
    doc.addPage();
    cursorY = margin;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("KUNCI JAWABAN", pageWidth / 2, cursorY, { align: "center" });
    cursorY += 15;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    questions.forEach((q, index) => {
        const answerVal = q.correctAnswer || (q as any).answer || q.explanation || "Menunggu koreksi guru";
        let answerTextRaw = "";

        if (q.type === 'multiple-choice') {
            if (typeof q.correctAnswer === 'number') {
                answerTextRaw = String.fromCharCode(65 + q.correctAnswer);
            } else {
                answerTextRaw = String(answerVal);
            }
        } else {
            answerTextRaw = String(answerVal);
        }

        const fullAnswerLine = `${index + 1}. ${answerTextRaw}`;
        const answerLines = wrapText(fullAnswerLine, contentWidth);
        const neededHeight = answerLines.length * 6;

        checkPageBreak(neededHeight);

        doc.text(answerLines, margin, cursorY);
        cursorY += neededHeight + 2;
    });

    doc.save(`soal_${subject.replace(/\s/g, '_')}_kelas_${grade}.pdf`);
};
