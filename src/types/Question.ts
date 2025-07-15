export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  subject: string;
  grade: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}