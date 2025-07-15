import React from 'react';
import { BookOpen, Calculator, Globe, FlaskRound as Flask, Palette, Music } from 'lucide-react';

interface SubjectSelectorProps {
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
}

const subjects = [
  { id: 'matematika', name: 'Matematika', icon: Calculator, color: 'from-blue-500 to-cyan-500' },
  { id: 'bahasa-indonesia', name: 'Bahasa Indonesia', icon: BookOpen, color: 'from-green-500 to-emerald-500' },
  { id: 'ipa', name: 'IPA', icon: Flask, color: 'from-purple-500 to-pink-500' },
  { id: 'ips', name: 'IPS', icon: Globe, color: 'from-orange-500 to-red-500' },
  { id: 'seni-budaya', name: 'Seni Budaya', icon: Palette, color: 'from-yellow-500 to-orange-500' },
  { id: 'pjok', name: 'PJOK', icon: Music, color: 'from-indigo-500 to-purple-500' },
];

const SubjectSelector: React.FC<SubjectSelectorProps> = ({ selectedSubject, onSubjectChange }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Pilih Mata Pelajaran</h2>
        <p className="text-gray-300">Pilih mata pelajaran yang ingin dibuatkan soalnya</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => {
          const Icon = subject.icon;
          return (
            <button
              key={subject.id}
              onClick={() => onSubjectChange(subject.id)}
              className={`
                group relative p-6 rounded-xl transition-all duration-300 transform hover:scale-105
                ${selectedSubject === subject.id 
                  ? 'bg-gradient-to-r ' + subject.color + ' shadow-2xl' 
                  : 'bg-gray-700/50 hover:bg-gray-600/50'
                }
              `}
            >
              <div className="flex flex-col items-center">
                <div className={`
                  p-4 rounded-full mb-4 transition-all duration-300
                  ${selectedSubject === subject.id 
                    ? 'bg-white/20' 
                    : 'bg-gray-600 group-hover:bg-gray-500'
                  }
                `}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white text-center">
                  {subject.name}
                </h3>
              </div>
              
              {selectedSubject === subject.id && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SubjectSelector;