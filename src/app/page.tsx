'use client';

import { useState } from 'react';
import { Menu, X, Sparkles } from 'lucide-react';
import FAQModal from '@/components/FAQSection';
import Sidebar from '@/components/Sidebar';
import StepRenderer from '@/components/StepRenderer';
import ActionBar from '@/components/ActionBar';
import LandingPage from '@/components/LandingPage';
import { useQuestionGenerator } from '@/hooks/useQuestionGenerator';

export default function Home() {
  // State untuk menentukan apakah menampilkan landing page atau app
  const [showApp, setShowApp] = useState(false);

  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');

  // Custom Hook: Logic for API & Questions State
  const { questions, isGenerating, isAppending, generateQuestions, clearQuestions } = useQuestionGenerator();

  const [currentStep, setCurrentStep] = useState(1);
  const [requestedDifficulty, setRequestedDifficulty] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFAQOpen, setIsFAQOpen] = useState(false);

  const [materialData, setMaterialData] = useState<{ content: string, type: string } | null>(null);
  const [fileName, setFileName] = useState('');

  // Wrapper for Generation Logic (Connecting UI to Hook)
  const handleWrapperGenerate = async (
    userPrompt: string,
    material: { content: string, type: string } | null,
    isAppendMode: boolean = false
  ) => {

    const success = await generateQuestions({
      subject: selectedSubject,
      grade: selectedGrade,
      userPrompt,
      materialData: material,
      isAppendMode
    });

    if (success && !isAppendMode) {
      setCurrentStep(4);
      setIsSidebarOpen(false);
    }
  };

  // Navigation Logic
  const canProceedToNext = () => {
    if (currentStep === 1) return selectedSubject !== '';
    if (currentStep === 2) return selectedGrade !== '';
    if (currentStep === 3) return customPrompt !== '';
    return false;
  };

  const handleNext = () => setCurrentStep(prev => prev + 1);
  const handleBack = () => setCurrentStep(prev => prev - 1);

  const resetForm = () => {
    setSelectedSubject('');
    setSelectedGrade('');
    setCustomPrompt('');
    clearQuestions();
    setCurrentStep(1);
    setRequestedDifficulty('');
    setMaterialData(null);
    setFileName('');
    setIsSidebarOpen(false);
  };

  // Navigasi via Sidebar
  const handleStepNavigation = (step: number) => {
    setCurrentStep(step);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  // Jika belum masuk app, tampilkan landing page
  if (!showApp) {
    return <LandingPage onStartApp={() => setShowApp(true)} />;
  }

  // Tampilan App utama
  return (
    <div className="flex flex-col md:flex-row h-screen supports-[height:100dvh]:h-[100dvh] overflow-hidden relative">

      {/* Animated Background */}
      <div className="animated-bg" />

      {/* Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] left-[5%] w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-[60%] right-[10%] w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] left-[30%] w-64 h-64 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      {/* MOBILE HEADER */}
      <header className="md:hidden flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 z-50 shrink-0 fixed top-0 left-0 right-0">
        <button
          onClick={() => {
            resetForm();
            setShowApp(false);
          }}
          className="flex items-center gap-3"
        >
          <div className="relative">
            <img src="/icon/icon1.png" alt="Logo" className="w-10 h-10 relative z-10" />
            <div className="absolute inset-0 bg-purple-500/30 blur-lg rounded-full" />
          </div>
          <span className="text-xl font-bold gradient-text">
            Soal.gw
          </span>
        </button>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2.5 text-gray-300 hover:text-white bg-slate-800/60 hover:bg-slate-700/80 rounded-xl transition-all duration-300 border border-white/5"
        >
          {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-md animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        currentStep={currentStep}
        setCurrentStep={handleStepNavigation}
        hasQuestions={questions.length > 0}
        onOpenFAQ={() => setIsFAQOpen(true)}
        onGoHome={() => {
          resetForm();
          setShowApp(false);
        }}
      />

      {/* MAIN CONTENT + ACTION BAR */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10 pt-[72px] md:pt-0">

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-12 py-6 md:py-8 custom-scrollbar">
          <div className="max-w-5xl mx-auto pb-6">

            {/* Step Title for non-result pages */}
            {currentStep !== 4 && (
              <div className="text-center mb-6 md:mb-10 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm font-medium mb-4">
                  <Sparkles className="w-4 h-4" />
                  <span>Langkah {currentStep} dari 4</span>
                </div>
              </div>
            )}

            <StepRenderer
              currentStep={currentStep}
              selectedSubject={selectedSubject}
              onSubjectChange={setSelectedSubject}
              selectedGrade={selectedGrade}
              onGradeChange={setSelectedGrade}
              customPrompt={customPrompt}
              onPromptChange={setCustomPrompt}
              onDifficultyChange={setRequestedDifficulty}
              materialData={materialData}
              onMaterialDataChange={setMaterialData}
              fileName={fileName}
              onFileNameChange={setFileName}
              questions={questions}
              isGenerating={isGenerating}
              isAppending={isAppending}
              onGenerate={handleWrapperGenerate}
              requestedDifficulty={requestedDifficulty}
            />

          </div>
        </div>

        {/* Action Bar */}
        <ActionBar
          currentStep={currentStep}
          onBack={handleBack}
          onNext={handleNext}
          canProceed={canProceedToNext()}
          onReset={resetForm}
          onGenerate={() => handleWrapperGenerate(customPrompt, materialData)}
          isGenerating={isGenerating}
          prompt={customPrompt}
        />

      </main>

      {/* MODALS */}
      <FAQModal isOpen={isFAQOpen} onClose={() => setIsFAQOpen(false)} />
    </div>
  );
}
