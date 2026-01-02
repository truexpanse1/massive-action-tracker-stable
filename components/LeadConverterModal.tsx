import React, { useState } from 'react';
import { supabase } from '../src/services/supabaseClient';

interface LeadConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadsAdded: () => void;
  userId: string;
}

const LeadConverterModal: React.FC<LeadConverterModalProps> = ({
  isOpen,
  onClose,
  onLeadsAdded,
  userId,
}) => {
  const [pastedText, setPastedText] = useState('');
  const [preview, setPreview] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Ignore list for Google Maps junk data
  const IGNORE_LIST = [
    'online estimates',
    'online appointments',
    'onsite services',
    'quote',
    'get quote',
    'directions',
    'share',
    'save',
    'send to phone',
    'website',
    'call',
    'reviews',
    'photos',
    'hours',
    'menu',
    'view larger map',
  ];

  const parseGoogleMapsData = (text: string): string[] => {
    if (!text.trim()) return [];

    // Split by newlines and filter
    const lines = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const companies: string[] = [];

    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      // Skip if it's in the ignore list
      const shouldIgnore = IGNORE_LIST.some(ignoreItem => 
        lowerLine.includes(ignoreItem)
      );
      
      if (shouldIgnore) continue;

      // Skip if it looks like a phone number
      if (/\(\d{3}\)\s?\d{3}-\d{4}/.test(line)) continue;
      
      // Skip if it's mostly numbers
      if (/^\d+/.test(line) && line.length < 50) continue;

      // Skip if it contains star ratings
      if (/\d+\.\d+\s*★/.test(line)) continue;

      // Skip if it's a URL
      if (/^https?:\/\//.test(line)) continue;

      // If it passes all filters, it's likely a company name
      if (line.length > 2 && line.length < 100) {
        companies.push(line);
      }
    }

    // Remove duplicates
    return [...new Set(companies)];
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setPastedText(text);
    
    // Generate preview
    const parsed = parseGoogleMapsData(text);
    setPreview(parsed);
  };

  const handleAddToProspectingList = async () => {
    if (preview.length === 0) return;

    setIsProcessing(true);

    try {
      // Add each company to the prospects table
      const prospectsToAdd = preview.map(company => ({
        user_id: userId,
        company: company,
        name: '', // Leave name blank for user to fill
        stage: 'Prospect',
        created_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('prospects')
        .insert(prospectsToAdd);

      if (error) throw error;

      // Success - close modal and refresh
      alert(`Successfully added ${preview.length} prospects!`);
      setPastedText('');
      setPreview([]);
      onLeadsAdded();
      onClose();
    } catch (error) {
      console.error('Error adding prospects:', error);
      alert('Failed to add prospects. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a2e] rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#16213e] px-6 py-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">🔗 Lead Converter</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-4">
            <p className="text-gray-300 text-sm mb-2">
              Paste your Google Maps search results below. The tool will automatically extract company names.
            </p>
            <textarea
              value={pastedText}
              onChange={handleTextChange}
              placeholder="Paste Google Maps data here..."
              className="w-full h-40 bg-[#0f0f1e] text-white border border-gray-600 rounded p-3 text-sm font-mono resize-none focus:outline-none focus:border-[#00d4ff]"
            />
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">
                  Preview ({preview.length} leads found)
                </h3>
                <button
                  onClick={() => {
                    setPastedText('');
                    setPreview([]);
                  }}
                  className="text-xs text-[#00d4ff] hover:underline"
                >
                  Clear
                </button>
              </div>
              <div className="bg-[#0f0f1e] border border-gray-700 rounded max-h-60 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#16213e] sticky top-0">
                    <tr>
                      <th className="text-left px-4 py-2 text-gray-400 font-medium">#</th>
                      <th className="text-left px-4 py-2 text-gray-400 font-medium">COMPANY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((company, index) => (
                      <tr key={index} className="border-t border-gray-800 hover:bg-[#1a1a2e]">
                        <td className="px-4 py-2 text-gray-500">{index + 1}</td>
                        <td className="px-4 py-2 text-white">{company}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#16213e] px-6 py-4 border-t border-gray-700 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddToProspectingList}
            disabled={preview.length === 0 || isProcessing}
            className="px-6 py-2 bg-[#00d4ff] text-[#0a0e27] font-semibold rounded hover:bg-[#00b8e6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Adding...' : `Add to Prospecting List (${preview.length})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadConverterModal;
