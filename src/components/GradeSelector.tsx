import React from 'react';
import { GraduationCap, Users, Star } from 'lucide-react';

interface GradeSelectorProps {
  selectedGrade: string;
  onGradeChange: (grade: string) => void;
}

const grades = [
  { id: 'Kelas-1', name: 'Kelas 1', level: 'Pemula', icon: Star, color: 'from-green-500 to-teal-500' },
  { id: 'Kelas-2', name: 'Kelas 2', level: 'Dasar', icon: Star, color: 'from-blue-500 to-cyan-500' },
  { id: 'Kelas-3', name: 'Kelas 3', level: 'Dasar', icon: Users, color: 'from-purple-500 to-pink-500' },
  { id: 'Kelas-4', name: 'Kelas 4', level: 'Menengah', icon: Users, color: 'from-orange-500 to-red-500' },
  { id: 'Kelas-5', name: 'Kelas 5', level: 'Menengah', icon: GraduationCap, color: 'from-yellow-500 to-orange-500' },
  { id: 'Kelas-6', name: 'Kelas 6', level: 'Lanjutan', icon: GraduationCap, color: 'from-indigo-500 to-purple-500' },
];

const GradeSelector: React.FC<GradeSelectorProps> = ({ selectedGrade, onGradeChange }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Pilih Kelas</h2>
        <p className="text-gray-300">Tentukan tingkat kelas untuk menyesuaikan tingkat kesulitan soal</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {grades.map((grade) => {
          const Icon = grade.icon;
          return (
            <button
              key={grade.id}
              onClick={() => onGradeChange(grade.id)}
              className={`
                group relative p-6 rounded-xl transition-all duration-300 transform hover:scale-105
                ${selectedGrade === grade.id 
                  ? 'bg-gradient-to-r ' + grade.color + ' shadow-2xl' 
                  : 'bg-gray-700/50 hover:bg-gray-600/50'
                }
              `}
            >
              <div className="flex flex-col items-center">
                <div className={`
                  p-4 rounded-full mb-4 transition-all duration-300
                  ${selectedGrade === grade.id 
                    ? 'bg-white/20' 
                    : 'bg-gray-600 group-hover:bg-gray-500'
                  }
                `}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {grade.name}
                </h3>
                <p className="text-sm text-gray-300">
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