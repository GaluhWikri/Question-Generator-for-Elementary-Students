import React from 'react';
import { Star, Check, Sparkles } from 'lucide-react';

interface GradeSelectorProps {
  selectedGrade: string;
  onGradeChange: (grade: string) => void;
}

const grades = [
  {
    id: 'Kelas-1',
    name: 'Kelas 1',
    level: 'Mengingat & Memahami',
    cognitive: 'C1 - C2',
    gradient: 'from-green-500 to-emerald-400',
    bgGlow: 'bg-green-500',
    emoji: '🌱'
  },
  {
    id: 'Kelas-2',
    name: 'Kelas 2',
    level: 'Mengingat & Memahami',
    cognitive: 'C1 - C2',
    gradient: 'from-cyan-500 to-blue-400',
    bgGlow: 'bg-cyan-500',
    emoji: '🌿'
  },
  {
    id: 'Kelas-3',
    name: 'Kelas 3',
    level: 'Menerapkan & Menganalisis',
    cognitive: 'C3 - C4',
    gradient: 'from-purple-500 to-pink-400',
    bgGlow: 'bg-purple-500',
    emoji: '🌳'
  },
  {
    id: 'Kelas-4',
    name: 'Kelas 4',
    level: 'Menerapkan & Menganalisis',
    cognitive: 'C3 - C4',
    gradient: 'from-orange-500 to-rose-400',
    bgGlow: 'bg-orange-500',
    emoji: '🎯'
  },
  {
    id: 'Kelas-5',
    name: 'Kelas 5',
    level: 'Menganalisis, Mengevaluasi & Mencipta',
    cognitive: 'C4 - C6',
    gradient: 'from-yellow-500 to-amber-400',
    bgGlow: 'bg-yellow-500',
    emoji: '⭐'
  },
  {
    id: 'Kelas-6',
    name: 'Kelas 6',
    level: 'Menganalisis, Mengevaluasi & Mencipta',
    cognitive: 'C4 - C6',
    gradient: 'from-indigo-500 to-violet-400',
    bgGlow: 'bg-indigo-500',
    emoji: '🏆'
  },
];

const GradeSelector: React.FC<GradeSelectorProps> = ({ selectedGrade, onGradeChange }) => {
  return (
    <div className="glass-card p-6 md:p-10 animate-fade-in-up">
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3">
          Pilih <span className="gradient-text">Tingkat Kelas</span>
        </h2>
        <p className="text-gray-400 text-sm md:text-base max-w-lg mx-auto">
          Tentukan tingkat kelas untuk menyesuaikan kompleksitas soal dengan kemampuan kognitif siswa
        </p>
      </div>

      {/* Grade Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {grades.map((grade, index) => {
          const isSelected = selectedGrade === grade.id;

          return (
            <button
              key={grade.id}
              onClick={() => onGradeChange(grade.id)}
              className={`
                group relative p-5 md:p-6 rounded-2xl transition-all duration-500 transform text-left
                ${isSelected
                  ? 'scale-[1.02] -translate-y-1'
                  : 'hover:scale-[1.02] hover:-translate-y-1'
                }
              `}
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              {/* Background */}
              <div className={`
                absolute inset-0 rounded-2xl transition-all duration-500
                ${isSelected
                  ? `bg-gradient-to-br ${grade.gradient} opacity-100`
                  : 'bg-slate-800/60 group-hover:bg-slate-700/70'
                }
              `} />

              {/* Glow Effect */}
              <div className={`
                absolute inset-0 rounded-2xl blur-xl transition-opacity duration-500
                ${isSelected ? `${grade.bgGlow}/30 opacity-100` : 'opacity-0'}
              `} />

              {/* Border */}
              <div className={`
                absolute inset-0 rounded-2xl border-2 transition-all duration-300
                ${isSelected
                  ? 'border-white/30'
                  : 'border-transparent group-hover:border-white/10'
                }
              `} />

              {/* Content */}
              <div className="relative z-10">
                {/* Top Row: Icon + Name */}
                <div className="flex items-center gap-4 mb-4">
                  {/* Icon Container */}
                  <div className={`
                    w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shrink-0
                    ${isSelected
                      ? 'bg-white/20 shadow-lg'
                      : 'bg-slate-700/50 group-hover:bg-slate-600/60'
                    }
                  `}>
                    <Star className={`w-7 h-7 ${isSelected ? 'text-white fill-white' : 'text-yellow-400 fill-yellow-400/30'}`} />
                  </div>

                  {/* Grade Name & Cognitive Level */}
                  <div className="min-w-0">
                    <h3 className={`
                      text-lg md:text-xl font-bold transition-colors duration-300
                      ${isSelected ? 'text-white' : 'text-gray-200 group-hover:text-white'}
                    `}>
                      {grade.name}
                    </h3>
                    <span className={`
                      inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium
                      ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-600/50 text-gray-400'}
                    `}>
                      <Sparkles className="w-3 h-3" />
                      {grade.cognitive}
                    </span>
                  </div>
                </div>

                {/* Level Description */}
                <p className={`
                  text-sm leading-relaxed transition-colors duration-300
                  ${isSelected ? 'text-white/80' : 'text-gray-400 group-hover:text-gray-300'}
                `}>
                  {grade.level}
                </p>
              </div>

              {/* Selection Check */}
              {isSelected && (
                <div className="absolute top-4 right-4 z-20 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg animate-scale-in">
                  <Check className="w-4 h-4 text-slate-800" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GradeSelector;