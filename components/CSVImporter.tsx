import React, { useRef } from 'react';
import { Contact } from '../types';

interface CSVImporterProps {
  onImport: (data: Array<Partial<Contact>>) => void;
}

const CSVImporter: React.FC<CSVImporterProps> = ({ onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length === 0) return;

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const nameIndex = headers.indexOf('name');
      const phoneIndex = headers.indexOf('phone');
      const emailIndex = headers.indexOf('email');

      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        const contact: Partial<Contact> = {};
        if (nameIndex !== -1) contact.name = values[nameIndex]?.trim();
        if (phoneIndex !== -1) contact.phone = values[phoneIndex]?.trim();
        if (emailIndex !== -1) contact.email = values[emailIndex]?.trim();
        return contact;
      }).filter(c => c.name || c.phone || c.email); // Only import rows with some data

      onImport(data);
    };

    reader.readAsText(file);
    // Reset file input to allow uploading the same file again
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        className="hidden"
      />
      <button
        onClick={handleClick}
        className="p-2 rounded-md text-gray-400 hover:bg-gray-200 dark:hover:bg-brand-gray/50"
        title="Import from CSV"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

export default CSVImporter;