import React from 'react';
import { BookOpen, Calculator, Globe, FlaskRound as Flask, Palette, Dumbbell, Languages, Flag, Check } from 'lucide-react';

interface SubjectSelectorProps {
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
}

const subjects = [
  { id: 'Matematika', name: 'Matematika', icon: Calculator, gradient: 'from-blue-500 to-cyan-400', bgGlow: 'bg-blue-500' },
  { id: 'Bahasa-indonesia', name: 'Bahasa Indonesia', icon: BookOpen, gradient: 'from-emerald-500 to-teal-400', bgGlow: 'bg-emerald-500' },
  { id: 'Bahasa-inggris', name: 'Bahasa Inggris', icon: Languages, gradient: 'from-indigo-500 to-blue-400', bgGlow: 'bg-indigo-500' },
  { id: 'pendidikan-pancasila', name: 'Pendidikan Pancasila', icon: Flag, gradient: 'from-amber-500 to-orange-400', bgGlow: 'bg-amber-500' },
  { id: 'IPA', name: 'IPA', icon: Flask, gradient: 'from-purple-500 to-pink-400', bgGlow: 'bg-purple-500' },
  { id: 'IPS', name: 'IPS', icon: Globe, gradient: 'from-rose-500 to-orange-400', bgGlow: 'bg-rose-500' },
  { id: 'seni-budaya', name: 'Seni Budaya', icon: Palette, gradient: 'from-yellow-500 to-amber-400', bgGlow: 'bg-yellow-500' },
  { id: 'PJOK', name: 'PJOK', icon: Dumbbell, gradient: 'from-violet-500 to-purple-400', bgGlow: 'bg-violet-500' },
];

const SubjectSelector: React.FC<SubjectSelectorProps> = ({ selectedSubject, onSubjectChange }) => {
  return (
    <div className="glass-card p-6 md:p-10 animate-fade-in-up">
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3">
          Pilih <span className="gradient-text">Mata Pelajaran</span>
        </h2>
        <p className="text-gray-400 text-sm md:text-base max-w-md mx-auto">
          Pilih mata pelajaran yang ingin dibuatkan soalnya oleh AI
        </p>
      </div>

      {/* Subject Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
        {subjects.map((subject, index) => {
          const Icon = subject.icon;
          const isSelected = selectedSubject === subject.id;

          return (
            <button
              key={subject.id}
              onClick={() => onSubjectChange(subject.id)}
              className={`
                group relative p-5 md:p-6 rounded-2xl transition-all duration-500 transform
                ${isSelected
                  ? 'scale-[1.02] -translate-y-1'
                  : 'hover:scale-[1.02] hover:-translate-y-1'
                }
              `}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Background */}
              <div className={`
                absolute inset-0 rounded-2xl transition-all duration-500
                ${isSelected
                  ? `bg-gradient-to-br ${subject.gradient} opacity-100`
                  : 'bg-slate-800/60 group-hover:bg-slate-700/70'
                }
              `} />

              {/* Glow Effect */}
              <div className={`
                absolute inset-0 rounded-2xl blur-xl transition-opacity duration-500
                ${isSelected ? `${subject.bgGlow}/30 opacity-100` : 'opacity-0'}
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
              <div className="relative z-10 flex flex-col items-center">
                {/* Icon Container */}
                <div className={`
                  w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300
                  ${isSelected
                    ? 'bg-white/20 shadow-lg'
                    : 'bg-slate-700/50 group-hover:bg-slate-600/60'
                  }
                `}>
                  <Icon className={`
                    w-7 h-7 md:w-8 md:h-8 transition-all duration-300
                    ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}
                  `} />
                </div>

                {/* Subject Name */}
                <h3 className={`
                  text-sm md:text-base font-semibold text-center transition-colors duration-300
                  ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}
                `}>
                  {subject.name}
                </h3>
              </div>

              {/* Selection Check */}
              {isSelected && (
                <div className="absolute top-3 right-3 z-20 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg animate-scale-in">
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

export default SubjectSelector;