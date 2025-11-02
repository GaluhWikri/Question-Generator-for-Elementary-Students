// src/App.tsx

import React, { useState } from 'react';
import { Brain } from 'lucide-react';
import SubjectSelector from './components/SubjectSelector';
import GradeSelector from './components/GradeSelector';
import PromptBuilder from './components/PromptBuilder';
import QuestionGenerator from './components/QuestionGenerator';
import QuestionDisplay from './components/QuestionDisplay';
import { Question } from './types/Question';

// Tentukan base URL untuk backend
// Gunakan environment variable VITE_API_BASE_URL (dari .env atau platform deployment)
// Default ke 'http://localhost:4000' untuk pengembangan lokal
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';


function App() {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleGenerateQuestions = async (prompt: string) => {
    setIsGenerating(true);
    setQuestions([]);
    
    try {
      // Menggunakan Base URL yang sudah didefinisikan secara dinamis
      const apiEndpoint = `${API_BASE_URL}/api/generate`;
      console.log('Mengirim permintaan ke:', apiEndpoint);

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // Menambahkan mode 'cors' secara eksplisit (walaupun default)
          // dan memastikan headers yang diperlukan sudah ada.
        },
        body: JSON.stringify({ prompt }),
      });

      // Jika koneksi berhasil tapi status bukan OK
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let friendlyErrorMessage = errorData?.error?.message || `Server merespons dengan status ${response.status}.`;
        
        if (response.status === 500 && String(friendlyErrorMessage).toLowerCase().includes('failed:')) {
           friendlyErrorMessage = "Gagal memproses permintaan di server backend (masalah API key atau logika).";
        }

        throw new Error(friendlyErrorMessage);
      }

      const data = await response.json();

      if (data.questions && Array.isArray(data.questions)) {
        // Tambahkan ID unik untuk setiap soal jika belum ada (berguna untuk React key)
        const questionsWithId = data.questions.map((q: any) => ({
          ...q,
          id: q.id || crypto.randomUUID(),
        }));
        setQuestions(questionsWithId);
        setCurrentStep(4);
      } else {
        throw new Error("Format respons dari server tidak valid. Kunci 'questions' tidak ditemukan.");
      }
      
    } catch (error) {
      console.error('Error generating questions:', error);
      
      let alertMessage = `Gagal membuat soal: ${error instanceof Error ? error.message : String(error)}`;
      
      // Deteksi kegagalan jaringan (Failed to fetch)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          alertMessage = `Gagal terhubung ke server backend di ${API_BASE_URL}. Pastikan server backend Anda berjalan dan variabel lingkungan VITE_API_BASE_URL sudah benar.`;
      }
      
      // Ganti alert dengan implementasi UI yang lebih baik di aplikasi nyata
      alert(alertMessage); 
      
    } finally {
      setIsGenerating(false);
    }
  };

  const canProceedToNext = () => {
    if (currentStep === 1) return selectedSubject !== '';
    if (currentStep === 2) return selectedGrade !== '';
    if (currentStep === 3) return customPrompt !== '';
    return false;
  };

  const resetForm = () => {
    setSelectedSubject('');
    setSelectedGrade('');
    setCustomPrompt('');
    setQuestions([]);
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">AI Question Generator</h1>
          </div>
          <p className="text-gray-300 text-base sm:text-lg">
            Buat soal-soal berkualitas untuk anak SD dengan bantuan AI
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-2 sm:space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${currentStep >= step ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gray-700 text-gray-400'}`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-8 sm:w-16 h-1 mx-2 ${currentStep > step ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gray-700'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {currentStep === 1 && <SubjectSelector selectedSubject={selectedSubject} onSubjectChange={setSelectedSubject} />}
          {currentStep === 2 && <GradeSelector selectedGrade={selectedGrade} onGradeChange={setSelectedGrade} />}
          {currentStep === 3 && <PromptBuilder customPrompt={customPrompt} onPromptChange={setCustomPrompt} subject={selectedSubject} grade={selectedGrade} />}
          
          {currentStep === 4 && <QuestionDisplay 
            questions={questions} 
            isGenerating={isGenerating} 
            onRegenerateQuestions={() => handleGenerateQuestions(customPrompt)}
            prompt={customPrompt} 
          />}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center mt-12 gap-4">
          {currentStep > 1 && currentStep < 4 && (
            <button onClick={() => setCurrentStep(currentStep - 1)} className="w-full sm:w-auto px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors">
              Kembali
            </button>
          )}
          {currentStep < 3 && (
            <button onClick={() => setCurrentStep(currentStep + 1)} disabled={!canProceedToNext()} className={`w-full sm:w-auto px-6 py-3 rounded-lg font-medium transition-colors ${canProceedToNext() ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}>
              Lanjutkan
            </button>
          )}
          {currentStep === 3 && <QuestionGenerator onGenerateQuestions={() => handleGenerateQuestions(customPrompt)} isGenerating={isGenerating} disabled={!canProceedToNext()} prompt={customPrompt} />}
          {currentStep === 4 && (
            <button onClick={resetForm} className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg font-medium transition-colors">
              Buat Soal Baru
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
