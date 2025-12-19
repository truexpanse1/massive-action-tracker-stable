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
      ? { ...clientData, userId: loggedInUser.id }
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

      setImportProgress('Fetching paid invoices from GoHighLevel...');

      // Create GHL service
      const ghlService = createGHLService(integration.ghl_api_key, integration.ghl_location_id);

      // NEW APPROACH: Fetch ALL successful transactions
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
      
      console.log(`📊 Total successful transactions found: ${allTransactions.length}`);
      
      // Log unique statuses found
      const uniqueStatuses = new Set(allTransactions.map(txn => txn.status));
      console.log(`🏷️ Transaction statuses found:`, Array.from(uniqueStatuses));
      
      if (allTransactions.length === 0) {
        throw new Error('No successful transactions found in GoHighLevel. Make sure you have completed payments. Check your GHL Payments > Transactions page.');
      }
      
      // Group transactions by contact ID
      const transactionsByContact = new Map<string, any[]>();
      for (const transaction of allTransactions) {
        if (transaction.contactId) {
          if (!transactionsByContact.has(transaction.contactId)) {
            transactionsByContact.set(transaction.contactId, []);
          }
          transactionsByContact.get(transaction.contactId)!.push(transaction);
        }
      }
      
      console.log(`👥 Unique customers with transactions: ${transactionsByContact.size}`);
      
      setImportProgress(`Found ${allTransactions.length} transactions. Importing to MAT...`);

      // Import transactions directly - no client creation needed!
      let totalTransactionsImported = 0;
      
      // Import each transaction directly - no client creation!
      for (const txn of allTransactions) {
        // Debug: Log the transaction object to see what fields are available
        console.log('🔍 Transaction fields:', {
          contactName: txn.contactName,
          name: txn.name,
          contactId: txn.contactId,
          amount: txn.amount,
          entitySourceName: txn.entitySourceName
        });
        
        // Get customer name from transaction (GHL uses 'contactName')
        const customerName = txn.contactName || txn.name || 'Unknown Customer';
        console.log('👤 Extracted customer name:', customerName);
        
        // Use entitySourceName for product (e.g., "New Recurring Invoice")
        let productName = txn.entitySourceName || txn.name || txn.description || 'Payment';
        
        // GHL amounts are in CENTS - convert to dollars
        let transactionAmount = txn.amount ? txn.amount / 100 : 0;
        
        const categorizedProduct = categorizeProduct(productName);
        
        // Use transaction date
        const transactionDate = txn.createdAt 
          ? new Date(txn.createdAt).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];
        
        // Direct database insert - bypass React state management!
        console.log(`💵 ${customerName}: "${productName}" → ${categorizedProduct} ($${transactionAmount})`);
        
        // Insert directly into Supabase transactions table
        const { error: insertError } = await supabase
          .from('transactions')
          .insert({
            date: transactionDate,
            client_name: customerName,
            product: categorizedProduct,
            amount: transactionAmount,
            is_recurring: false,
            user_id: loggedInUser.id,
            company_id: companyId,
          });
        
        if (insertError) {
          console.error(`❌ Failed to insert transaction for ${customerName}:`, insertError);
          throw new Error(`Database insert failed: ${insertError.message}`);
        }
        totalTransactionsImported++;
        
        if (totalTransactionsImported % 20 === 0) {
          setImportProgress(`Imported ${totalTransactionsImported} of ${allTransactions.length} transactions...`);
        }
      }

      setImportSuccess(`✅ Successfully imported ${totalTransactionsImported} transactions from GoHighLevel!`);
      console.log(`📊 Import Summary: ${totalTransactionsImported} transactions created from ${transactionsByContact.size} unique customers`);
      setTimeout(() => setImportSuccess(null), 10000);
    } catch (error: any) {
      console.error('GHL Import Error:', error);
      setImportError(error.message || 'Failed to import contacts from GoHighLevel');
    } finally {
      setIsImportingFromGHL(false);
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
                <button
                  onClick={handleImportFromGHL}
                  disabled={isImportingFromGHL}
                  className="bg-brand-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isImportingFromGHL ? '⏳ Importing...' : '📥 Import from GHL'}
                </button>
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
