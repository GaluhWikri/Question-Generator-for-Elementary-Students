import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import SubjectSelector from './components/SubjectSelector';
import GradeSelector from './components/GradeSelector';
import PromptBuilder from './components/PromptBuilder';
import QuestionGenerator from './components/QuestionGenerator';
import QuestionDisplay from './components/QuestionDisplay';
import FeedbackButton from './components/FeedbackButton'; // Import component
import { Question } from './types/Question';

function App() {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [requestedDifficulty, setRequestedDifficulty] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // BARU: State untuk menyimpan Base64 content dan tipe file
  const [materialData, setMaterialData] = useState<{ content: string, type: string } | null>(null);
  const [fileName, setFileName] = useState('');

  // PERBAIKAN: Mengubah parameter agar sesuai dengan data yang dikirim
  const handleGenerateQuestions = async (userPrompt: string, material: { content: string, type: string } | null) => {
    setIsGenerating(true);
    setQuestions([]);

    try {
      // --- PERBAIKAN KRUSIAL UNTUK DEPLOYMENT ---
      // Gunakan variabel lingkungan untuk base URL, atau gunakan path relatif untuk produksi.
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const apiUrl = `${apiBaseUrl}/api/generate`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // PERBAIKAN: Mengirim data dengan format baru yang diharapkan backend
        body: JSON.stringify({
          subject: selectedSubject,
          grade: selectedGrade,
          userPrompt: userPrompt,
          materialData: material
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let friendlyErrorMessage = data?.error?.message || 'Terjadi error yang tidak diketahui.';
        if (String(friendlyErrorMessage).toLowerCase().includes('service unavailable')) {
          friendlyErrorMessage = "Layanan AI sedang sibuk atau tidak tersedia. Silakan coba lagi dalam beberapa saat.";
        }
        // Tambahkan penanganan error khusus dari backend saat parsing file
        if (friendlyErrorMessage.includes('Gagal memproses file')) {
          throw new Error(friendlyErrorMessage);
        }
        throw new Error(friendlyErrorMessage);
      }

      if (data.questions && Array.isArray(data.questions)) {
        setQuestions(data.questions);
        setCurrentStep(4);
        setIsSidebarOpen(false); // Close sidebar on mobile when results arrive
      } else {
        throw new Error("Format respons dari server tidak valid.");
      }

    } catch (error) {
      console.error('Error generating questions:', error);
      if (error instanceof Error) {
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          alert("Gagal terhubung ke server backend. Pastikan server backend Anda berjalan dan variabel VITE_API_BASE_URL sudah benar.");
        } else {
          alert(`Gagal membuat soal: ${error.message}`);
        }
      } else {
        alert("Gagal membuat soal karena error tak terduga.");
      }
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
    setRequestedDifficulty('');
    // BARU: Reset state materi
    setMaterialData(null);
    setFileName('');
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen supports-[height:100dvh]:h-[100dvh] bg-slate-900 text-white overflow-hidden">

      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-gray-800 z-50 shrink-0 absolute top-0 left-0 right-0">
        <div className="flex items-center gap-3">
          <img src="/icon/icon1.png" alt="Logo" className="w-8 h-8" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
            SOAL GW
          </span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-gray-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-gray-800 flex flex-col transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:shrink-0 pt-20 md:pt-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 border-b border-gray-800 hidden md:block">
          <div className="flex items-center gap-3">
            <img src="/icon/icon1.png" alt="Logo" className="w-10 h-10" />
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
              SOAL GW
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Buat soal berkualitas untuk anak SD </p>
        </div>

        {/* Mobile-only header inside sidebar to align items (optional, usually overlay is enough but adding logo here is nice if needed, skipping for cleaner look) */}

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2 no-scrollbar">
          {[
            { step: 1, label: 'Mata Pelajaran', icon: 'item-1' },
            { step: 2, label: 'Pilih Kelas', icon: 'item-2' },
            { step: 3, label: 'Pengaturan', icon: 'item-3' },
            { step: 4, label: 'Hasil Soal', icon: 'item-4' },
          ].map((item) => (
            <button
              key={item.step}
              onClick={() => {
                if (item.step <= currentStep || (questions.length > 0 && item.step === 4)) {
                  // Only close sidebar on mobile if clicking a link
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }
              }}
              disabled={item.step > currentStep && questions.length === 0}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200
                ${currentStep === item.step
                  ? 'bg-purple-600/10 text-purple-400 border border-purple-600/20'
                  : item.step < currentStep
                    ? 'text-green-400 hover:bg-slate-800'
                    : 'text-gray-500 cursor-not-allowed'
                }
              `}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-colors
                ${currentStep === item.step
                  ? 'border-purple-500 bg-purple-500 text-white shadow-[0_0_10px_purple]'
                  : item.step < currentStep
                    ? 'border-green-500 bg-green-500/20 text-green-400'
                    : 'border-slate-700 bg-slate-800 text-slate-500'
                }
              `}>
                {item.step < currentStep ? '✓' : item.step}
              </div>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* FEEDBACK BUTTON IN SIDEBAR */}
        <div className="px-3 pb-2 shrink-0">
          <FeedbackButton />
        </div>

        <div className="p-6 border-t border-gray-800 shrink-0">
          <div className="space-y-1 opacity-50 hover:opacity-100 transition-opacity duration-300">
            <p className="text-xs text-gray-400">Developed by</p>
            <p className="text-xs font-semibold text-gray-300">Galuh Wikri Ramadhan</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900 relative pt-24 md:pt-0">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-900 to-blue-900/20 pointer-events-none" />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 md:py-8 relative z-10 no-scrollbar">
          <div className={`max-w-5xl mx-auto h-full flex flex-col justify-start md:${currentStep === 4 ? 'justify-start pt-4' : 'justify-center'} min-h-[500px]`}>
            {currentStep === 1 && <SubjectSelector selectedSubject={selectedSubject} onSubjectChange={setSelectedSubject} />}
            {currentStep === 2 && <GradeSelector selectedGrade={selectedGrade} onGradeChange={setSelectedGrade} />}
            {currentStep === 3 && <PromptBuilder
              customPrompt={customPrompt}
              onPromptChange={setCustomPrompt}
              onDifficultyChange={setRequestedDifficulty}
              materialData={materialData}
              onMaterialDataChange={setMaterialData}
              fileName={fileName}
              onFileNameChange={setFileName}
            />}
            {currentStep === 4 && <QuestionDisplay
              questions={questions}
              isGenerating={isGenerating}
              onRegenerateQuestions={() => handleGenerateQuestions(customPrompt, materialData)}
              prompt={customPrompt}
              requestedDifficulty={requestedDifficulty}
              subject={selectedSubject}
              grade={selectedGrade}
            />}
          </div>
        </div>

        {/* Fixed Bottom Action Bar */}
        <div className="p-4 md:p-6 bg-slate-900/80 backdrop-blur-md border-t border-gray-800 shrink-0 relative z-20 flex justify-end gap-3 md:gap-4">
          {currentStep > 1 && currentStep < 4 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 md:px-6 py-2 md:py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors border border-slate-700 text-sm md:text-base"
            >
              Kembali
            </button>
          )}

          {currentStep < 3 && (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceedToNext()}
              className={`px-6 md:px-8 py-2 md:py-3 rounded-xl font-bold shadow-lg transition-all transform hover:scale-105 text-sm md:text-base ${canProceedToNext()
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-purple-500/25'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
            >
              Lanjutkan
            </button>
          )}

          {currentStep === 3 && (
            <div className="w-full max-w-xs">
              <QuestionGenerator
                onGenerateQuestions={() => handleGenerateQuestions(customPrompt, materialData)}
                isGenerating={isGenerating}
                disabled={!canProceedToNext()}
                prompt={customPrompt}
              />
            </div>
          )}

          {currentStep === 4 && (
            <button
              onClick={resetForm}
              className="px-6 md:px-8 py-2 md:py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-green-900/20 transition-all transform hover:scale-105 text-sm md:text-base"
            >
              Buat Soal Baru
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;