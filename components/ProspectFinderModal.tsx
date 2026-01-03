// components/ProspectFinderModal.tsx
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: geminiApiKey });

interface ProspectResult {
  company: string;
  phone: string;
  email: string;
  contactName: string;
}

interface ProspectFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (prospects: ProspectResult[]) => void;
}

const ProspectFinderModal: React.FC<ProspectFinderModalProps> = ({ isOpen, onClose, onImport }) => {
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [pastedData, setPastedData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ProspectResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);

  const generateSearchLink = () => {
    if (!industry.trim() || !location.trim()) {
      return '';
    }
    const query = encodeURIComponent(`${industry} in ${location}`);
    return `https://www.google.com/maps/search/${query}`;
  };

  const handleProcessData = async () => {
    if (!pastedData.trim()) {
      setError('Please paste data from Google Maps or other sources');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResults([]);

    try {
      const prompt = `You are a data extraction assistant. Parse the following text which contains business/prospect information copied from Google Maps, Chamber of Commerce, or other business directories.

Extract all businesses and format as JSON array with this structure:
[
  {
    "company": "Company Name",
    "phone": "Phone number (formatted as xxx-xxx-xxxx or original format)",
    "email": "Email if available, empty string if not",
    "contactName": "Contact person name if available, empty string if not"
  }
]

Rules:
- Extract ALL businesses found in the text
- If phone has no formatting, add dashes (xxx-xxx-xxxx)
- If email is not found, use empty string ""
- If contact name is not found, use empty string ""
- Company name is required - skip entries without a company name
- Be flexible with different formats (Google Maps listings, directory exports, etc.)

Text to parse:
${pastedData}

Return ONLY the JSON array, no other text.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
      });

      let jsonText = response.text.trim();
      
      // Remove markdown code blocks if present
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      
      const parsed = JSON.parse(jsonText);
      
      if (Array.isArray(parsed) && parsed.length > 0) {
        setResults(parsed);
        setShowInstructions(false);
      } else {
        setError('No prospects found in the pasted data. Make sure you copied business information from Google Maps or a directory.');
      }
    } catch (err) {
      console.error('Error processing data:', err);
      setError('Failed to process the data. Please make sure you pasted valid business information.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportAll = () => {
    onImport(results);
    onClose();
    // Reset form
    setIndustry('');
    setLocation('');
    setPastedData('');
    setResults([]);
    setShowInstructions(true);
  };

  const handleImportSelected = (prospect: ProspectResult) => {
    onImport([prospect]);
  };

  if (!isOpen) return null;

  const searchLink = generateSearchLink();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-brand-navy rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-blue to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">🔍 Smart Prospect Finder</h2>
              <p className="text-sm text-blue-100 mt-1">Find prospects on Google Maps, then paste & import</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-3xl font-bold leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Instructions & Search */}
        {showInstructions && (
          <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
            <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">📋 How It Works:</h3>
            <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mb-4">
              <li className="flex items-start">
                <span className="font-bold mr-2">1.</span>
                <span>Enter your target industry and location below</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">2.</span>
                <span>Click "Open Google Maps" to search</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">3.</span>
                <span>Copy business names, phones, and emails from the results</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">4.</span>
                <span>Paste the data below and click "Process Data"</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">5.</span>
                <span>Review and import to your Prospecting List!</span>
              </li>
            </ol>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Industry / Business Type
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g., Painting contractors, Insurance agencies"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-brand-gray rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent dark:bg-brand-gray/50 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Orange County CA, Paso Robles CA"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-brand-gray rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent dark:bg-brand-gray/50 dark:text-white"
                />
              </div>
            </div>

            {searchLink && (
              <a
                href={searchLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                🗺️ Open Google Maps Search
              </a>
            )}
          </div>
        )}

        {/* Paste Area */}
        <div className="p-6 border-b border-gray-200 dark:border-brand-gray">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Paste Business Data Here
          </label>
          <textarea
            value={pastedData}
            onChange={(e) => setPastedData(e.target.value)}
            placeholder="Paste business information from Google Maps, Chamber of Commerce, or any business directory...

Example formats:
- Google Maps listings (names, phones, addresses)
- Chamber member directories
- Business contact lists
- Any text with company names and contact info"
            className="w-full h-32 px-4 py-2 border border-gray-300 dark:border-brand-gray rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent dark:bg-brand-gray/50 dark:text-white font-mono text-sm"
          />

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleProcessData}
              disabled={isProcessing || !pastedData.trim()}
              className="flex-1 bg-brand-blue hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? '🔄 Processing...' : '⚡ Process Data'}
            </button>
            {results.length > 0 && (
              <button
                onClick={handleImportAll}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                ✓ Import All ({results.length})
              </button>
            )}
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Results Table */}
        <div className="flex-1 overflow-auto p-6">
          {results.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-brand-gray">
                    <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-brand-gray">
                      Company
                    </th>
                    <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-brand-gray">
                      Phone
                    </th>
                    <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-brand-gray">
                      Email
                    </th>
                    <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-brand-gray">
                      Contact
                    </th>
                    <th className="text-center p-3 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-brand-gray">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((prospect, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 dark:border-brand-gray hover:bg-gray-50 dark:hover:bg-brand-gray/30"
                    >
                      <td className="p-3 text-gray-900 dark:text-white font-medium">
                        {prospect.company}
                      </td>
                      <td className="p-3 text-gray-700 dark:text-gray-300">
                        {prospect.phone || '—'}
                      </td>
                      <td className="p-3 text-gray-700 dark:text-gray-300">
                        {prospect.email || '—'}
                      </td>
                      <td className="p-3 text-gray-700 dark:text-gray-300">
                        {prospect.contactName || '—'}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleImportSelected(prospect)}
                          className="bg-brand-blue hover:bg-blue-600 text-white text-xs font-bold py-1 px-3 rounded transition"
                        >
                          Add
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            !isProcessing && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-gray-500 dark:text-gray-400">
                  Paste business data above and click "Process Data"
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ProspectFinderModal;
