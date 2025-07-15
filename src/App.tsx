import React, { useState } from 'react';
import { BookOpen, Brain, Settings, Download, Plus, Sparkles } from 'lucide-react';
import SubjectSelector from './components/SubjectSelector';
import GradeSelector from './components/GradeSelector';
import PromptBuilder from './components/PromptBuilder';
import QuestionGenerator from './components/QuestionGenerator';
import QuestionDisplay from './components/QuestionDisplay';
import { Question } from './types/Question';

function App() {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleGenerateQuestions = async (prompt: string) => {
    setIsGenerating(true);
    try {
      // Simulate AI API call - replace with actual API integration
      const generatedQuestions = await generateQuestionsFromAI(prompt, selectedSubject, selectedGrade);
      setQuestions(generatedQuestions);
      setCurrentStep(4);
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateQuestionsFromAI = async (prompt: string, subject: string, grade: string): Promise<Question[]> => {
    try {
      // Use Hugging Face Inference API (free tier)
      const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Replace with your token
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt + " Format jawaban dalam JSON dengan struktur: {\"questions\": [{\"question\": \"...\", \"options\": [\"A\", \"B\", \"C\", \"D\"], \"correctAnswer\": 0}]}",
          parameters: {
            max_new_tokens: 1000,
            temperature: 0.8,
            do_sample: true
          }
        })
      });

      if (!response.ok) {
        throw new Error('AI API request failed');
      }

      const aiResponse = await response.json();
      
      // Try to parse AI response as JSON
      try {
        const parsedResponse = JSON.parse(aiResponse.generated_text || aiResponse[0]?.generated_text || '{}');
        if (parsedResponse.questions && Array.isArray(parsedResponse.questions)) {
          return parsedResponse.questions.map((q: any, index: number) => ({
            id: (index + 1).toString(),
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer || 0,
            subject: subject,
            grade: grade,
            difficulty: getDifficultyFromPrompt(prompt)
          }));
        }
      } catch (parseError) {
        console.log('Failed to parse AI response, using fallback');
      }
    } catch (error) {
      console.error('AI API Error:', error);
      console.log('Using fallback question generation...');
    }

    // Fallback to enhanced template system with better randomization
    return generateFallbackQuestions(prompt, subject, grade);
  };

  const getDifficultyFromPrompt = (prompt: string): 'Easy' | 'Medium' | 'Hard' => {
    if (prompt.includes('mudah')) return 'Easy';
    if (prompt.includes('sulit')) return 'Hard';
    return 'Medium';
  };

  const generateFallbackQuestions = async (prompt: string, subject: string, grade: string): Promise<Question[]> => {
    // Add delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Extract question count from prompt
    const countMatch = prompt.match(/(\d+)\s*soal/);
    const questionCount = countMatch ? parseInt(countMatch[1]) : 5;
    
    // Extract difficulty from prompt
    const difficultyMatch = prompt.match(/tingkat kesulitan (mudah|sedang|sulit|mixed)/);
    const selectedDifficulty = difficultyMatch ? difficultyMatch[1] : 'campur';
    
    // Extract topic from prompt
    const topicMatch = prompt.match(/Fokus pada topik: ([^.]+)/);
    const selectedTopic = topicMatch ? topicMatch[1].trim() : '';
    
    // Create unique seed for each generation
    const randomSeed = Date.now() + Math.random() * 1000;
    
    const mockQuestions: Question[] = [];
    const difficulties: ('Easy' | 'Medium' | 'Hard')[] = 
      selectedDifficulty === 'mudah' ? ['Easy'] :
      selectedDifficulty === 'sedang' ? ['Medium'] :
      selectedDifficulty === 'sulit' ? ['Hard'] :
      ['Easy', 'Medium', 'Hard']; // mixed/campur

    const getQuestionTemplates = (topic: string) => ({
      'matematika': [
        ...(topic.toLowerCase().includes('penjumlahan') || topic.toLowerCase().includes('tambah') || !topic ? [
          'Berapa hasil dari 15 + 23?',
          'Berapa hasil dari 45 + 17?',
          'Berapa hasil dari 28 + 36?',
          'Berapa hasil dari 52 + 19?',
          'Berapa hasil dari 34 + 28?'
        ] : []),
        ...(topic.toLowerCase().includes('pengurangan') || topic.toLowerCase().includes('kurang') || !topic ? [
          'Berapa hasil dari 50 - 23?',
          'Berapa hasil dari 75 - 28?',
          'Berapa hasil dari 64 - 17?',
          'Berapa hasil dari 83 - 35?',
          'Berapa hasil dari 92 - 46?'
        ] : []),
        ...(topic.toLowerCase().includes('perkalian') || topic.toLowerCase().includes('kali') || !topic ? [
          'Berapa hasil dari 7 × 8?',
          'Berapa hasil dari 9 × 6?',
          'Berapa hasil dari 5 × 12?',
          'Berapa hasil dari 8 × 9?',
          'Berapa hasil dari 6 × 7?'
        ] : []),
        ...(topic.toLowerCase().includes('pembagian') || topic.toLowerCase().includes('bagi') || !topic ? [
          'Berapa hasil dari 56 ÷ 8?',
          'Berapa hasil dari 72 ÷ 9?',
          'Berapa hasil dari 48 ÷ 6?',
          'Berapa hasil dari 63 ÷ 7?',
          'Berapa hasil dari 81 ÷ 9?'
        ] : [])
      ],
      'bahasa-indonesia': [
        ...(topic.toLowerCase().includes('membaca') || topic.toLowerCase().includes('bacaan') || !topic ? [
          'Kata yang tepat untuk melengkapi kalimat "Ibu ... ke pasar" adalah?',
          'Kata yang tepat untuk melengkapi kalimat "Ayah ... mobil" adalah?',
          'Kata yang tepat untuk melengkapi kalimat "Adik ... susu" adalah?'
        ] : []),
        ...(topic.toLowerCase().includes('sinonim') || topic.toLowerCase().includes('persamaan') || !topic ? [
          'Sinonim dari kata "cantik" adalah?',
          'Sinonim dari kata "besar" adalah?',
          'Sinonim dari kata "senang" adalah?'
        ] : []),
        ...(topic.toLowerCase().includes('antonim') || topic.toLowerCase().includes('lawan') || !topic ? [
          'Antonim dari kata "tinggi" adalah?',
          'Antonim dari kata "panas" adalah?',
          'Antonim dari kata "terang" adalah?'
        ] : []),
        ...(topic.toLowerCase().includes('tanda baca') || topic.toLowerCase().includes('ejaan') || !topic ? [
          'Huruf kapital digunakan pada?',
          'Tanda baca yang tepat untuk kalimat tanya adalah?',
          'Tanda baca yang tepat untuk kalimat seru adalah?'
        ] : [])
      ],
      'ipa': [
        ...(topic.toLowerCase().includes('hewan') || topic.toLowerCase().includes('mamalia') || !topic ? [
          'Hewan yang termasuk mamalia adalah?',
          'Hewan yang hidup di air adalah?',
          'Hewan yang dapat terbang adalah?'
        ] : []),
        ...(topic.toLowerCase().includes('tumbuhan') || topic.toLowerCase().includes('fotosintesis') || !topic ? [
          'Bagian tumbuhan yang berfungsi untuk fotosintesis adalah?',
          'Bagian tumbuhan yang menyerap air adalah?',
          'Bagian tumbuhan yang menghasilkan buah adalah?'
        ] : []),
        ...(topic.toLowerCase().includes('planet') || topic.toLowerCase().includes('tata surya') || !topic ? [
          'Planet yang paling dekat dengan matahari adalah?',
          'Planet yang paling besar adalah?',
          'Benda langit yang mengelilingi bumi adalah?'
        ] : []),
        ...(topic.toLowerCase().includes('suhu') || topic.toLowerCase().includes('air') || !topic ? [
          'Air membeku pada suhu?',
          'Air mendidih pada suhu?',
          'Alat untuk mengukur suhu adalah?'
        ] : [])
      ],
      'ips': [
        ...(topic.toLowerCase().includes('indonesia') || topic.toLowerCase().includes('ibu kota') || !topic ? [
          'Ibu kota Indonesia adalah?',
          'Ibu kota Jawa Barat adalah?',
          'Ibu kota Jawa Timur adalah?'
        ] : []),
        ...(topic.toLowerCase().includes('pulau') || topic.toLowerCase().includes('geografis') || !topic ? [
          'Pulau terbesar di Indonesia adalah?',
          'Pulau yang terletak di ujung barat Indonesia adalah?',
          'Pulau yang terletak di ujung timur Indonesia adalah?'
        ] : []),
        ...(topic.toLowerCase().includes('mata uang') || topic.toLowerCase().includes('ekonomi') || !topic ? [
          'Mata uang Indonesia adalah?',
          'Mata uang Amerika Serikat adalah?',
          'Mata uang Jepang adalah?'
        ] : []),
        ...(topic.toLowerCase().includes('benua') || topic.toLowerCase().includes('dunia') || !topic ? [
          'Benua tempat Indonesia berada adalah?',
          'Benua terbesar di dunia adalah?',
          'Benua terkecil di dunia adalah?'
        ] : [])
      ],
      'seni-budaya': [
        ...(topic.toLowerCase().includes('musik') || topic.toLowerCase().includes('alat musik') || !topic ? [
          'Alat musik tradisional dari Jawa adalah?',
          'Alat musik tradisional dari Sumatra adalah?',
          'Alat musik yang dipukul adalah?'
        ] : []),
        ...(topic.toLowerCase().includes('warna') || topic.toLowerCase().includes('lukis') || !topic ? [
          'Warna primer terdiri dari?',
          'Warna yang dihasilkan dari campuran merah dan kuning adalah?',
          'Lukisan dibuat menggunakan?'
        ] : []),
        ...(topic.toLowerCase().includes('tarian') || topic.toLowerCase().includes('budaya') || !topic ? [
          'Tarian tradisional dari Bali adalah?',
          'Tarian tradisional dari Aceh adalah?',
          'Tarian tradisional dari Betawi adalah?'
        ] : [])
      ],
      'pjok': [
        ...(topic.toLowerCase().includes('sepak bola') || topic.toLowerCase().includes('bola') || !topic ? [
          'Olahraga yang menggunakan bola bundar adalah?',
          'Jumlah pemain dalam satu tim sepak bola adalah?',
          'Durasi permainan sepak bola adalah?'
        ] : []),
        ...(topic.toLowerCase().includes('renang') || topic.toLowerCase().includes('air') || !topic ? [
          'Olahraga renang dilakukan di?',
          'Gaya renang yang paling mudah adalah?',
          'Alat bantu untuk belajar renang adalah?'
        ] : []),
        ...(topic.toLowerCase().includes('badminton') || topic.toLowerCase().includes('raket') || !topic ? [
          'Alat untuk bermain badminton adalah?',
          'Bola badminton disebut juga?',
          'Jumlah pemain badminton tunggal adalah?'
        ] : []),
        ...(topic.toLowerCase().includes('lari') || topic.toLowerCase().includes('atletik') || !topic ? [
          'Lari jarak pendek disebut juga?',
          'Lari jarak jauh disebut juga?',
          'Start yang digunakan untuk lari jarak pendek adalah?'
        ] : [])
      ]
    });

    const getOptionTemplates = (topic: string) => ({
      'matematika': [
        ['38', '42', '35', '40'], // 15 + 23
        ['62', '58', '65', '60'], // 45 + 17
        ['64', '68', '62', '66'], // 28 + 36
        ['71', '75', '73', '69'], // 52 + 19
        ['62', '58', '64', '60'], // 34 + 28
        ['27', '23', '29', '25'], // 50 - 23
        ['47', '43', '49', '45'], // 75 - 28
        ['47', '43', '49', '45'], // 64 - 17
        ['48', '52', '46', '50'], // 83 - 35
        ['46', '42', '48', '44'], // 92 - 46
        ['56', '52', '58', '54'], // 7 × 8
        ['54', '50', '56', '52'], // 9 × 6
        ['60', '56', '62', '58'], // 5 × 12
        ['72', '68', '74', '70'], // 8 × 9
        ['42', '38', '44', '40'], // 6 × 7
        ['7', '6', '8', '9'], // 56 ÷ 8
        ['8', '7', '9', '6'], // 72 ÷ 9
        ['8', '7', '9', '6'], // 48 ÷ 6
        ['9', '8', '7', '6'], // 63 ÷ 7
        ['9', '8', '7', '6']  // 81 ÷ 9
      ],
      'bahasa-indonesia': [
        ['pergi', 'datang', 'pulang', 'berangkat'],
        ['mengendarai', 'membeli', 'menjual', 'meminjam'],
        ['minum', 'makan', 'beli', 'ambil'],
        ['indah', 'jelek', 'buruk', 'kotor'],
        ['besar', 'kecil', 'tinggi', 'luas'],
        ['gembira', 'sedih', 'marah', 'takut'],
        ['rendah', 'pendek', 'kecil', 'sempit'],
        ['dingin', 'sejuk', 'hangat', 'panas'],
        ['gelap', 'redup', 'suram', 'buram'],
        ['awal kalimat', 'tengah kalimat', 'akhir kalimat', 'semua benar'],
        ['?', '.', '!', ','],
        ['!', '?', '.', ',']
      ],
      'ipa': [
        ['kucing', 'ayam', 'ikan', 'katak'],
        ['ikan', 'burung', 'kucing', 'sapi'],
        ['burung', 'kucing', 'ikan', 'sapi'],
        ['akar', 'batang', 'daun', 'bunga'],
        ['akar', 'daun', 'batang', 'bunga'],
        ['bunga', 'akar', 'daun', 'batang'],
        ['Merkurius', 'Venus', 'Mars', 'Jupiter'],
        ['Jupiter', 'Saturnus', 'Merkurius', 'Venus'],
        ['Bulan', 'Matahari', 'Bintang', 'Planet'],
        ['0°C', '100°C', '50°C', '25°C'],
        ['100°C', '0°C', '50°C', '25°C'],
        ['Termometer', 'Barometer', 'Higrometer', 'Anemometer']
      ],
      'ips': [
        ['Jakarta', 'Surabaya', 'Bandung', 'Medan'],
        ['Bandung', 'Jakarta', 'Surabaya', 'Semarang'],
        ['Surabaya', 'Malang', 'Bandung', 'Jakarta'],
        ['Sumatra', 'Jawa', 'Kalimantan', 'Papua'],
        ['Sumatra', 'Jawa', 'Kalimantan', 'Sulawesi'],
        ['Papua', 'Maluku', 'Sumatra', 'Jawa'],
        ['Rupiah', 'Dollar', 'Euro', 'Yen'],
        ['Dollar', 'Rupiah', 'Euro', 'Yen'],
        ['Yen', 'Won', 'Dollar', 'Rupiah'],
        ['Asia', 'Afrika', 'Amerika', 'Eropa'],
        ['Asia', 'Afrika', 'Amerika', 'Eropa'],
        ['Australia', 'Asia', 'Eropa', 'Afrika']
      ],
      'seni-budaya': [
        ['Gamelan', 'Piano', 'Gitar', 'Biola'],
        ['Gordang Sambilan', 'Gamelan', 'Angklung', 'Sasando'],
        ['Gendang', 'Seruling', 'Biola', 'Piano'],
        ['Orange', 'Hijau', 'Ungu', 'Coklat'],
        ['Cat', 'Pensil', 'Krayon', 'Spidol'],
        ['Kecak', 'Saman', 'Tor-tor', 'Jaipong'],
        ['Saman', 'Kecak', 'Pendet', 'Legong'],
        ['Ondel-ondel', 'Kecak', 'Saman', 'Tor-tor']
      ],
      'pjok': [
        ['Sepak bola', 'Basket', 'Voli', 'Semua benar'],
        ['11', '10', '9', '12'],
        ['90 menit', '80 menit', '100 menit', '120 menit'],
        ['Kolam renang', 'Lapangan', 'Pantai', 'Sungai'],
        ['Gaya bebas', 'Gaya punggung', 'Gaya kupu-kupu', 'Gaya dada'],
        ['Pelampung', 'Kacamata renang', 'Papan renang', 'Semua benar'],
        ['Raket', 'Tongkat', 'Pemukul', 'Dayung'],
        ['Shuttlecock', 'Bola', 'Kelereng', 'Batu'],
        ['1', '2', '3', '4'],
        ['Sprint', 'Marathon', 'Jogging', 'Estafet'],
        ['Marathon', 'Sprint', 'Jogging', 'Estafet'],
        ['Berdiri', 'Jongkok', 'Melayang', 'Duduk']
      ]
    });

    const templates = getQuestionTemplates(selectedTopic);
    const options = getOptionTemplates(selectedTopic);
    const subjectTemplates = templates[subject as keyof typeof templates] || templates['matematika'];
    const subjectOptions = options[subject as keyof typeof options] || options['matematika'];
    
    // Shuffle arrays for randomization
    const shuffleArray = (array: any[], seed: number) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(((seed + i) * 9301 + 49297) % 233280 / 233280) * (i + 1);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };
    
    const shuffledTemplates = shuffleArray(subjectTemplates, randomSeed);
    const shuffledOptions = shuffleArray(subjectOptions, randomSeed + 1000);

    for (let i = 0; i < questionCount; i++) {
      const questionTemplate = shuffledTemplates[i % shuffledTemplates.length];
      const questionOptions = shuffledOptions[i % shuffledOptions.length];
      
      mockQuestions.push({
        id: (i + 1).toString(),
        question: questionTemplate,
        options: questionOptions,
        correctAnswer: 0,
        subject: subject,
        grade: grade,
        difficulty: difficulties[Math.floor(((randomSeed + i) * 9301 + 49297) % 233280 / 233280) * difficulties.length]
      });
    }
    
    return mockQuestions;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">AI Question Generator</h1>
          </div>
          <p className="text-gray-300 text-lg">
            Buat soal-soal berkualitas untuk anak SD dengan bantuan AI
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold
                  ${currentStep >= step 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-400'
                  }
                `}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`
                    w-16 h-1 mx-2
                    ${currentStep > step ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gray-700'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 1 && (
            <SubjectSelector
              selectedSubject={selectedSubject}
              onSubjectChange={setSelectedSubject}
            />
          )}

          {currentStep === 2 && (
            <GradeSelector
              selectedGrade={selectedGrade}
              onGradeChange={setSelectedGrade}
            />
          )}

          {currentStep === 3 && (
            <PromptBuilder
              customPrompt={customPrompt}
              onPromptChange={setCustomPrompt}
              subject={selectedSubject}
              grade={selectedGrade}
            />
          )}

          {currentStep === 4 && (
            <QuestionDisplay
              questions={questions}
              isGenerating={isGenerating}
              onRegenerateQuestions={handleGenerateQuestions}
              prompt={customPrompt}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-center mt-12 gap-4">
          {currentStep > 1 && currentStep < 4 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Kembali
            </button>
          )}
          
          {currentStep < 3 && (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceedToNext()}
              className={`
                px-6 py-3 rounded-lg font-medium transition-colors
                ${canProceedToNext()
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              Lanjutkan
            </button>
          )}

          {currentStep === 3 && (
            <QuestionGenerator
              onGenerateQuestions={handleGenerateQuestions}
              isGenerating={isGenerating}
              disabled={!canProceedToNext()}
              prompt={customPrompt}
            />
          )}

          {currentStep === 4 && (
            <button
              onClick={resetForm}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Buat Soal Baru
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;