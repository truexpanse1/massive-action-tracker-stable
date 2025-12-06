import React, { useEffect } from 'react';
import {
  DayData,
  Contact,
  ProspectingCode,
  prospectingCodes,
  prospectingCodeDescriptions,
  CalendarEvent,
  formatPhoneNumber,
  getInitialDayData,
} from '../types';
import QuickActions from '../components/QuickActions';
import CSVImporter from '../components/CSVImporter';
import Calendar from '../components/Calendar';
import ProspectingKPIs from '../components/ProspectingKPIs';

interface ProspectingPageProps {
  allData: { [key: string]: DayData };
  onDataChange: (dateKey: string, data: DayData) => Promise<void>;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onAddHotLead: (leadData: Omit<Contact, 'id'>) => Promise<Contact | null>;
  onAddWin: (dateKey: string, winMessage: string) => void;
  handleSetAppointment: (
    appointment: { client: string; lead: string; time: string },
    date: Date
  ) => void;
  hotLeads: Contact[];
}

const ProspectingPage: React.FC<ProspectingPageProps> = ({
  allData,
  onDataChange,
  selectedDate,
  onDateChange,
  onAddHotLead,
  onAddWin,
  handleSetAppointment,
  hotLeads,
}) => {
  const getDateKey = (date: Date): string => date.toISOString().split('T')[0];
  const currentDateKey = getDateKey(selectedDate);

  const currentData: DayData = allData[currentDateKey] || getInitialDayData();

  useEffect(() => {
    const contacts = currentData.prospectingContacts || [];
    const callsMade = contacts.filter(
      (c) => c.prospecting.SW || c.prospecting.NA || c.prospecting.LM
    ).length;

    if (callsMade >= 30 && !currentData.milestones?.calls30Achieved) {
      onAddWin(currentDateKey, 'Accomplished 30 daily calls!');
      const dayData = allData[currentDateKey] || getInitialDayData();
      onDataChange(currentDateKey, {
        ...dayData,
        milestones: { ...dayData.milestones, calls30Achieved: true },
      });
    }
  }, [
    currentData.prospectingContacts,
    currentDateKey,
    onAddWin,
    onDataChange,
    allData,
    currentData.milestones?.calls30Achieved,
  ]);

  const updateCurrentData = (updates: Partial<DayData>) => {
    const updatedData = {
      ...(allData[currentDateKey] || getInitialDayData()),
      ...updates,
    };
    onDataChange(currentDateKey, updatedData);
  };

  const handleContactChange = (
    index: number,
    field: keyof Omit<Contact, 'id' | 'prospecting'>,
    value: string
  ) => {
    const newContacts = [...currentData.prospectingContacts];
    const formattedValue = field === 'phone' ? formatPhoneNumber(value) : value;
    newContacts[index] = { ...newContacts[index], [field]: formattedValue };
    updateCurrentData({ prospectingContacts: newContacts });
  };

  const handleProspectingChange = (contactIndex: number, code: ProspectingCode) => {
    const newContacts = [...currentData.prospectingContacts];
    const contact = { ...newContacts[contactIndex] };
    const isBeingChecked = !contact.prospecting[code];

    const newProspecting = { ...contact.prospecting, [code]: isBeingChecked };
    newContacts[contactIndex] = { ...contact, prospecting: newProspecting };
    updateCurrentData({ prospectingContacts: newContacts });

    if (code === 'SA' && isBeingChecked && contact.name) {
      const isAlreadyHot = hotLeads.some(
        (lead) =>
          lead.name === contact.name &&
          lead.phone === contact.phone &&
          lead.email === contact.email
      );

      if (!isAlreadyHot) {
        onAddHotLead({
          ...contact,
          dateAdded: new Date().toISOString(),
          completedFollowUps: {},
        }).then((newLead) => {
          if (newLead) {
            onAddWin(currentDateKey, `Added ${contact.name} to Hot Leads.`);
          }
        });
      }
    }
  };

  const handleCSVImport = (importedData: Array<Partial<Contact>>) => {
    const newContacts = [...currentData.prospectingContacts];
    let importedCount = 0;

    for (const data of importedData) {
      const emptyIndex = newContacts.findIndex(
        (c) => !c.name && !c.phone && !c.email
      );
      if (emptyIndex !== -1) {
        newContacts[emptyIndex] = {
          ...newContacts[emptyIndex],
          name: data.name || '',
          company: (data as any).company || newContacts[emptyIndex].company || '',
          phone: data.phone ? formatPhoneNumber(data.phone) : '',
          email: data.email || '',
          date: new Date().toISOString().split('T')[0],
        };
        importedCount++;
      } else {
        break;
      }
    }

    updateCurrentData({ prospectingContacts: newContacts });
    alert(`Successfully imported ${importedCount} contacts.`);
  };

  const handleQuickSetAppointment = (data: {
    name: string;
    phone: string;
    email: string;
    date: string;
    time: string;
    interestLevel: number;
  }) => {
    const appointmentDate = new Date(`${data.date}T${data.time}`);
    handleSetAppointment(
      { client: data.name, lead: 'Prospecting Page', time: data.time },
      appointmentDate
    );

    const newContacts = [...currentData.prospectingContacts];
    const emptyIndex = newContacts.findIndex((c) => !c.name);
    if (emptyIndex !== -1) {
      newContacts[emptyIndex] = {
        ...newContacts[emptyIndex],
        name: data.name,
        phone: formatPhoneNumber(data.phone),
        email: data.email,
        date: new Date().toISOString().split('T')[0],
        prospecting: { SA: true },
        interestLevel: data.interestLevel,
      };
      updateCurrentData({ prospectingContacts: newContacts });
    }
  };

  const handleQuickAddToHotLeads = async (data: {
    name: string;
    phone: string;
    email: string;
    interestLevel: number;
  }) => {
    const newContactData = {
      name: data.name,
      date: new Date().toISOString().split('T')[0],
      phone: formatPhoneNumber(data.phone),
      email: data.email,
      interestLevel: data.interestLevel,
      prospecting: {},
      dateAdded: new Date().toISOString(),
      completedFollowUps: {},
    };
    const newHotLead = await onAddHotLead(newContactData);
    if (newHotLead) {
      const newContacts = [...currentData.prospectingContacts];
      const emptyIndex = newContacts.findIndex((c) => !c.name);
      if (emptyIndex !== -1) {
        newContacts[emptyIndex] = { ...newContacts[emptyIndex], ...newHotLead };
        updateCurrentData({ prospectingContacts: newContacts });
      }
      alert(`${data.name} added to Hot Leads!`);
    }
  };

  const handleMarkAsHotLead = async (contact: Contact) => {
    if (!contact.name) return;
    const newHotLead = await onAddHotLead({
      ...contact,
      dateAdded: new Date().toISOString(),
      completedFollowUps: {},
    });
    if (newHotLead) alert(`${contact.name} marked as a hot lead!`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6">
      {/* LEFT COLUMN – calendar + KPIs + quick actions */}
      <div className="space-y-8">
        <Calendar selectedDate={selectedDate} onDateChange={onDateChange} />
        <ProspectingKPIs
          contacts={currentData.prospectingContacts}
          events={currentData.events as CalendarEvent[]}
        />
        <QuickActions
          onSetAppointment={handleQuickSetAppointment}
          onAddToHotLeads={handleQuickAddToHotLeads}
        />
      </div>

      {/* RIGHT COLUMN – Prospecting table */}
      <div className="lg:col-span-1">
        <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-brand-light-text dark:text-white">
              Prospecting List - {selectedDate.toLocaleDateString()}
            </h2>
            <CSVImporter onImport={handleCSVImport} />
          </div>

          <div className="overflow-x-auto max-h-[28rem] overflow-y-auto">
            <table className="w-full text-sm text-left table-fixed">
              <thead className="bg-brand-light-bg dark:bg-brand-gray/50 text-xs uppercase text-gray-500 dark:text-gray-400 sticky top-0 z-10">
                <tr>
                  <th className="p-2 w-10 text-center">#</th>
                  <th className="p-2 w-1/5">Name</th>
                  <th className="p-2 w-1/5">Company</th>
                  <th className="p-2 w-1/5">Phone</th>
                  <th className="p-2 w-1/4">Email</th>
                  <th className="p-2 w-10 text-center">Hot</th>
                  <th className="p-2 w-[220px] text-center">Codes</th>
                </tr>
              </thead>
              <tbody>
                {currentData.prospectingContacts.map((contact, index) => (
                  <tr
                    key={contact.id}
                    className="border-b border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white"
                  >
                    <td className="p-2 text-gray-500 dark:text-gray-400 text-center">
                      {index + 1}
                    </td>

                    {/* Name */}
                    <td>
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) =>
                          handleContactChange(index, 'name', e.target.value)
                        }
                        className="w-full bg-transparent p-1 text-sm focus:outline-none focus:bg-brand-light-bg dark:focus:bg-brand-gray/50 rounded dark:text-white"
                      />
                    </td>

                    {/* Company */}
                    <td>
                      <input
                        type="text"
                        value={contact.company || ''}
                        onChange={(e) =>
                          handleContactChange(
                            index,
                            'company' as any,
                            e.target.value
                          )
                        }
                        className="w-full bg-transparent p-1 text-sm focus:outline-none focus:bg-brand-light-bg dark:focus:bg-brand-gray/50 rounded dark:text-white"
                      />
                    </td>

                    {/* Phone */}
                    <td>
                      <input
                        type="tel"
                        value={contact.phone}
                        onChange={(e) =>
                          handleContactChange(index, 'phone', e.target.value)
                        }
                        className="w-full bg-transparent p-1 text-sm focus:outline-none focus:bg-brand-light-bg dark:focus:bg-brand-gray/50 rounded dark:text-white"
                      />
                    </td>

                    {/* Email */}
                    <td>
                      <input
                        type="email"
                        value={contact.email}
                        onChange={(e) =>
                          handleContactChange(index, 'email', e.target.value)
                        }
                        className="w-full bg-transparent p-1 text-sm focus:outline-none focus:bg-brand-light-bg dark:focus:bg-brand-gray/50 rounded dark:text-white"
                      />
                    </td>

                    {/* Hot (flame) */}
                    <td className="p-2 text-center">
                      <button
                        onClick={() => handleMarkAsHotLead(contact)}
                        disabled={!contact.name}
                        className="text-lg disabled:opacity-40 disabled:cursor-not-allowed hover:scale-110 transition-transform"
                        title="Mark as Hot Lead"
                      >
                        🔥
                      </button>
                    </td>

                    {/* Codes – slightly smaller */}
                    <td className="p-2">
                      <div className="flex items-center justify-center space-x-1">
                        {prospectingCodes.map((code) => (
                          <button
                            key={code}
                            onClick={() => handleProspectingChange(index, code)}
                            title={prospectingCodeDescriptions[code]}
                            className={`w-6 h-6 flex items-center justify-center rounded text-[10px] font-mono transition-colors ${
                              contact.prospecting[code]
                                ? code === 'SA'
                                  ? 'bg-brand-blue text-white'
                                  : 'bg-brand-red text-white'
                                : 'bg-gray-200 dark:bg-brand-gray text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-brand-gray/50'
                            }`}
                          >
                            {code}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Code legend */}
          <div className="mt-4 pt-2 border-t border-brand-light-border dark:border-brand-gray">
            <h4 className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">
              Code Legend
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs">
              {prospectingCodes.map((code) => (
                <div key={code} className="flex items-center">
                  <span className="font-mono font-bold text-brand-light-text dark:text-white mr-2">
                    {code}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {prospectingCodeDescriptions[code]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProspectingPage;
