import { Question } from '../../types/Question';
import { CheckCircle, Circle } from 'lucide-react';
import ImageWithLoader from './ImageWithLoader';

interface QuestionItemProps {
    question: Question;
    index: number;
    showAnswers: boolean;
}

const QuestionItem = ({ question: q, index, showAnswers }: QuestionItemProps) => {
    return (
        <div
            className="question-card animate-fade-in-up"
            style={{ animationDelay: `${index * 0.05}s` }}
        >
            {/* Question Header */}
            <div className="flex items-start gap-4 mb-5">
                <div className="question-number shrink-0">
                    {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-base md:text-lg leading-relaxed">
                        {q.question}
                    </p>
                    {/* Question Type Badge */}
                    <span className={`
                        inline-block mt-3 px-2.5 py-1 rounded-lg text-xs font-medium
                        ${q.type === 'multiple-choice' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' :
                            q.type === 'fill-in-the-blank' ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20' :
                                'bg-purple-500/15 text-purple-400 border border-purple-500/20'
                        }
                    `}>
                        {q.type === 'multiple-choice' ? '📝 Pilihan Ganda' :
                            q.type === 'fill-in-the-blank' ? '✏️ Isian Singkat' :
                                '📖 Uraian'}
                    </span>
                </div>
            </div>

            {/* Image if exists */}
            {q.imagePrompt && <ImageWithLoader prompt={q.imagePrompt} />}

            {/* Multiple Choice Options */}
            {q.type === 'multiple-choice' && q.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    {q.options.map((option, i) => {
                        const isCorrect = showAnswers && i === q.correctAnswer;
                        return (
                            <div
                                key={i}
                                className={`
                                    relative p-3.5 md:p-4 rounded-xl border transition-all duration-300 flex items-center gap-3
                                    ${isCorrect
                                        ? 'bg-gradient-to-r from-emerald-500/15 to-teal-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                                        : 'bg-slate-800/50 border-slate-600/50 hover:border-slate-500/70'
                                    }
                                `}
                            >
                                {/* Option Letter Circle */}
                                <div className={`
                                    w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0
                                    ${isCorrect
                                        ? 'bg-emerald-500/30 text-emerald-300'
                                        : 'bg-slate-700/70 text-gray-400'
                                    }
                                `}>
                                    {String.fromCharCode(65 + i)}
                                </div>

                                {/* Option Text */}
                                <span className={`flex-1 text-sm ${isCorrect ? 'text-white font-medium' : 'text-gray-300'}`}>
                                    {option}
                                </span>

                                {/* Correct Icon */}
                                {isCorrect && (
                                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 animate-scale-in" />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Fill in Blank Answer */}
            {showAnswers && q.type === 'fill-in-the-blank' && (
                <div className="mt-5 animate-fade-in">
                    <p className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        Kunci Jawaban
                    </p>
                    <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/15 to-teal-500/10 border border-emerald-500/30">
                        <p className="text-emerald-300 font-medium">
                            {q.correctAnswer || (q as any).answer || q.explanation || "Jawaban tidak tersedia"}
                        </p>
                    </div>
                </div>
            )}

            {/* Essay Answer */}
            {showAnswers && q.type === 'essay' && (
                <div className="mt-5 animate-fade-in">
                    <p className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        Panduan Jawaban
                    </p>
                    <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/15 to-teal-500/10 border border-emerald-500/30">
                        <p className="text-gray-300 text-sm leading-relaxed">
                            {q.correctAnswer || (q as any).answer || q.explanation || "Jawaban tidak tersedia"}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionItem;
