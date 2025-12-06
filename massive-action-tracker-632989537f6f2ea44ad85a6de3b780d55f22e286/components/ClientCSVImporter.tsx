import React, { useRef } from 'react';
import { NewClient } from '../types';

interface ClientCSVImporterProps {
  onImport: (data: Array<Partial<NewClient>>) => void;
}

const ClientCSVImporter: React.FC<ClientCSVImporterProps> = ({ onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result as string;
            const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
            if (lines.length < 2) {
                alert("CSV file must have a header row and at least one data row.");
                return;
            }

            const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/ /g, ''));

            const data: Array<Partial<NewClient>> = lines.slice(1).map(line => {
                const values = line.split(',');
                const client: Partial<NewClient> = {};
                headers.forEach((header, index) => {
                    const value = values[index]?.trim();
                    if (value === undefined || value === null) return;

                    switch (header) {
                        case 'name':
                        case 'clientname':
                            client.name = value;
                            break;
                        case 'company':
                            client.company = value;
                            break;
                        case 'phone':
                        case 'phonenumber':
                            client.phone = value;
                            break;
                        case 'email':
                        case 'emailaddress':
                            client.email = value;
                            break;
                        case 'address':
                            client.address = value;
                            break;
                        case 'salesprocesslength':
                            client.salesProcessLength = value;
                            break;
                        case 'monthlycontractvalue':
                        case 'mcv':
                            client.monthlyContractValue = parseFloat(value.replace(/[^0-9.-]+/g, "")) || 0;
                            break;
                        case 'initialamountcollected':
                        case 'amount':
                        case 'amountcollected':
                            client.initialAmountCollected = parseFloat(value.replace(/[^0-9.-]+/g, "")) || 0;
                            break;
                        case 'closedate':
                        case 'date':
                            client.closeDate = value;
                            break;
                        case 'stage':
                            client.stage = value;
                            break;
                    }
                });
                return client;
            }).filter(c => c.name); 

            if (data.length > 0) {
              onImport(data);
            } else {
              alert("Could not find any valid client data in the file. Make sure your CSV has a 'name' column and that headers match expected values (e.g., name, company, phone, email, amount, date).");
            }
        } catch (error) {
            console.error("Error parsing CSV:", error);
            alert("There was an error parsing the CSV file. Please check the file format and try again.");
        }
    };

    reader.readAsText(file);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        className="hidden"
      />
      <button
        type="button"
        onClick={handleClick}
        className="bg-brand-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition text-sm flex items-center gap-2 whitespace-nowrap"
        title="Import clients from a CSV file"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
        Import CSV
      </button>
    </>
  );
};

export default ClientCSVImporter;
