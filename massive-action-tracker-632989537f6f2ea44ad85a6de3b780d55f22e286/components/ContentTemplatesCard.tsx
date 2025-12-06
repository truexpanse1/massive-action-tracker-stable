import React from 'react';

interface ContentTemplatesCardProps {
  selectedTemplate: string;
  setSelectedTemplate: (template: string) => void;
}

const templates = [
    'Welcome Email',
    'Business Proposal',
    'Service Contract',
    'Anniversary/Birthday Message',
    'Sales Email Sequence (3 emails)',
    'Website Landing Page Copy',
    'LinkedIn Post',
    'New Product Introduction',
    'Mastermind Group Invitation',
    'Company Newsletter',
    'Lesson Outline',
    'Checklist',
];

const ContentTemplatesCard: React.FC<ContentTemplatesCardProps> = ({ selectedTemplate, setSelectedTemplate }) => {
  return (
    <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
      <h3 className="text-lg font-bold mb-4 bg-brand-gray/80 text-white p-2 rounded text-center">CONTENT TEMPLATES</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Select a Template</label>
          <select
            value={selectedTemplate}
            onChange={e => setSelectedTemplate(e.target.value)}
            className="w-full bg-brand-light-bg dark:bg-brand-gray/50 border border-brand-light-border dark:border-brand-gray rounded-md p-2 text-sm text-brand-light-text dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            {templates.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Select a template to see the required fields.
        </p>
      </div>
    </div>
  );
};

export default ContentTemplatesCard;