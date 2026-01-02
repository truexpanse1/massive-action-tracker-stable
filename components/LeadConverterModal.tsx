import React, { useState } from 'react';

interface ParsedLead {
  company: string;
  phone: string;
  email: string;
}

interface LeadConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadsAdded: (leads: ParsedLead[]) => void;
}

const LeadConverterModal: React.FC<LeadConverterModalProps> = ({
  isOpen,
  onClose,
  onLeadsAdded,
}) => {
  const [pastedText, setPastedText] = useState('');
  const [preview, setPreview] = useState<ParsedLead[]>([]);

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
    'industry:',
  ];

  const parseGoogleMapsData = (text: string): ParsedLead[] => {
    if (!text.trim()) return [];

    const lines = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const leads: ParsedLead[] = [];
    let currentLead: Partial<ParsedLead> = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();

      // Skip ignore list items
      const shouldIgnore = IGNORE_LIST.some(ignoreItem => 
        lowerLine.includes(ignoreItem)
      );
      if (shouldIgnore) continue;

      // Check if it's a phone number
      const phoneMatch = line.match(/\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
      if (phoneMatch) {
        currentLead.phone = phoneMatch[0];
        continue;
      }

      // Check if it's an email
      const emailMatch = line.match(/[\w.-]+@[\w.-]+\.\w+/);
      if (emailMatch) {
        currentLead.email = emailMatch[0];
        continue;
      }

      // Skip if it starts with bullet points or special chars
      if (/^[•\-\*📞✉]/.test(line)) continue;

      // Skip if it's mostly numbers (but not a phone)
      if (/^\d+/.test(line) && line.length < 20) continue;

      // Skip if it contains star ratings
      if (/\d+\.\d+\s*★/.test(line)) continue;

      // Skip if it's a URL
      if (/^https?:\/\//.test(line)) continue;

      // If we have accumulated data and hit a new company name, save the lead
      if (currentLead.company && line.length > 2 && line.length < 100) {
        leads.push({
          company: currentLead.company,
          phone: currentLead.phone || '',
          email: currentLead.email || '',
        });
        currentLead = { company: line };
      } else if (!currentLead.company && line.length > 2 && line.length < 100) {
        // First company name
        currentLead.company = line;
      }
    }

    // Don't forget the last lead
    if (currentLead.company) {
      leads.push({
        company: currentLead.company,
        phone: currentLead.phone || '',
        email: currentLead.email || '',
      });
    }

    return leads;
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setPastedText(text);
    
    // Generate preview
    const parsed = parseGoogleMapsData(text);
    setPreview(parsed);
  };

  const handleAddToProspectingList = () => {
    if (preview.length === 0) return;

    // Pass the leads back to the parent component
    onLeadsAdded(preview);
    
    // Clear and close
    setPastedText('');
    setPreview([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a2e] rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
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
              Paste your Google Maps search results below. The tool will automatically extract company names, phone numbers, and emails.
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
                      <th className="text-left px-3 py-2 text-gray-400 font-medium w-8">#</th>
                      <th className="text-left px-3 py-2 text-gray-400 font-medium">COMPANY</th>
                      <th className="text-left px-3 py-2 text-gray-400 font-medium">PHONE</th>
                      <th className="text-left px-3 py-2 text-gray-400 font-medium">EMAIL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((lead, index) => (
                      <tr key={index} className="border-t border-gray-800 hover:bg-[#1a1a2e]">
                        <td className="px-3 py-2 text-gray-500">{index + 1}</td>
                        <td className="px-3 py-2 text-white">{lead.company}</td>
                        <td className="px-3 py-2 text-gray-300">{lead.phone || '-'}</td>
                        <td className="px-3 py-2 text-gray-300">{lead.email || '-'}</td>
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
            disabled={preview.length === 0}
            className="px-6 py-2 bg-[#00d4ff] text-[#0a0e27] font-semibold rounded hover:bg-[#00b8e6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add to Prospecting List ({preview.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadConverterModal;
