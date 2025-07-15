import React, { useState } from 'react';
import { Settings, Key, ExternalLink, AlertCircle } from 'lucide-react';

interface AISetupProps {
  onApiKeySet: (apiKey: string) => void;
  currentApiKey: string;
}

const AISetup: React.FC<AISetupProps> = ({ onApiKeySet, currentApiKey }) => {
  const [apiKey, setApiKey] = useState(currentApiKey);
  const [showSetup, setShowSetup] = useState(false);

  const handleSave = () => {
    onApiKeySet(apiKey);
    setShowSetup(false);
  };

  return (
    <div className="mb-8">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-purple-400" />
            <div>
              <h3 className="text-white font-semibold">AI Configuration</h3>
              <p className="text-gray-400 text-sm">
                {currentApiKey ? 'AI API terkonfigurasi' : 'Gunakan AI gratis atau template soal'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSetup(!showSetup)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            {showSetup ? 'Tutup' : 'Setup AI'}
          </button>
        </div>

        {showSetup && (
          <div className="mt-6 space-y-4">
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="text-blue-300 font-medium mb-2">Cara Mendapatkan API Key Gratis:</h4>
                  <ol className="text-blue-200 text-sm space-y-1 list-decimal list-inside">
                    <li>Kunjungi <a href="https://huggingface.co/join" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Hugging Face</a> dan buat akun gratis</li>
                    <li>Pergi ke <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Settings → Access Tokens</a></li>
                    <li>Klik "New token" dan pilih "Read" permission</li>
                    <li>Copy token dan paste di bawah ini</li>
                  </ol>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                Hugging Face API Token (Opsional)
              </label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Simpan
                </button>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Tanpa API key, sistem akan menggunakan template soal dengan variasi yang lebih terbatas
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AISetup;