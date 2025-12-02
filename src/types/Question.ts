export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number | string; // Diperbarui: Mendukung indeks (PG) atau string (Isian/Uraian)
  type: 'multiple-choice' | 'fill-in-the-blank' | 'essay'; // Baru: Menentukan jenis soal
  subject: string;
  grade: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}