import React, { useEffect, useState } from 'react';
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
import TargetsModal, { CalculatedTargets } from '../components/TargetsModal';
import { fetchUserTargets, saveUserTargets, UserTargets } from '../services/targetsService';
import LeadConverterModal from '../components/LeadConverterModal';
import ProspectFinderModal from '../components/ProspectFinderModal';

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
  user: { id: string; name: string; email: string };
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
  user,
}) => {
  const getDateKey = (date: Date): string => date.toISOString().split('T')[0];
  const currentDateKey = getDateKey(selectedDate);

  const currentData: DayData = allData[currentDateKey] || getInitialDayData();

  // Targets state
  const [userTargets, setUserTargets] = useState<UserTargets | null>(null);
  const [isTargetsModalOpen, setIsTargetsModalOpen] = useState(false);
  const [targetsLoading, setTargetsLoading] = useState(true);

  // Lead Converter state
  const [isLeadConverterOpen, setIsLeadConverterOpen] = useState(false);
  
  // Prospect Finder state
  const [isProspectFinderOpen, setIsProspectFinderOpen] = useState(false);

  // Load user targets on mount
  useEffect(() => {
    const loadTargets = async () => {
      try {
        const userId = user?.id || 'user-1';
        console.log('[ProspectingPage] Loading targets for userId:', userId);
        const targets = await fetchUserTargets(userId);
        if (targets) {
          console.log('[ProspectingPage] ✅ Loaded targets:', targets);
          setUserTargets(targets);
        } else {
          console.log('[ProspectingPage] No targets found');
        }
      } catch (error) {
        console.error('[ProspectingPage] ❌ Error loading targets:', error);
      } finally {
        setTargetsLoading(false);
      }
    };
    loadTargets();
  }, [user]);

  // Calculate today's progress
  const calculateProgress = () => {
    const contacts = currentData.prospectingContacts || [];
    const callsMade = contacts.filter(
      (c) => c.prospecting.SW || c.prospecting.NA || c.prospecting.LM
    ).length;
    const spokeWith = contacts.filter((c) => c.prospecting.SW).length;
    const appointmentsSet = 0; // Appointments tracked via Hot Leads page
    // Demos would come from EOD report or another source
    const demos = 0; // TODO: Get from actual data source

    return { callsMade, spokeWith, appointmentsSet, demos };
  };

  const progress = calculateProgress();

  // Handle saving targets
  const handleSaveTargets = async (targets: CalculatedTargets) => {
    try {
      console.log('[ProspectingPage] handleSaveTargets called with:', targets);
      console.log('[ProspectingPage] user object:', user);
      
      // Use user.id if available, otherwise fall back to 'user-1'
      const userId = user?.id || 'user-1';
      console.log('[ProspectingPage] Using userId:', userId);
      const companyId = 'company-1'; // TODO: Get from company context
      
      console.log('[ProspectingPage] Calling saveUserTargets with userId:', userId);

      const savedTargets = await saveUserTargets({
        user_id: userId,
        company_id: companyId,
        annual_revenue: targets.annualRevenue,
        avg_sale_amount: targets.avgSaleAmount,
        close_rate: targets.closeRate,
        show_rate: targets.showRate,
        contact_to_appt_rate: targets.contactToApptRate,
        call_to_contact_rate: targets.callToContactRate,
        daily_calls: targets.dailyCalls,
        daily_contacts: targets.dailyContacts,
        daily_appts: targets.dailyAppts,
        daily_demos: targets.dailyDemos,
        daily_deals: targets.dailyDeals,
        daily_revenue: targets.dailyRevenue,
        weekly_revenue: targets.weeklyRevenue,
      });

      console.log('[ProspectingPage] Targets saved successfully:', savedTargets);
      setUserTargets(savedTargets);
      alert('✅ Targets saved successfully!');
    } catch (error) {
      console.error('[ProspectingPage] Error saving targets:', error);
      alert('❌ Failed to save targets: ' + (error as Error).message);
    }
  };

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

  const handleDeleteContact = (index: number) => {
    const contact = currentData.prospectingContacts[index];
    const hasData = contact.name || contact.company || contact.phone || contact.email;
    
    if (hasData) {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete this prospect?\n${contact.name || contact.company || 'Unnamed'}`
      );
      if (!confirmDelete) return;
    }

    const newContacts = [...currentData.prospectingContacts];
    newContacts[index] = {
      id: `contact-${Date.now()}-${Math.random()}`,
      name: '',
      company: '',
      phone: '',
      email: '',
      interestLevel: 5,
      prospecting: {},
    };
    updateCurrentData({ prospectingContacts: newContacts });
  };

  const handleMoveToNextDay = (index: number) => {
    const contact = currentData.prospectingContacts[index];
    
    // Must have at least company or name to move
    if (!contact.name && !contact.company) {
      alert('Cannot move empty prospect. Add a company name first.');
      return;
    }

    // Get next day's date
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDateKey = nextDay.toISOString().split('T')[0];

    // Get next day's data
    const nextDayData = allData[nextDateKey] || getInitialDayData();
    const nextDayContacts = [...nextDayData.prospectingContacts];

    // Find first empty slot in next day
    const emptyIndex = nextDayContacts.findIndex(
      (c) => !c.name && !c.company && !c.phone && !c.email
    );

    if (emptyIndex === -1) {
      alert('Tomorrow\'s prospecting list is full. Clear some slots first.');
      return;
    }

    // Move contact to next day (keep all data and codes)
    nextDayContacts[emptyIndex] = { ...contact };

    // Save next day's data
    onDataChange(nextDateKey, {
      ...nextDayData,
      prospectingContacts: nextDayContacts,
    });

    // Clear from today
    const todayContacts = [...currentData.prospectingContacts];
    todayContacts[index] = {
      id: `contact-${Date.now()}-${Math.random()}`,
      name: '',
      company: '',
      phone: '',
      email: '',
      interestLevel: 5,
      prospecting: {},
    };
    updateCurrentData({ prospectingContacts: todayContacts });

    // Show success message
    const displayName = contact.name || contact.company;
    alert(`✅ Moved "${displayName}" to tomorrow (${nextDay.toLocaleDateString()})`);
  };

  const handleProspectingChange = (contactIndex: number, code: ProspectingCode) => {
    const newContacts = [...currentData.prospectingContacts];
    const contact = { ...newContacts[contactIndex] };
    const isBeingChecked = !contact.prospecting[code];

    const newProspecting = { ...contact.prospecting, [code]: isBeingChecked };
    newContacts[contactIndex] = { ...contact, prospecting: newProspecting };
    updateCurrentData({ prospectingContacts: newContacts });

    // Handle Move to Next Day
    if (code === 'MV' && isBeingChecked) {
      handleMoveToNextDay(contactIndex);
      // Don't actually toggle MV - it's an action, not a state
      return;
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
    
    // Show success message for appointment
    alert(`Appointment set for ${data.name} on ${data.date} at ${data.time}. Contact added to Hot Leads with follow-up tracking!`);
  };

  const handleQuickAddToHotLeads = async (data: {
    name: string;
    phone: string;
    email: string;
    interestLevel: number;
    appointmentDate?: string; // Optional appointment date for auto-enrollment
  }) => {
    const newContactData = {
      name: data.name,
      date: new Date().toISOString().split('T')[0],
      phone: formatPhoneNumber(data.phone),
      email: data.email,
      interestLevel: data.interestLevel,
      prospecting: {},
      dateAdded: new Date().toISOString(),
      appointmentDate: data.appointmentDate, // Pass appointment date for follow-up tracking
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
      // Only show alert if not auto-enrolled from appointment
      if (!data.appointmentDate) {
        alert(`${data.name} added to Hot Leads!`);
      }
    }
  };

  const handleMarkAsHotLead = async (contact: Contact) => {
    // Use company name if contact name is missing
    const displayName = contact.name || contact.company;
    if (!displayName) {
      alert('Please add a name or company before marking as hot lead.');
      return;
    }
    
    const newHotLead = await onAddHotLead({
      ...contact,
      name: displayName, // Use company name if no contact name
      dateAdded: new Date().toISOString(),
      completedFollowUps: {},
    });
    if (newHotLead) {
      alert(`${displayName} marked as a hot lead!`);
      onAddWin(currentDateKey, `Added ${displayName} to Hot Leads.`);
    }
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
            <div className="flex gap-2">
              <button
                onClick={() => setIsProspectFinderOpen(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                🔍 Find Prospects
              </button>
              <button
                onClick={() => setIsLeadConverterOpen(true)}
                className="bg-[#00d4ff] text-[#0a0e27] px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#00b8e6] transition-colors flex items-center gap-2"
              >
                🔗 Lead Converter
              </button>
              <CSVImporter onImport={handleCSVImport} />
            </div>
          </div>

          <div className="overflow-x-auto max-h-[28rem] overflow-y-auto">
            <table className="w-full text-sm text-left table-fixed">
              <thead className="bg-brand-light-bg dark:bg-brand-gray/50 text-xs uppercase text-gray-500 dark:text-gray-400 sticky top-0 z-10">
                <tr>
                  <th className="p-2 w-10 text-center">#</th>
                  <th className="p-2 w-1/5">Name</th>
                  <th className="p-2 w-1/5 hidden md:table-cell">Company</th>
                  <th className="p-2 w-1/5">Phone</th>
                  <th className="p-2 w-1/4 hidden md:table-cell">Email</th>
                  <th className="p-2 w-10 text-center">Hot</th>
                  <th className="p-2 w-[220px] text-center hidden md:table-cell">Codes</th>
                  <th className="p-2 w-10 text-center">Del</th>
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
                      {/* Mobile: Show codes below name */}
                      <div className="flex md:hidden items-center justify-start space-x-1 mt-1">
                        {prospectingCodes.map((code) => (
                          <button
                            key={code}
                            onClick={() => handleProspectingChange(index, code)}
                            title={prospectingCodeDescriptions[code]}
                            className={`w-6 h-6 flex items-center justify-center rounded text-[10px] font-mono transition-colors ${
                              code === 'MV'
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : contact.prospecting[code]
                                ? 'bg-brand-red text-white'
                                : 'bg-gray-200 dark:bg-brand-gray text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-brand-gray/50'
                            }`}
                          >
                            {code === 'MV' ? '>' : code}
                          </button>
                        ))}
                      </div>
                    </td>

                    {/* Company */}
                    <td className="hidden md:table-cell">
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
                    <td className="hidden md:table-cell">
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
                        disabled={!contact.name && !contact.company}
                        className="text-lg disabled:opacity-40 disabled:cursor-not-allowed hover:scale-110 transition-transform"
                        title="Mark as Hot Lead"
                      >
                        🔥
                      </button>
                    </td>

                    {/* Codes – slightly smaller (Desktop only) */}
                    <td className="p-2 hidden md:table-cell">
                      <div className="flex items-center justify-center space-x-1">
                        {prospectingCodes.map((code) => (
                          <button
                            key={code}
                            onClick={() => handleProspectingChange(index, code)}
                            title={prospectingCodeDescriptions[code]}
                            className={`w-6 h-6 flex items-center justify-center rounded text-[10px] font-mono transition-colors ${
                              code === 'MV'
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : contact.prospecting[code]
                                ? 'bg-brand-red text-white'
                                : 'bg-gray-200 dark:bg-brand-gray text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-brand-gray/50'
                            }`}
                          >
                            {code === 'MV' ? '>' : code}
                          </button>
                        ))}
                      </div>
                    </td>

                    {/* Delete button */}
                    <td className="p-2 text-center">
                      <button
                        onClick={() => handleDeleteContact(index)}
                        className="text-red-500 hover:text-red-700 hover:scale-110 transition-transform text-lg"
                        title="Delete prospect"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Targets Section */}
          {!targetsLoading && (
            <div className="mt-4 pt-4 border-t border-brand-light-border dark:border-brand-gray">
              {userTargets ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-bold text-brand-lime">📋 YOUR DAILY PLAN</h4>
                      {userTargets.adopted_date && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Adopted {new Date(userTargets.adopted_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setIsTargetsModalOpen(true)}
                      className="text-xs text-gray-400 hover:text-brand-lime transition-colors"
                    >
                      ⚙️ Change Plan
                    </button>
                  </div>

                  {/* Targets Grid with Progress Bars */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Calls */}
                    <div className="bg-brand-light-bg dark:bg-brand-gray/30 rounded-lg p-3">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">CALLS</div>
                      <div className="text-xl font-bold text-brand-lime mb-2">
                        {progress.callsMade}/{userTargets.daily_calls}
                      </div>
                      <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            progress.callsMade >= userTargets.daily_calls
                              ? 'bg-green-500'
                              : 'bg-brand-lime'
                          }`}
                          style={{
                            width: `${Math.min(
                              (progress.callsMade / userTargets.daily_calls) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Talks/Contacts */}
                    <div className="bg-brand-light-bg dark:bg-brand-gray/30 rounded-lg p-3">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">TALKS</div>
                      <div className="text-xl font-bold text-brand-lime mb-2">
                        {progress.spokeWith}/{userTargets.daily_contacts}
                      </div>
                      <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            progress.spokeWith >= userTargets.daily_contacts
                              ? 'bg-green-500'
                              : 'bg-brand-lime'
                          }`}
                          style={{
                            width: `${Math.min(
                              (progress.spokeWith / userTargets.daily_contacts) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Meetings */}
                    <div className="bg-brand-light-bg dark:bg-brand-gray/30 rounded-lg p-3">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">MEETINGS</div>
                      <div className="text-xl font-bold text-brand-lime mb-2">
                        {progress.appointmentsSet}/{userTargets.daily_appts}
                      </div>
                      <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            progress.appointmentsSet >= userTargets.daily_appts
                              ? 'bg-green-500'
                              : 'bg-brand-lime'
                          }`}
                          style={{
                            width: `${Math.min(
                              (progress.appointmentsSet / userTargets.daily_appts) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Demos */}
                    <div className="bg-brand-light-bg dark:bg-brand-gray/30 rounded-lg p-3">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">DEMOS</div>
                      <div className="text-xl font-bold text-brand-lime mb-2">
                        {progress.demos}/{userTargets.daily_demos}
                      </div>
                      <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            progress.demos >= userTargets.daily_demos
                              ? 'bg-green-500'
                              : 'bg-brand-lime'
                          }`}
                          style={{
                            width: `${Math.min(
                              (progress.demos / userTargets.daily_demos) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Set your daily targets to track progress
                  </p>
                  <button
                    onClick={() => setIsTargetsModalOpen(true)}
                    className="bg-brand-lime text-gray-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-400 transition-colors"
                  >
                    🎯 Set My Targets
                  </button>
                </div>
              )}
            </div>
          )}

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

      {/* Targets Modal */}
      <TargetsModal
        isOpen={isTargetsModalOpen}
        onClose={() => setIsTargetsModalOpen(false)}
        onSave={handleSaveTargets}
        initialValues={
          userTargets && userTargets.annual_revenue !== undefined
            ? {
                annualRevenue: (userTargets.annual_revenue || 0).toString(),
                avgSaleAmount: (userTargets.avg_sale_amount || 0).toString(),
                closeRate: (userTargets.close_rate || 0).toString(),
                showRate: (userTargets.show_rate || 0).toString(),
                contactToApptRate: (userTargets.contact_to_appt_rate || 0).toString(),
                callToContactRate: (userTargets.call_to_contact_rate || 0).toString(),
              }
            : undefined
        }
      />

      {/* Lead Converter Modal */}
      <LeadConverterModal
        isOpen={isLeadConverterOpen}
        onClose={() => setIsLeadConverterOpen(false)}
        onLeadsAdded={(leads: Array<{company: string; phone: string; email: string}>) => {
          // Add leads to prospecting contacts
          const newContacts = [...currentData.prospectingContacts];
          let addedCount = 0;

          for (const lead of leads) {
            // Find first empty slot
            const emptyIndex = newContacts.findIndex(
              (c) => !c.name && !c.phone && !c.email && !c.company
            );
            
            if (emptyIndex !== -1) {
              newContacts[emptyIndex] = {
                ...newContacts[emptyIndex],
                company: lead.company,
                phone: lead.phone,
                email: lead.email,
                name: '', // Leave name blank for user to fill
                date: new Date().toISOString().split('T')[0],
              };
              addedCount++;
            } else {
              break; // No more empty slots
            }
          }

          updateCurrentData({ prospectingContacts: newContacts });
          alert(`Successfully added ${addedCount} prospects to the list!`);
        }}
      />

      {/* Prospect Finder Modal */}
      <ProspectFinderModal
        isOpen={isProspectFinderOpen}
        onClose={() => setIsProspectFinderOpen(false)}
        onImport={(prospects: Array<{company: string; phone: string; email: string; contactName: string}>) => {
          // Add prospects to prospecting contacts
          const newContacts = [...currentData.prospectingContacts];
          let addedCount = 0;

          for (const prospect of prospects) {
            // Find first empty slot
            const emptyIndex = newContacts.findIndex(
              (c) => !c.name && !c.phone && !c.email && !c.company
            );
            
            if (emptyIndex !== -1) {
              newContacts[emptyIndex] = {
                ...newContacts[emptyIndex],
                company: prospect.company,
                phone: prospect.phone,
                email: prospect.email,
                name: prospect.contactName || '',
                date: new Date().toISOString().split('T')[0],
              };
              addedCount++;
            } else {
              break; // No more empty slots
            }
          }

          updateCurrentData({ prospectingContacts: newContacts });
          alert(`Successfully added ${addedCount} prospects to the list!`);
        }}
      />
    </div>
  );
};

export default ProspectingPage;
