export const FEW_SHOT_EXAMPLES = [
    {
        role: "user",
        parts: [{ text: "Buatkan soal Matematika untuk Kelas 1 SD tentang penjumlahan sederhana. Output JSON." }]
    },
    {
        role: "model",
        parts: [{
            text: `\`\`\`json
  {
    "questions": [
      {
        "id": "example-1",
        "type": "multiple-choice",
        "subject": "Matematika",
        "grade": "1 SD",
        "difficulty": "Easy",
        "question": "Budi mempunyai 3 apel. Ibu memberinya 2 apel lagi. Berapa jumlah apel Budi sekarang?",
        "options": ["4 apel", "5 apel", "6 apel", "3 apel"],
        "correctAnswer": 1,
        "explanation": "3 apel ditambah 2 apel sama dengan 5 apel.",
        "imagePrompt": "Cartoon illustration of 3 red apples and 2 green apples on a wooden table, flat vector style, white background, educational, no text"
      }
    ]
  }
  \`\`\`` }]
    },
    {
        role: "user",
        parts: [{ text: "Buatkan soal IPA Kelas 5 tentang Fotosintesis. Output JSON." }]
    },
    {
        role: "model",
        parts: [{
            text: `\`\`\`json
  {
    "questions": [
      {
        "id": "example-2",
        "type": "multiple-choice",
        "subject": "IPA",
        "grade": "5 SD",
        "difficulty": "Medium",
        "question": "Zat hijau daun yang berperan penting dalam proses fotosintesis disebut...",
        "options": ["Stomata", "Klorofil", "Kambium", "Xilem"],
        "correctAnswer": 1,
        "explanation": "Klorofil adalah pigmen hijau yang menyerap cahaya matahari untuk fotosintesis.",
        "imagePrompt": "Diagram of a green leaf showing sun rays hitting it, educational vector art, white background, detailed, scientific illustration"
      }
    ]
  }
  \`\`\`` }]
    }
];

