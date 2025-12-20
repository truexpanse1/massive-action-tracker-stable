import React, { useState, useMemo } from 'react';
import { NewClient, User, Transaction, formatCurrency } from '../types';
import Calendar from '../components/Calendar';
import NewClientKPIs from '../components/NewClientKPIs';
import AddClientModal from '../components/AddClientModal';
import ClientCSVImporter from '../components/ClientCSVImporter';
import { syncClientToGHL } from '../src/services/ghlSyncService';
import { supabase } from '../src/services/supabaseClient';
import { createGHLService } from '../src/services/ghlService';
import { categorizeProduct } from '../src/utils/productCategorizer';

interface NewClientsPageProps {
  newClients: NewClient[];
  onSaveClient: (client: NewClient) => Promise<void>;
  onSaveTransaction?: (transaction: Transaction) => Promise<void>;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  loggedInUser: User;
  users: User[];
  transactions?: Transaction[];
  companyId: string;
}

interface ClientCardProps {
  client: NewClient;
  onClick: () => void;
  userColor?: string;
}

const ClientCard: React.FC<ClientCardProps> = ({
  client,
  onClick,
  userColor = '#6b7280',
}) => (
  <div
    onClick={onClick}
    className="bg-brand-light-bg dark:bg-brand-gray/50 p-3 rounded-md border border-brand-light-border dark:border-brand-gray shadow-sm cursor-pointer hover:border-brand-blue flex items-center space-x-3 transition-all"
  >
    <div className="flex-shrink-0">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8"
        viewBox="0 0 20 20"
        fill={userColor}
      >
        <path
          fillRule="evenodd"
          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
          clipRule="evenodd"
        />
      </svg>
    </div>
    <div className="flex-grow overflow-hidden">
      <p
        className="font-bold text-sm text-brand-light-text dark:text-white truncate"
        title={client.name}
      >
        {client.name}
      </p>
      <p className="text-xs text-brand-lime font-semibold">
        {formatCurrency(client.initialAmountCollected)}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Closed: {client.closeDate}
      </p>
    </div>
  </div>
);

const NewClientsPage: React.FC<NewClientsPageProps> = ({
  newClients,
  onSaveClient,
  onSaveTransaction,
  selectedDate,
  onDateChange,
  loggedInUser,
  users,
  transactions = [],
  companyId,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<NewClient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRepId, setSelectedRepId] = useState<string>('all');
  
  // GHL Import states
  const [isImportingFromGHL, setIsImportingFromGHL] = useState(false);
  const [importProgress, setImportProgress] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);

  const userColors = [
    '#2F81F7',
    '#34D399',
    '#FBBF24',
    '#A855F7',
    '#E53E3E',
    '#EC4899',
    '#06B6D4',
  ];

  // Only active sales reps are used for filters & colors
  const salesReps = useMemo(
    () => users.filter((u) => u.role === 'Sales Rep' && u.status === 'Active'),
    [users]
  );

  const userColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    salesReps.forEach((user, index) => {
      map[user.id] = userColors[index % userColors.length];
    });
    return map;
  }, [salesReps]);

  const filteredClients = useMemo(() => {
    const sortedClients = [...newClients].sort(
      (a, b) =>
        new Date(b.closeDate).getTime() - new Date(a.closeDate).getTime()
    );

    const repFiltered =
      selectedRepId === 'all'
        ? sortedClients
        : sortedClients.filter((client) => client.userId === selectedRepId);

    if (!searchTerm.trim()) return repFiltered;

    const lowercasedFilter = searchTerm.toLowerCase();
    const numericSearchTerm = searchTerm.replace(/[^\d]/g, '');

    return repFiltered.filter((client) => {
      const name = client.name?.toLowerCase() || '';
      const company = client.company?.toLowerCase() || '';
      const email = client.email?.toLowerCase() || '';
      const clientPhoneNumeric = client.phone?.replace(/[^\d]/g, '') || '';

      return (
        name.includes(lowercasedFilter) ||
        company.includes(lowercasedFilter) ||
        email.includes(lowercasedFilter) ||
        (numericSearchTerm && clientPhoneNumeric.includes(numericSearchTerm))
      );
    });
  }, [newClients, searchTerm, selectedRepId]);

  const handleOpenModalForNew = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleOpenModalForEdit = (client: NewClient) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleSaveClient = async (clientData: NewClient) => {
    console.log('📦 NewClientsPage handleSaveClient called with:', clientData);
    const payload: NewClient = String(clientData.id).startsWith('manual-')
      ? { ...clientData, userId: loggedInUser.id, assignedTo: loggedInUser.id }
      : clientData;

    console.log('📦 Calling onSaveClient with payload:', payload);
    await onSaveClient(payload);
    
    // Sync to GHL after saving
    console.log('🔄 About to sync to GHL...');
    try {
      // Get the client ID from the saved client (it should be in newClients after onSaveClient completes)
      // For now, we'll trigger sync after a short delay to ensure DB save completes
      setTimeout(async () => {
        const savedClients = document.querySelectorAll('[class*="ClientCard"]');
        console.log('🔍 Found clients:', savedClients.length);
        // We'll need to get the actual client ID from the database
        // For testing, let's just log that we got here
        console.log('✅ Sync trigger point reached!');
      }, 1000);
    } catch (error) {
      console.error('❌ GHL sync error:', error);
    }
    
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const handleCSVImport = (importedData: Array<Partial<NewClient>>) => {
    importedData.forEach((client, index) => {
      const newClient: NewClient = {
        id: `manual-${Date.now()}-${index}`, // temporary ID; DB will replace it
        name: client.name || 'Unnamed Client',
        company: client.company || '',
        phone: client.phone || '',
        email: client.email || '',
        address: client.address || '',
        salesProcessLength: client.salesProcessLength || '',
        monthlyContractValue: Number(client.monthlyContractValue) || 0,
        initialAmountCollected: Number(client.initialAmountCollected) || 0,
        closeDate:
          client.closeDate &&
          !isNaN(new Date(client.closeDate).getTime())
            ? client.closeDate
            : new Date().toISOString().split('T')[0],
        userId: loggedInUser.id,
        companyId: loggedInUser.companyId,
      };
      onSaveClient(newClient);
    });
  };

  const handleImportFromGHL = async () => {
    setIsImportingFromGHL(true);
    setImportProgress('Connecting to GoHighLevel...');
    setImportError(null);
    setImportSuccess(null);

    try {
      // Get GHL integration
      const { data: integration, error: integrationError } = await supabase
        .from('ghl_integrations')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .single();

      if (integrationError || !integration) {
        throw new Error('GHL integration not found. Please configure in Settings → GHL Integration.');
      }

      setImportProgress('Fetching contacts from GoHighLevel...');

      const ghlService = createGHLService(integration.ghl_api_key, integration.ghl_location_id);

      // Fetch ALL contacts from GHL
      const allContacts = await ghlService.importAllContacts();
      console.log(`👥 Found ${allContacts.length} contacts in GHL`);

      if (allContacts.length === 0) {
        throw new Error('No contacts found in GoHighLevel.');
      }

      setImportProgress(`Found ${allContacts.length} contacts. Fetching transaction data...`);

      // Fetch ALL successful transactions to calculate financial metrics
      let allTransactions: any[] = [];
      let offset = 0;
      const limit = 100;
      let hasMore = true;
      
      while (hasMore) {
        try {
          // Fetch transactions from GHL (live mode only)
          const result = await ghlService.getTransactions(limit, offset, { paymentMode: 'live' });
          const transactions = result.data || [];
          
          // Log first transaction to see structure
          if (offset === 0 && transactions.length > 0) {
            console.log('🔍 Sample transaction structure:', JSON.stringify(transactions[0], null, 2));
          }
          
          // Filter for SUCCESSFUL transactions only
          const successfulTransactions = transactions.filter(txn => {
            const status = (txn.status || '').toLowerCase();
            return status === 'succeeded' || status === 'success';
          });
          
          allTransactions.push(...successfulTransactions);
          
          console.log(`📦 Fetched ${transactions.length} total transactions, ${successfulTransactions.length} successful (offset ${offset})`);
          
          // Check if there are more transactions
          if (transactions.length < limit) {
            hasMore = false;
          } else {
            offset += limit;
          }
        } catch (error) {
          console.error('⚠️ Error fetching transactions:', error);
          hasMore = false;
        }
      }
      
      console.log(`💰 Found ${allTransactions.length} successful transactions`);

      // Group transactions by contactId
      const transactionsByContact = new Map<string, any[]>();
      for (const txn of allTransactions) {
        if (txn.contactId) {
          if (!transactionsByContact.has(txn.contactId)) {
            transactionsByContact.set(txn.contactId, []);
          }
          transactionsByContact.get(txn.contactId)!.push(txn);
        }
      }

      setImportProgress(`Processing ${allContacts.length} contacts...`);

      let clientsImported = 0;
      let clientsSkipped = 0;

      for (const contact of allContacts) {
        try {
          // Skip contacts without basic info
          if (!contact.id) {
            clientsSkipped++;
            continue;
          }

          // Check if client already exists
          const { data: existingClient } = await supabase
            .from('clients')
            .select('id')
            .eq('ghl_contact_id', contact.id)
            .eq('company_id', companyId)
            .single();

          if (existingClient) {
            clientsSkipped++;
            continue;
          }

          // Get transactions for this contact
          const contactTransactions = transactionsByContact.get(contact.id) || [];
          
          // Calculate financial metrics
          let totalRevenue = 0;
          let recurringRevenue = 0;
          let oneTimeRevenue = 0;
          let firstTransactionDate: Date | null = null;

          for (const txn of contactTransactions) {
            const amount = txn.amount_received ? txn.amount_received / 100 : (txn.amount || 0);
            totalRevenue += amount;

            const isRecurring = txn.entitySourceName?.toLowerCase().includes('recurring') || 
                               txn.entitySourceName?.toLowerCase().includes('subscription');
            
            if (isRecurring) {
              recurringRevenue += amount;
            } else {
              oneTimeRevenue += amount;
            }

            const txnDate = new Date(txn.createdAt);
            if (!firstTransactionDate || txnDate < firstTransactionDate) {
              firstTransactionDate = txnDate;
            }
          }

          // Calculate MCV (Monthly Contract Value) - use recurring revenue
          const mcv = recurringRevenue;

          // Calculate ACV (Annual Contract Value) - MCV * 12
          const acv = mcv * 12;

          // Prepare client data
          const clientName = contact.name || 
                            `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 
                            'Unknown Contact';

          const closeDate = firstTransactionDate 
            ? firstTransactionDate.toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];

          // Insert client into database
          // Only admins can import from GHL, so assign to admin
          const { error: insertError } = await supabase
            .from('clients')
            .insert({
              name: clientName,
              company: contact.companyName || '',
              phone: contact.phone || '',
              email: contact.email || '',
              address: contact.address1 || '',
              city: contact.city || '',
              state: contact.state || '',
              zip: contact.postalCode || '',
              sales_process_length: '0',
              monthly_contract_value: mcv,
              initial_amount_collected: oneTimeRevenue,
              close_date: closeDate,
              stage: contactTransactions.length > 0 ? 'Closed' : 'New',
              user_id: loggedInUser.id,
              company_id: companyId,
              ghl_contact_id: contact.id,
              assigned_to: loggedInUser.id, // Assign to admin who imported
            });

          if (insertError) {
            console.error(`❌ Failed to insert client ${clientName}:`, insertError);
          } else {
            clientsImported++;
            console.log(`✅ Imported client: ${clientName} (MCV: $${mcv}, ACV: $${acv}, Total: $${totalRevenue})`);
          }

          if (clientsImported % 10 === 0) {
            setImportProgress(`Imported ${clientsImported} of ${allContacts.length} clients...`);
          }

        } catch (error) {
          console.error(`Error processing contact ${contact.id}:`, error);
          clientsSkipped++;
        }
      }

      // Update last sync timestamp
      await supabase
        .from('ghl_integrations')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('company_id', companyId);

      const summaryMessage = clientsSkipped > 0
        ? `✅ Imported ${clientsImported} new clients! (Skipped ${clientsSkipped} duplicates/invalid)`
        : `✅ Successfully imported ${clientsImported} clients!`;

      setImportSuccess(summaryMessage);
      console.log(`📊 Import Summary: ${clientsImported} new clients, ${clientsSkipped} skipped`);
      
      // Reload page to show new clients
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error('GHL Client Import Error:', error);
      setImportError(error.message || 'Failed to import clients from GoHighLevel');
    } finally {
      setIsImportingFromGHL(false);
      setImportProgress('');
    }
  };

  const handleAutoGenerateClients = async () => {
    if (!transactions || transactions.length === 0) {
      setImportError('No transactions found to generate clients from.');
      return;
    }

    setIsAutoGenerating(true);
    setImportProgress('Analyzing transactions...');
    setImportError(null);
    setImportSuccess(null);

    try {
      // Group transactions by client name
      const clientMap = new Map<string, Transaction[]>();
      
      for (const txn of transactions) {
        const clientName = txn.clientName?.trim();
        if (!clientName) continue;
        
        if (!clientMap.has(clientName)) {
          clientMap.set(clientName, []);
        }
        clientMap.get(clientName)!.push(txn);
      }

      setImportProgress(`Found ${clientMap.size} unique clients. Creating client cards...`);

      // Check which clients already exist
      const existingClientNames = new Set(
        newClients.map(c => c.name?.toLowerCase()).filter(Boolean)
      );
      const existingCompanyNames = new Set(
        newClients.map(c => c.company?.toLowerCase()).filter(Boolean)
      );

      let createdCount = 0;
      let skippedCount = 0;

      // Create client cards for each unique client
      for (const [clientName, clientTransactions] of clientMap.entries()) {
        const lowerClientName = clientName.toLowerCase();
        
        // Skip if client already exists (by name or company)
        if (existingClientNames.has(lowerClientName) || existingCompanyNames.has(lowerClientName)) {
          skippedCount++;
          continue;
        }

        // Calculate financial metrics
        const totalRevenue = clientTransactions.reduce((sum, t) => sum + t.amount, 0);
        const recurringTransactions = clientTransactions.filter(t => t.isRecurring);
        const oneTimeTransactions = clientTransactions.filter(t => !t.isRecurring);
        
        const recurringRevenue = recurringTransactions.reduce((sum, t) => sum + t.amount, 0);
        const oneTimeRevenue = oneTimeTransactions.reduce((sum, t) => sum + t.amount, 0);
        
        // Get the earliest transaction date as close date
        const sortedDates = clientTransactions
          .map(t => new Date(t.date))
          .sort((a, b) => a.getTime() - b.getTime());
        const closeDate = sortedDates[0]?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0];

        // Create the client card
        const newClient: NewClient = {
          id: `auto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: clientName,
          company: clientName, // Use same name for company initially
          phone: '',
          email: '',
          address: '',
          city: '',
          state: '',
          zip: '',
          salesProcessLength: '',
          monthlyContractValue: recurringRevenue,
          initialAmountCollected: oneTimeRevenue,
          closeDate: closeDate,
          stage: 'Closed',
          userId: loggedInUser.id,
          companyId: companyId,
          assigned_to: loggedInUser.id,
        };

        // Save to database
        await onSaveClient(newClient);
        createdCount++;
        
        setImportProgress(`Created ${createdCount} of ${clientMap.size - skippedCount} clients...`);
      }

      setImportSuccess(`✅ Successfully created ${createdCount} client cards! ${skippedCount > 0 ? `(${skippedCount} already existed)` : ''}`);
      
      // Reload page to refresh the list
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error: any) {
      console.error('Auto-generate Error:', error);
      setImportError(error.message || 'Failed to generate clients');
    } finally {
      setIsAutoGenerating(false);
      setImportProgress('');
    }
  };

  const handleDeleteAllClients = async () => {
    if (!window.confirm('⚠️ Are you sure you want to DELETE ALL CLIENTS? This cannot be undone!')) {
      return;
    }

    setIsDeletingAll(true);
    setImportError(null);

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('company_id', companyId);

      if (error) throw error;

      setImportSuccess('✅ All clients deleted successfully!');
      setTimeout(() => setImportSuccess(null), 5000);
      
      // Reload page to refresh the list
      window.location.reload();
    } catch (error: any) {
      console.error('Delete All Error:', error);
      setImportError(error.message || 'Failed to delete clients');
    } finally {
      setIsDeletingAll(false);
    }
  };

  return (
    <>
      <AddClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveClient}
        client={editingClient}
        transactions={transactions}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-3 space-y-8">
          <Calendar selectedDate={selectedDate} onDateChange={onDateChange} />
          <NewClientKPIs newClients={newClients} />


        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-9">
          <div className="bg-brand-light-card dark:bg-brand-navy p-6 rounded-lg border border-brand-light-border dark:border-brand-gray">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <h1 className="text-3xl font-bold text-brand-light-text dark:text-white">
                New Clients
              </h1>
              <div className="flex items-center gap-2">
                {newClients.length > 0 && (
                  <button
                    onClick={handleDeleteAllClients}
                    disabled={isDeletingAll}
                    className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeletingAll ? '⏳ Deleting...' : '🗑️ Delete All'}
                  </button>
                )}
                {(loggedInUser.role === 'Admin' || loggedInUser.role === 'admin') && (
                  <>
                    <button
                      onClick={handleImportFromGHL}
                      disabled={isImportingFromGHL}
                      className="bg-brand-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isImportingFromGHL ? '⏳ Importing...' : '📥 Import from GHL'}
                    </button>
                    <button
                      onClick={handleAutoGenerateClients}
                      disabled={isAutoGenerating || !transactions || transactions.length === 0}
                      className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Automatically create client cards from existing transactions"
                    >
                      {isAutoGenerating ? '⏳ Generating...' : '✨ Auto-Generate from Transactions'}
                    </button>
                  </>
                )}
                <ClientCSVImporter onImport={handleCSVImport} />
                <button
                  onClick={handleOpenModalForNew}
                  className="bg-brand-lime text-brand-ink font-bold py-2 px-4 rounded-lg hover:bg-green-400 transition text-sm whitespace-nowrap"
                >
                  + Add Client
                </button>
              </div>
            </div>

            {/* Import Progress/Status Messages */}
            {importProgress && (
              <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900/30 border border-blue-500 rounded-lg text-blue-700 dark:text-blue-300 text-sm">
                ⏳ {importProgress}
              </div>
            )}
            {importSuccess && (
              <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-500 rounded-lg text-green-700 dark:text-green-300 text-sm">
                {importSuccess}
              </div>
            )}
            {importError && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-500 rounded-lg text-red-700 dark:text-red-300 text-sm">
                ❌ {importError}
              </div>
            )}

            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search clients by name, company, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-brand-light-bg dark:bg-brand-ink border border-brand-light-border dark:border-brand-gray rounded-lg text-brand-light-text dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>
            </div>

            {/* Client cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredClients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onClick={() => handleOpenModalForEdit(client)}
                  userColor={
                    client.userId ? userColorMap[client.userId] : undefined
                  }
                />
              ))}
            </div>

            {/* Empty states */}
            {newClients.length > 0 && filteredClients.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">
                  No clients match your search.
                </p>
              </div>
            )}

            {newClients.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">
                  No new clients yet.
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Convert a hot lead or add one manually!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NewClientsPage;
