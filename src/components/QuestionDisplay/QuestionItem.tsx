import { Question } from '../../types/Question';
import { CheckCircle } from 'lucide-react';
import ImageWithLoader from './ImageWithLoader';

interface QuestionItemProps {
    question: Question;
    index: number;
    showAnswers: boolean;
}

const QuestionItem = ({ question: q, index, showAnswers }: QuestionItemProps) => {
    return (
        <div className="p-4 md:p-6 bg-slate-800/50 rounded-xl shadow-lg transition-all hover:bg-slate-800/80">
            <p className="font-semibold mb-3 md:mb-4 text-base md:text-lg">
                <span className="text-purple-400 mr-2">{index + 1}.</span>{q.question}
            </p>

            {q.imagePrompt && <ImageWithLoader prompt={q.imagePrompt} />}

            {q.type === 'multiple-choice' && q.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 text-sm">
                    {q.options.map((option, i) => (
                        <div key={i} className={`p-2 md:p-3 rounded-md border transition-all flex items-center justify-between ${showAnswers && i === q.correctAnswer ? 'bg-green-500/20 border-green-500 text-white' : 'bg-slate-700/50 border-slate-600 text-gray-300'}`}>
                            <div className="flex-1">
                                <span className={`font-mono mr-2 ${showAnswers && i === q.correctAnswer ? 'text-green-400' : 'text-gray-500'}`}>{String.fromCharCode(65 + i)}.</span>
                                <span>{option}</span>
                            </div>
                            {showAnswers && i === q.correctAnswer && (
                                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-400 shrink-0 ml-2" />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {showAnswers && q.type === 'fill-in-the-blank' && (
                <div className="mt-2">
                    <p className="text-xs md:text-sm text-gray-400">Kunci Jawaban:</p>
                    <p className="p-2 md:p-3 rounded-md bg-green-500/20 border border-green-500 text-white italic text-sm">
                        {q.correctAnswer || (q as any).answer || q.explanation || "Jawaban tidak tersedia"}
                    </p>
                </div>
            )}

            {showAnswers && q.type === 'essay' && (
                <div className="mt-2">
                    <p className="text-xs md:text-sm text-gray-400">Panduan Jawaban:</p>
                    <p className="p-2 md:p-3 rounded-md bg-green-500/20 border border-green-500 text-gray-300 text-sm">
                        {q.correctAnswer || (q as any).answer || q.explanation || "Jawaban tidak tersedia"}
                    </p>
                </div>
            )}
        </div>
    );
};

export default QuestionItem;
