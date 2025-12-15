'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import FAQModal from '@/components/FAQSection';
import Sidebar from '@/components/Sidebar';
import StepRenderer from '@/components/StepRenderer';
import ActionBar from '@/components/ActionBar';
import { useQuestionGenerator } from '@/hooks/useQuestionGenerator';

export default function Home() {
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

  return (
    <div className="flex flex-col md:flex-row h-screen supports-[height:100dvh]:h-[100dvh] bg-slate-900 text-white overflow-hidden">

      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-gray-800 z-50 shrink-0 absolute top-0 left-0 right-0">
        <div className="flex items-center gap-3">
          <img src="/icon/icon.svg" alt="Logo" className="w-8 h-8" />
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

      {/* SIDEBAR */}
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        currentStep={currentStep}
        setCurrentStep={handleStepNavigation}
        hasQuestions={questions.length > 0}
        onOpenFAQ={() => setIsFAQOpen(true)}
      />

      {/* MAIN CONTENT + ACTION BAR */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900 relative pt-24 md:pt-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-900 to-blue-900/20 pointer-events-none" />

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 md:py-8 relative z-10 no-scrollbar">
          <div className={`max-w-5xl mx-auto h-full flex flex-col justify-start md:${currentStep === 4 ? 'justify-start pt-4' : 'justify-center'} min-h-[500px]`}>

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
