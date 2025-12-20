// New Client Import Function for NewClientsPage.tsx
// This replaces the existing handleImportFromGHL function

const handleImportClientsFromGHL = async () => {
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

    // Fetch ALL transactions to calculate financial metrics
    let allTransactions: any[] = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      try {
        const result = await ghlService.getTransactions(limit, offset, { paymentMode: 'live' });
        const transactions = result.data || [];
        
        const successfulTransactions = transactions.filter(txn => {
          const status = (txn.status || '').toLowerCase();
          return status === 'succeeded' || status === 'success';
        });
        
        allTransactions.push(...successfulTransactions);
        
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
            sales_process_length: '0', // Unknown from GHL
            monthly_contract_value: mcv,
            initial_amount_collected: oneTimeRevenue,
            close_date: closeDate,
            stage: contactTransactions.length > 0 ? 'Closed' : 'New',
            user_id: loggedInUser.id,
            company_id: companyId,
            ghl_contact_id: contact.id,
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
