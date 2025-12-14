import React from 'react';
import { GraduationCap, Users, Star } from 'lucide-react';

interface GradeSelectorProps {
  selectedGrade: string;
  onGradeChange: (grade: string) => void;
}

const grades = [
  { id: 'Kelas-1', name: 'Kelas 1', level: 'C1: Mengingat & C2: Memahami', icon: Star, color: 'from-green-500 to-teal-500' },
  { id: 'Kelas-2', name: 'Kelas 2', level: 'C1: Mengingat & C2: Memahami', icon: Star, color: 'from-blue-500 to-cyan-500' },
  { id: 'Kelas-3', name: 'Kelas 3', level: 'C3: Menerapkan & C4: Menganalisis ', icon: Users, color: 'from-purple-500 to-pink-500' },
  { id: 'Kelas-4', name: 'Kelas 4', level: 'C3: Menerapkan & C4: Menganalisis ', icon: Users, color: 'from-orange-500 to-red-500' },
  { id: 'Kelas-5', name: 'Kelas 5', level: 'C4: Menganalisis, C5: Mengevaluasi, & C6: Mencipta', icon: GraduationCap, color: 'from-yellow-500 to-orange-500' },
  { id: 'Kelas-6', name: 'Kelas 6', level: 'C4: Menganalisis, C5: Mengevaluasi, & C6: Mencipta', icon: GraduationCap, color: 'from-indigo-500 to-purple-500' },
];

const GradeSelector: React.FC<GradeSelectorProps> = ({ selectedGrade, onGradeChange }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-gray-700">
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Pilih Kelas</h2>
        <p className="text-sm md:text-base text-gray-300">Tentukan tingkat kelas untuk menyesuaikan tingkat kesulitan soal</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {grades.map((grade) => {
          const Icon = grade.icon;
          return (
            <button
              key={grade.id}
              onClick={() => onGradeChange(grade.id)}
              className={`
                group relative p-4 md:p-6 rounded-xl transition-all duration-300 transform hover:scale-105
                ${selectedGrade === grade.id
                  ? 'bg-gradient-to-r ' + grade.color + ' shadow-2xl'
                  : 'bg-gray-700/50 hover:bg-gray-600/50'
                }
              `}
            >
              <div className="flex flex-col items-center">
                <div className={`
                  p-3 md:p-4 rounded-full mb-3 md:mb-4 transition-all duration-300
                  ${selectedGrade === grade.id
                    ? 'bg-white/20'
                    : 'bg-gray-600 group-hover:bg-gray-500'
                  }
                `}>
                  <Icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-1">
                  {grade.name}
                </h3>
                <p className="text-xs md:text-sm text-gray-300">
                  {grade.level}
                </p>
              </div>

              {selectedGrade === grade.id && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GradeSelector;