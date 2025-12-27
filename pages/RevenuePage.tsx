

import React, { useState, useMemo, useEffect } from 'react';
import { Transaction, User, formatCurrency } from '../types';
import { supabase } from '../src/services/supabaseClient';
import { createGHLService } from '../src/services/ghlService';
import { categorizeProduct } from '../src/utils/productCategorizer';
import Calendar from '../components/Calendar';
import IndustrySelector from '../components/IndustrySelector';
import RevenueAIEvaluator from '../components/RevenueAIEvaluator';
import DatePicker from '../components/DatePicker';
import BarChart from '../components/BarChart';


interface RevenuePageProps {
  transactions: Transaction[];
  onSaveTransaction: (transaction: Transaction) => Promise<void>;
  onDeleteTransaction: (transactionId: string) => Promise<void>;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  initialState: { viewMode: 'daily' | 'analysis', dateRange?: { start: string, end: string }} | null;
  onInitialStateConsumed: () => void;
  loggedInUser: User;
  companyId: string;
}

const RevenuePage: React.FC<RevenuePageProps> = ({ transactions, onSaveTransaction, onDeleteTransaction, selectedDate, onDateChange, initialState, onInitialStateConsumed, loggedInUser, companyId }) => {
    const [viewMode, setViewMode] = useState<'daily' | 'analysis'>('daily');
    
    const [clientName, setClientName] = useState('');
    const [product, setProduct] = useState('');
    const [amount, setAmount] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [userProducts, setUserProducts] = useState<string[]>(() => Array.from(new Set(transactions.map(t => t.product))));
    const [analyzedProduct, setAnalyzedProduct] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // GHL Import states
    const [isImportingFromGHL, setIsImportingFromGHL] = useState(false);
    const [importProgress, setImportProgress] = useState<string>('');
    const [importError, setImportError] = useState<string | null>(null);
    const [importSuccess, setImportSuccess] = useState<string | null>(null);
    
    // Product drill-down modal state
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [showProductModal, setShowProductModal] = useState(false);
    
    // Date drill-down modal state
    const [selectedDateForModal, setSelectedDateForModal] = useState<string | null>(null);
    const [showDateModal, setShowDateModal] = useState(false);
    const [dateModalProductFilter, setDateModalProductFilter] = useState<string>('');
    const [dateModalMinAmount, setDateModalMinAmount] = useState<string>('');


    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    const [dateRange, setDateRange] = useState({ start: thirtyDaysAgo.toISOString().split('T')[0], end: today });

    const getDateKey = (date: Date): string => date.toISOString().split('T')[0];

    useEffect(() => {
        if (initialState) {
            setViewMode(initialState.viewMode);
            if (initialState.dateRange) {
                setDateRange(initialState.dateRange);
            }
            onInitialStateConsumed();
        }
    }, [initialState, onInitialStateConsumed]);
    
    useEffect(() => { 
        resetForm();
        setAnalyzedProduct(null);
    }, [selectedDate]);
    
    const transactionsForSelectedDate = useMemo(() => {
        const key = getDateKey(selectedDate);
        return (transactions || []).filter(t => t.date === key).sort((a,b) => a.clientName.localeCompare(b.clientName));
    }, [transactions, selectedDate]);
    
    const uniqueProductsToday = useMemo(() => {
        return Array.from(new Set(transactionsForSelectedDate.map(t => t.product)));
    }, [transactionsForSelectedDate]);
    
    const contributionData = useMemo(() => {
        if (!analyzedProduct) return null;

        const date = selectedDate;
        const todayKey = date.toISOString().split('T')[0];
        
        const startOfWeek = new Date(date);
        startOfWeek.setDate(startOfWeek.getDate() - date.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        const startOfWeekKey = startOfWeek.toISOString().split('T')[0];
        const endOfWeekKey = endOfWeek.toISOString().split('T')[0];

        const currentMonth = date.getMonth();
        const currentYear = date.getFullYear();

        let totals = { day: 0, week: 0, month: 0, year: 0 };
        let productTotals = { day: 0, week: 0, month: 0, year: 0 };

        (transactions || []).forEach(t => {
            const transactionDate = new Date(t.date + 'T00:00:00');

            if (t.date === todayKey) totals.day += t.amount;
            if (t.date >= startOfWeekKey && t.date <= endOfWeekKey) totals.week += t.amount;
            if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear) totals.month += t.amount;
            if (transactionDate.getFullYear() === currentYear) totals.year += t.amount;

            if (t.product === analyzedProduct) {
                if (t.date === todayKey) productTotals.day += t.amount;
                if (t.date >= startOfWeekKey && t.date <= endOfWeekKey) productTotals.week += t.amount;
                if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear) productTotals.month += t.amount;
                if (transactionDate.getFullYear() === currentYear) productTotals.year += t.amount;
            }
        });

        const calculatePercentage = (part: number, whole: number) => whole > 0 ? ((part / whole) * 100).toFixed(1) + '%' : '0.0%';

        return {
            day: calculatePercentage(productTotals.day, totals.day),
            week: calculatePercentage(productTotals.week, totals.week),
            month: calculatePercentage(productTotals.month, totals.month),
            year: calculatePercentage(productTotals.year, totals.year),
        };
    }, [analyzedProduct, transactions, selectedDate]);


    const analysisData = useMemo(() => {
        const { start, end } = dateRange;
        const filtered = (transactions || []).filter(t => t.date >= start && t.date <= end);
        
        const productBreakdown: Record<string, { revenue: number, count: number }> = {};
        let totalRevenue = 0;

        filtered.forEach(t => {
            if (!productBreakdown[t.product]) productBreakdown[t.product] = { revenue: 0, count: 0 };
            productBreakdown[t.product].revenue += t.amount;
            productBreakdown[t.product].count += 1;
            totalRevenue += t.amount;
        });

        const productChartData = Object.entries(productBreakdown).map(([product, data]) => ({ product, ...data })).sort((a, b) => b.revenue - a.revenue);
        
        // Group transactions by date and sum revenue (only include dates with transactions)
        const revenueByDate: Record<string, number> = {};
        filtered.forEach(t => {
            revenueByDate[t.date] = (revenueByDate[t.date] || 0) + t.amount;
        });
        
        // Convert to array and sort by date
        const timeChartData = Object.entries(revenueByDate)
            .map(([date, revenue]) => ({ date, revenue }))
            .sort((a, b) => a.date.localeCompare(b.date));
        
        // DEBUG: Log December 2025 raw data
        const dec2025Data = timeChartData.filter(d => d.date.startsWith('2025-12'));
        console.log('[DEBUG] Raw Dec 2025 data before grouping:', dec2025Data);
        console.log('[DEBUG] Raw Dec 2025 total:', dec2025Data.reduce((sum, d) => sum + d.revenue, 0));

        return { totalRevenue, totalTransactions: filtered.length, avgDealSize: filtered.length > 0 ? totalRevenue / filtered.length : 0, productChartData, timeChartData };

    }, [transactions, dateRange]);


    const resetForm = () => { setClientName(''); setProduct(''); setAmount(''); setIsRecurring(false); setEditingId(null); };
    
    // Handle product bar click
    const handleProductClick = (productName: string) => {
        setSelectedProduct(productName);
        setShowProductModal(true);
    };
    
    // Get transactions for selected product
    const productTransactions = useMemo(() => {
        if (!selectedProduct) return [];
        const { start, end } = dateRange;
        return (transactions || [])
            .filter(t => t.product === selectedProduct && t.date >= start && t.date <= end)
            .sort((a, b) => b.date.localeCompare(a.date)); // Most recent first
    }, [selectedProduct, transactions, dateRange]);
    
    // Handle date bar click
    const handleDateClick = (startDate: string, endDate: string, label: string) => {
        setSelectedDateForModal(JSON.stringify({ startDate, endDate, label }));
        setShowDateModal(true);
    };
    
    // Get transactions for selected date range
    const dateTransactions = useMemo(() => {
        if (!selectedDateForModal) return [];
        try {
            const { startDate, endDate } = JSON.parse(selectedDateForModal);
            let filtered = (transactions || [])
                .filter(t => t.date >= startDate && t.date <= endDate);
            
            // Apply product filter
            if (dateModalProductFilter) {
                filtered = filtered.filter(t => t.product.toLowerCase().includes(dateModalProductFilter.toLowerCase()));
            }
            
            // Apply minimum amount filter
            if (dateModalMinAmount) {
                const minAmount = parseFloat(dateModalMinAmount);
                if (!isNaN(minAmount)) {
                    filtered = filtered.filter(t => t.amount >= minAmount);
                }
            }
            
            return filtered.sort((a, b) => a.date.localeCompare(b.date) || a.clientName.localeCompare(b.clientName));
        } catch {
            return [];
        }
    }, [selectedDateForModal, transactions, dateModalProductFilter, dateModalMinAmount]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const numericAmount = parseFloat(amount);
        if (!clientName || !product || isNaN(numericAmount) || numericAmount < 0) {
            alert('Please fill out all fields with valid data.');
            setIsSubmitting(false);
            return;
        }

        const transactionData: Transaction = {
            id: editingId || `new-${Date.now()}`,
            date: getDateKey(selectedDate),
            clientName, product, amount: numericAmount, isRecurring
        };
        
        try {
            await onSaveTransaction(transactionData);
            if (!userProducts.includes(product)) setUserProducts(prev => [...prev, product].sort());
            resetForm();
        } catch (error) {
            console.error("Failed to save transaction:", error);
            alert("Could not save the transaction. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (transaction: Transaction) => { setEditingId(transaction.id); setClientName(transaction.clientName); setProduct(transaction.product); setAmount(transaction.amount.toString()); setIsRecurring(transaction.isRecurring); };
    const handleDelete = (id: string) => { if (window.confirm('Are you sure you want to delete this transaction?')) onDeleteTransaction(id); };
    
    const handleImportFromGHL = async () => {
      setIsImportingFromGHL(true);
      setImportProgress('Connecting to GoHighLevel...');
      setImportError(null);
      setImportSuccess(null);

      try {
        const { data: integration, error: integrationError } = await supabase
          .from('ghl_integrations')
          .select('*')
          .eq('company_id', companyId)
          .eq('is_active', true)
          .single();

        if (integrationError || !integration) {
          throw new Error('GHL integration not found. Please configure in Settings → GHL Integration.');
        }

        setImportProgress('Fetching transactions from GoHighLevel...');
        const ghlService = createGHLService(integration.ghl_api_key, integration.ghl_location_id);

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
        
        if (allTransactions.length === 0) {
          throw new Error('No successful transactions found in GoHighLevel.');
        }
        
        setImportProgress(`Found ${allTransactions.length} transactions. Analyzing product names...`);

        // SMART FALLBACK: Group transactions by contactId and fetch product names once per contact
        const transactionsByContact = new Map<string, any[]>();
        for (const txn of allTransactions) {
          if (txn.contactId) {
            if (!transactionsByContact.has(txn.contactId)) {
              transactionsByContact.set(txn.contactId, []);
            }
            transactionsByContact.get(txn.contactId)!.push(txn);
          }
        }

        console.log(`👥 Grouped transactions by ${transactionsByContact.size} unique contacts`);

        // For each contact, find their product name from first invoice
        const contactProductNames = new Map<string, string>();
        let contactIndex = 0;

        for (const [contactId, contactTransactions] of transactionsByContact) {
          contactIndex++;
          setImportProgress(`Analyzing products for contact ${contactIndex} of ${transactionsByContact.size}...`);
          
          // Sort by date to find the earliest transaction
          const sortedTransactions = contactTransactions.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateA - dateB;
          });
          
          // Try to find a transaction with an invoice
          let productName = 'Payment'; // Default fallback
          
          for (const txn of sortedTransactions) {
            if (txn.entityType === 'invoice' && txn.entityId) {
              try {
                console.log(`📥 Fetching invoice ${txn.entityId} for contact ${contactId}...`);
                const invoiceResponse = await ghlService.getInvoice(txn.entityId);
                const invoice = invoiceResponse.invoice;
                
                if (invoice.items && invoice.items.length > 0 && invoice.items[0].name) {
                  productName = invoice.items[0].name;
                  console.log(`✅ Found product for contact ${contactId}: "${productName}"`);
                  break; // Found it, stop looking
                }
              } catch (error) {
                console.warn(`⚠️ Could not fetch invoice ${txn.entityId}`);
              }
            }
          }
          
          // If no invoice found, use entitySourceName from first transaction
          if (productName === 'Payment' && sortedTransactions.length > 0) {
            productName = sortedTransactions[0].entitySourceName || 
                          sortedTransactions[0].name || 
                          sortedTransactions[0].description || 
                          'Payment';
          }
          
          contactProductNames.set(contactId, productName);
        }

        console.log(`📦 Mapped product names for ${contactProductNames.size} contacts`);
        
        // Fetch all existing clients to match for auto-assignment
        setImportProgress('Loading existing clients for assignment...');
        const { data: existingClients, error: clientsError } = await supabase
          .from('new_clients')
          .select('name, assigned_to')
          .eq('company_id', companyId);
        
        if (clientsError) {
          console.error('Error loading clients:', clientsError);
        }
        
        // Create a map for quick client lookup (case-insensitive)
        const clientAssignmentMap = new Map<string, string>();
        if (existingClients) {
          existingClients.forEach(client => {
            if (client.name && client.assigned_to) {
              clientAssignmentMap.set(client.name.toLowerCase().trim(), client.assigned_to);
            }
          });
        }
        console.log(`📋 Loaded ${clientAssignmentMap.size} clients for auto-assignment`);
        
        setImportProgress(`Importing ${allTransactions.length} transactions...`);

        // Import all transactions with the correct product names
        let totalTransactionsImported = 0;
        let duplicatesSkipped = 0;
        let autoAssigned = 0;

        for (const txn of allTransactions) {
          const customerName = txn.contactName || txn.name || 'Unknown Customer';
          
          // Get product name for this contact (already fetched above)
          const productName = contactProductNames.get(txn.contactId) || 'Payment';
          
          const transactionAmount = txn.amount_received 
            ? txn.amount_received / 100 
            : (txn.amount || 0);
          
          const categorizedProduct = categorizeProduct(productName);
          const transactionDate = txn.createdAt 
            ? new Date(txn.createdAt).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];
          
          // Detect recurring transactions
          const isRecurring = txn.entitySourceName?.toLowerCase().includes('recurring') || 
                             txn.entitySourceName?.toLowerCase().includes('subscription') ||
                             productName?.toLowerCase().includes('recurring') ||
                             productName?.toLowerCase().includes('monthly') ||
                             productName?.toLowerCase().includes('weekly');
          
          // Check if transaction already exists
          const { data: existingTransaction } = await supabase
            .from('transactions')
            .select('id')
            .eq('ghl_transaction_id', txn.id)
            .single();
          
          if (existingTransaction) {
            duplicatesSkipped++;
            continue;
          }
          
          // Auto-assign to client owner if client exists
          const assignedTo = clientAssignmentMap.get(customerName.toLowerCase().trim()) || loggedInUser.id;
          const wasAutoAssigned = clientAssignmentMap.has(customerName.toLowerCase().trim());
          if (wasAutoAssigned) autoAssigned++;
          
          // Insert transaction
          console.log(`💵 ${customerName}: "${productName}" → ${categorizedProduct} ($${transactionAmount}) ${isRecurring ? '(RECURRING)' : '(ONE-TIME)'} ${wasAutoAssigned ? '→ Auto-assigned' : ''}`);
          
          const { error: insertError } = await supabase
            .from('transactions')
            .insert({
              date: transactionDate,
              client_name: customerName,
              product: categorizedProduct,
              amount: transactionAmount,
              is_recurring: isRecurring,
              user_id: loggedInUser.id,
              company_id: companyId,
              assigned_to: assignedTo,
              ghl_transaction_id: txn.id,
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

        // Update last sync timestamp
        await supabase
          .from('ghl_integrations')
          .update({ last_sync_at: new Date().toISOString() })
          .eq('company_id', companyId);
        
        const summaryMessage = duplicatesSkipped > 0
          ? `✅ Imported ${totalTransactionsImported} new transactions! (${autoAssigned} auto-assigned, ${duplicatesSkipped} duplicates skipped)`
          : `✅ Successfully imported ${totalTransactionsImported} transactions! (${autoAssigned} auto-assigned to sales reps)`;
        
        setImportSuccess(summaryMessage);
        setTimeout(() => setImportSuccess(null), 10000);
        
        // Refresh the page to show new transactions
        window.location.reload();
      } catch (error: any) {
        console.error('GHL Import Error:', error);
        setImportError(error.message || 'Failed to import from GoHighLevel');
      } finally {
        setIsImportingFromGHL(false);
        setImportProgress('');
      }
    };
    const handleProductSelect = (productName: string) => { setProduct(productName); document.getElementById('clientNameInput')?.focus(); }
    
     const LineChart: React.FC<{data: {date: string, revenue: number}[], onBarClick?: (startDate: string, endDate: string, label: string) => void}> = ({data, onBarClick}) => {
        if (data.length === 0) return <p className="text-center text-sm text-gray-500 py-8">No data for this period.</p>;
        
        // Smart grouping based on data length
        const groupData = () => {
            const numDays = data.length;
            
            // Check if date range is exactly one calendar month
            if (data.length > 0) {
                const firstDate = new Date(data[0].date);
                const lastDate = new Date(data[data.length - 1].date);
                const firstDay = firstDate.getDate();
                const lastDay = lastDate.getDate();
                const sameMonth = firstDate.getMonth() === lastDate.getMonth() && firstDate.getFullYear() === lastDate.getFullYear();
                
                // If it starts on the 1st and ends on the last day of the month, show as single month bar
                if (sameMonth && firstDay === 1) {
                    const daysInMonth = new Date(firstDate.getFullYear(), firstDate.getMonth() + 1, 0).getDate();
                    if (lastDay === daysInMonth) {
                        const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
                        const monthLabel = firstDate.toLocaleDateString('en-US', { month: 'short' });
                        return [{
                            label: monthLabel,
                            revenue: totalRevenue,
                            startDate: data[0].date,
                            endDate: data[data.length - 1].date
                        }];
                    }
                }
            }
            
            // 1-7 days: Show each day
            if (numDays <= 7) {
                return data.map(d => ({
                    label: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
                    revenue: d.revenue,
                    startDate: d.date,
                    endDate: d.date
                }));
            }
            
            // 8-30 days: Group by week
            if (numDays <= 30) {
                const weeks: {label: string, revenue: number, startDate: string, endDate: string}[] = [];
                let weekNum = 1;
                let weekRevenue = 0;
                let weekCount = 0;
                let weekStartDate = '';
                let weekEndDate = '';
                
                data.forEach((d, i) => {
                    if (weekCount === 0) weekStartDate = d.date;
                    weekEndDate = d.date;
                    weekRevenue += d.revenue;
                    weekCount++;
                    
                    if (weekCount === 7 || i === data.length - 1) {
                        weeks.push({ label: `Week ${weekNum}`, revenue: weekRevenue, startDate: weekStartDate, endDate: weekEndDate });
                        weekNum++;
                        weekRevenue = 0;
                        weekCount = 0;
                    }
                });
                return weeks;
            }
            
            // 31-90 days: Group by week with dates
            if (numDays <= 90) {
                const weeks: {label: string, revenue: number, startDate: string, endDate: string}[] = [];
                let weekRevenue = 0;
                let weekCount = 0;
                let weekStartDate = '';
                let weekEndDate = '';
                
                data.forEach((d, i) => {
                    if (weekCount === 0) weekStartDate = d.date;
                    weekEndDate = d.date;
                    weekRevenue += d.revenue;
                    weekCount++;
                    
                    if (weekCount === 7 || i === data.length - 1) {
                        const label = new Date(weekStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        weeks.push({ label, revenue: weekRevenue, startDate: weekStartDate, endDate: weekEndDate });
                        weekRevenue = 0;
                        weekCount = 0;
                    }
                });
                return weeks;
            }
            
            // 91-365 days: Group by month
            if (numDays <= 365) {
                const monthsMap: Record<string, { revenue: number; monthNum: number; year: number; startDate: string; endDate: string }> = {};
                
                // Get the date range boundaries
                const rangeStart = new Date(data[0].date);
                const rangeEnd = new Date(data[data.length - 1].date);
                
                data.forEach(d => {
                    // DEBUG: Log ALL data being processed to find missing Dec 1st
                    if (d.date.startsWith('2025-12')) {
                        console.log('[DEBUG] Processing Dec 2025 data point:', { date: d.date, revenue: d.revenue });
                    }
                    
                    // Only process entries that have revenue > 0
                    if (d.revenue === 0) {
                        console.log('[DEBUG] SKIPPING zero revenue:', d.date);
                        return;
                    }
                    
                    const date = new Date(d.date);
                    const year = date.getFullYear();
                    const monthNum = date.getMonth(); // 0-11
                    const monthKey = `${date.toLocaleDateString('en-US', { month: 'short' })} ${year}`;
                    
                    // DEBUG: Log December 2025 transactions
                    if (monthKey === 'Dec 2025') {
                        console.log('[DEBUG] Dec 2025 transaction ADDED to monthsMap:', { date: d.date, revenue: d.revenue, monthKey });
                    }
                    
                    // Calculate actual calendar month boundaries
                    const firstDayOfMonth = new Date(year, monthNum, 1);
                    const lastDayOfMonth = new Date(year, monthNum + 1, 0);
                    const startDate = firstDayOfMonth.toISOString().split('T')[0];
                    const endDate = lastDayOfMonth.toISOString().split('T')[0];
                    
                    if (!monthsMap[monthKey]) {
                        monthsMap[monthKey] = { revenue: 0, monthNum, year, startDate, endDate };
                    }
                    monthsMap[monthKey].revenue += d.revenue;
                });
                
                // DEBUG: Log final December 2025 total
                if (monthsMap['Dec 2025']) {
                    console.log('[DEBUG] Dec 2025 FINAL TOTAL:', monthsMap['Dec 2025'].revenue);
                }
                
                // Sort by year and month
                const sortedMonths = Object.entries(monthsMap)
                    .sort(([, a], [, b]) => {
                        if (a.year !== b.year) return a.year - b.year;
                        return a.monthNum - b.monthNum;
                    });
                
                // Check if we have multiple years in the data
                const years = new Set(sortedMonths.map(([, data]) => data.year));
                const hasMultipleYears = years.size > 1;
                
                return sortedMonths.map(([label, data]) => ({ 
                    label: label.split(' ')[0], // Always show just month abbreviation (e.g., "Dec" instead of "Dec 2025")
                    revenue: data.revenue, 
                    startDate: data.startDate, 
                    endDate: data.endDate 
                }));
            }
            
            // 366+ days: Group by year
            const years: Record<string, { revenue: number; startDate: string; endDate: string }> = {};
            data.forEach(d => {
                const year = new Date(d.date).getFullYear().toString();
                if (!years[year]) {
                    years[year] = { revenue: 0, startDate: d.date, endDate: d.date };
                }
                years[year].revenue += d.revenue;
                if (d.date > years[year].endDate) years[year].endDate = d.date;
                if (d.date < years[year].startDate) years[year].startDate = d.date;
            });
            return Object.entries(years).map(([label, data]) => ({ label, revenue: data.revenue, startDate: data.startDate, endDate: data.endDate }));
        };
        
        const groupedData = groupData();
        
        // DEBUG: Log all grouped data
        console.log('[DEBUG] All grouped chart data:', groupedData);
        const width = 500, height = 220, padding = 40;
        const maxRevenue = Math.max(...groupedData.map(d => d.revenue), 0);
        const yMax = maxRevenue === 0 ? 1000 : Math.ceil(maxRevenue * 1.1);
        
        // Dynamic bar width calculation
        const availableWidth = width - padding * 2;
        const spacing = availableWidth / groupedData.length;
        const barWidth = spacing * 0.75;
        
        return ( 
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                {/* Axes */}
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height-padding} stroke="#4b5563" strokeWidth="1" />
                <line x1={padding} y1={padding} x2={padding} y2={height-padding} stroke="#4b5563" strokeWidth="1" />
                
                {/* Y-axis labels */}
                <text x="5" y="15" className="text-[10px] fill-gray-400">{formatCurrency(yMax)}</text>
                <text x="5" y={height-padding+3} className="text-[10px] fill-gray-400">{formatCurrency(0)}</text>
                
                {/* Bars */}
                {groupedData.map((d, i) => {
                    const barHeight = (d.revenue / yMax) * (height - padding * 2);
                    const x = padding + i * spacing + (spacing - barWidth) / 2;
                    const y = height - padding - barHeight;
                    
                    return (
                        <g key={i} className={onBarClick ? 'cursor-pointer' : ''} onClick={() => onBarClick?.(d.startDate || d.label, d.endDate || d.label, d.label)}>
                            <rect 
                                x={x} 
                                y={y} 
                                width={barWidth} 
                                height={barHeight} 
                                fill="#34D399" 
                                className="hover:opacity-80 transition-opacity"
                            />
                            {onBarClick && (
                                <title>Click to view transactions for {d.label}</title>
                            )}
                            {/* Value label on top of bar - angled at 45 degrees */}
                            {d.revenue > 0 && (
                                <text 
                                    x={x + barWidth / 2} 
                                    y={y - 8} 
                                    className="text-[8px] fill-gray-600 dark:fill-gray-300 font-semibold" 
                                    textAnchor="start"
                                    transform={`rotate(-45 ${x + barWidth / 2} ${y - 8})`}
                                >
                                    {`$${Math.round(d.revenue).toLocaleString()}`}
                                </text>
                            )}
                            {/* X-axis label */}
                            <text 
                                x={x + barWidth / 2} 
                                y={height - padding + 15} 
                                className="text-[10px] fill-gray-500 dark:fill-gray-400 font-medium" 
                                textAnchor="middle"
                            >
                                {d.label}
                            </text>
                        </g>
                    );
                })}
            </svg> 
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
                <h1 className="text-2xl font-bold text-brand-light-text dark:text-white">Revenue Center</h1>
                <div className="flex items-center gap-3">
                    {(loggedInUser.role === 'Admin' || loggedInUser.role === 'admin') && (
                      <button 
                          onClick={handleImportFromGHL}
                          disabled={isImportingFromGHL}
                          className="bg-brand-lime text-brand-ink font-bold py-2 px-4 rounded-lg hover:bg-green-400 transition text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isImportingFromGHL ? '⏳ Importing...' : '📥 Import from GHL'}
                    </button>
                    )}
                    <div className="flex items-center bg-brand-light-bg dark:bg-brand-ink p-1 rounded-lg border border-brand-light-border dark:border-brand-gray">
                        <button onClick={() => setViewMode('daily')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${viewMode === 'daily' ? 'bg-brand-blue text-white' : 'text-gray-500 dark:text-gray-400 hover:text-brand-light-text dark:hover:text-white'}`}>Daily Entry</button>
                        <button onClick={() => setViewMode('analysis')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${viewMode === 'analysis' ? 'bg-brand-blue text-white' : 'text-gray-500 dark:text-gray-400 hover:text-brand-light-text dark:hover:text-white'}`}>Analysis</button>
                    </div>
                </div>
            </div>
            
            {/* Import Progress/Status Messages */}
            {importProgress && (
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 border border-blue-500 rounded-lg text-blue-700 dark:text-blue-300 text-sm">
                    ⏳ {importProgress}
                </div>
            )}
            {importSuccess && (
                <div className="p-3 bg-green-100 dark:bg-green-900/30 border border-green-500 rounded-lg text-green-700 dark:text-green-300 text-sm">
                    {importSuccess}
                </div>
            )}
            {importError && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-500 rounded-lg text-red-700 dark:text-red-300 text-sm">
                    ❌ {importError}
                </div>
            )}

            {viewMode === 'daily' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                    <div className="space-y-8"><Calendar selectedDate={selectedDate} onDateChange={onDateChange} /><IndustrySelector onProductSelect={handleProductSelect} /></div>
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
                            <h3 className="text-lg font-bold mb-4 bg-brand-gray/80 text-white p-2 rounded text-center">{editingId ? 'EDIT' : 'ADD'} TRANSACTION</h3>
                            <form onSubmit={handleSubmit} className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3"><input id="clientNameInput" type="text" placeholder="Client / Company Name" value={clientName} onChange={e => setClientName(e.target.value)} required className="w-full bg-transparent border-b border-dashed border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white text-sm p-1 focus:outline-none focus:border-brand-blue focus:border-solid" /><div><input list="product-list" type="text" placeholder="Product / Service" value={product} onChange={e => setProduct(e.target.value)} className="w-full bg-transparent border-b border-dashed border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white text-sm p-1 focus:outline-none focus:border-brand-blue focus:border-solid" /><datalist id="product-list">{userProducts.map(p => <option key={p} value={p} />)}</datalist></div></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center"><input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-transparent border-b border-dashed border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white text-sm p-1 focus:outline-none focus:border-brand-blue focus:border-solid" /><label className="flex items-center space-x-2 cursor-pointer text-sm text-gray-500 dark:text-gray-400"><input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="h-4 w-4 rounded bg-brand-light-border dark:bg-brand-gray border-gray-300 dark:border-gray-600 text-brand-lime focus:ring-brand-lime" /><span>Recurring (MCV)</span></label></div>
                                <div className="flex items-center gap-2 pt-2"><button type="submit" disabled={isSubmitting} className="flex-grow bg-brand-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition text-sm disabled:bg-brand-gray">{isSubmitting ? 'Saving...' : (editingId ? 'Update Transaction' : 'Add Transaction')}</button>{editingId && <button type="button" onClick={resetForm} className="bg-brand-gray text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-light-gray transition text-sm">Cancel</button>}</div>
                            </form>
                        </div>
                         <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
                            <h3 className="text-lg font-bold mb-3 text-brand-light-text dark:text-white">Transactions for {selectedDate.toLocaleDateString()}</h3>
                            <button 
                                onClick={() => {
                                    const currentMonth = selectedDate.getMonth();
                                    const currentYear = selectedDate.getFullYear();
                                    const monthName = selectedDate.toLocaleDateString('en-US', { month: 'long' });
                                    const firstDay = new Date(currentYear, currentMonth, 1);
                                    const lastDay = new Date(currentYear, currentMonth + 1, 0);
                                    const startDate = firstDay.toISOString().split('T')[0];
                                    const endDate = lastDay.toISOString().split('T')[0];
                                    const label = `${monthName} (${firstDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${lastDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})`;
                                    setSelectedDateForModal(JSON.stringify({ startDate, endDate, label }));
                                    setShowDateModal(true);
                                }}
                                className="w-full bg-brand-lime text-brand-navy font-bold py-2 px-4 rounded-lg hover:bg-green-400 transition text-sm mb-3 flex items-center justify-center gap-2"
                            >
                                <span>📊</span>
                                <span>View All {selectedDate.toLocaleDateString('en-US', { month: 'long' })} Transactions</span>
                            </button>
                            <div className="overflow-x-auto max-h-96">
                                 <table className="w-full text-sm text-left"><thead className="bg-brand-light-bg dark:bg-brand-gray/50 text-xs uppercase text-gray-500 dark:text-gray-400 sticky top-0"><tr><th className="p-2">Client</th><th className="p-2">Product</th><th className="p-2 text-right">Amount</th><th className="p-2 text-center">MCV</th><th className="p-2 text-right">ACV</th><th className="p-2 text-center">Actions</th></tr></thead>
                                    <tbody>{transactionsForSelectedDate.map(t => (<tr key={t.id} className="border-b border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white"><td className="p-2 font-medium">{t.clientName}</td><td className="p-2 text-gray-500 dark:text-gray-400">{t.product}</td><td className="p-2 text-right font-semibold text-brand-lime">{formatCurrency(t.amount)}</td><td className="p-2 text-center">{t.isRecurring ? '✅' : '-'}</td><td className="p-2 text-right text-gray-500 dark:text-gray-400">{t.isRecurring ? formatCurrency(t.amount * 12) : '-'}</td><td className="p-2 text-center space-x-2"><button onClick={() => handleEdit(t)} className="text-xs text-blue-400 hover:underline">Edit</button><button onClick={() => handleDelete(t.id)} className="text-xs text-red-400 hover:underline">Del</button></td></tr>))}
                                        {transactionsForSelectedDate.length === 0 && (<tr><td colSpan={6} className="text-center p-4 text-gray-500 dark:text-gray-400">No transactions for this day.</td></tr>)}</tbody>
                                </table>
                            </div>
                            {uniqueProductsToday.length > 0 && (
                                <div className="mt-6 pt-4 border-t border-dashed border-brand-light-border dark:border-brand-gray">
                                    <h4 className="text-md font-bold text-brand-light-text dark:text-white mb-3">Product Contribution Analysis</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Select a product from today's transactions to see its revenue contribution to the total sales for different periods (relative to {selectedDate.toLocaleDateString()}).</p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {uniqueProductsToday.map(product => (
                                            <button
                                                key={product}
                                                onClick={() => setAnalyzedProduct(product)}
                                                className={`text-xs font-bold py-1 px-3 rounded-full transition-colors ${analyzedProduct === product ? 'bg-brand-red text-white' : 'bg-gray-200 dark:bg-brand-gray text-gray-700 dark:text-gray-300'}`}
                                            >
                                                {product}
                                            </button>
                                        ))}
                                    </div>
                                    {analyzedProduct && contributionData && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-brand-light-bg dark:bg-brand-ink rounded-lg animate-fade-in">
                                            <div className="text-center">
                                                <p className="text-2xl font-black text-brand-blue">{contributionData.day}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">of Day's Revenue</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-2xl font-black text-brand-blue">{contributionData.week}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">of Week's Revenue</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-2xl font-black text-brand-blue">{contributionData.month}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">of Month's Revenue</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-2xl font-black text-brand-blue">{contributionData.year}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">of Year's Revenue</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-fade-in">
                    <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray flex flex-col md:flex-row items-center justify-between gap-4"><h2 className="text-lg font-bold text-brand-light-text dark:text-white">Date Range Analysis</h2><div className="flex items-center gap-2"><DatePicker value={dateRange.start} onChange={value => setDateRange(prev => ({...prev, start: value}))} className="w-32" /><span className="font-semibold text-gray-500">to</span><DatePicker value={dateRange.end} onChange={value => setDateRange(prev => ({...prev, end: value}))} className="w-32" /></div></div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray text-center"><h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Total Revenue</h4><p className="text-4xl font-black text-brand-lime">{formatCurrency(analysisData.totalRevenue)}</p></div>
                        <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray text-center"><h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Transactions</h4><p className="text-4xl font-black text-brand-light-text dark:text-white">{analysisData.totalTransactions}</p></div>
                         <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray text-center"><h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Avg. Deal Size</h4><p className="text-4xl font-black text-brand-blue">{formatCurrency(analysisData.avgDealSize)}</p></div>
                     </div>
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray"><h3 className="text-lg font-bold mb-4 text-brand-light-text dark:text-white">Top Products by Revenue</h3><BarChart data={analysisData.productChartData.map(d => ({ name: d.product, revenue: d.revenue }))} onBarClick={handleProductClick} /></div>
                        <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray"><h3 className="text-lg font-bold mb-4 text-brand-light-text dark:text-white">Revenue Over Time</h3><LineChart data={analysisData.timeChartData} onBarClick={handleDateClick} /></div>
                     </div>
                     <RevenueAIEvaluator productData={analysisData.productChartData} timeframeText={`${dateRange.start} to ${dateRange.end}`} />
                </div>
            )}
            
            {/* Date Transaction Detail Modal */}
            {showDateModal && selectedDateForModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDateModal(false)}>
                    <div className="bg-brand-light-card dark:bg-brand-navy rounded-lg border border-brand-light-border dark:border-brand-gray p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-brand-light-text dark:text-white">
                                {(() => {
                                    try {
                                        const { startDate, endDate, label } = JSON.parse(selectedDateForModal);
                                        if (startDate === endDate) {
                                            return new Date(startDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
                                        }
                                        return `${label} (${new Date(startDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(endDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})`;
                                    } catch {
                                        return 'Transactions';
                                    }
                                })()}
                            </h2>
                            <button
                                onClick={() => setShowDateModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        {/* Summary Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="bg-brand-light-bg dark:bg-brand-ink p-3 rounded-lg text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                                <p className="text-xl font-bold text-brand-lime">{formatCurrency(dateTransactions.reduce((sum, t) => sum + t.amount, 0))}</p>
                            </div>
                            <div className="bg-brand-light-bg dark:bg-brand-ink p-3 rounded-lg text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Transactions</p>
                                <p className="text-xl font-bold text-brand-light-text dark:text-white">{dateTransactions.length}</p>
                            </div>
                            <div className="bg-brand-light-bg dark:bg-brand-ink p-3 rounded-lg text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Deal</p>
                                <p className="text-xl font-bold text-brand-blue">{formatCurrency(dateTransactions.length > 0 ? dateTransactions.reduce((sum, t) => sum + t.amount, 0) / dateTransactions.length : 0)}</p>
                            </div>
                        </div>
                        
                        {/* Filters */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filter by Product</label>
                                <input
                                    type="text"
                                    placeholder="Search product..."
                                    value={dateModalProductFilter}
                                    onChange={(e) => setDateModalProductFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-brand-light-border dark:border-brand-gray rounded-lg bg-white dark:bg-brand-ink text-brand-light-text dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Minimum Amount</label>
                                <input
                                    type="number"
                                    placeholder="Min amount..."
                                    value={dateModalMinAmount}
                                    onChange={(e) => setDateModalMinAmount(e.target.value)}
                                    className="w-full px-3 py-2 border border-brand-light-border dark:border-brand-gray rounded-lg bg-white dark:bg-brand-ink text-brand-light-text dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                />
                            </div>
                        </div>
                        
                        {/* Transaction List */}
                        <div className="flex-1 overflow-auto">
                            <table className="w-full">
                                <thead className="sticky top-0 bg-brand-light-card dark:bg-brand-navy">
                                    <tr className="border-b border-brand-light-border dark:border-brand-gray">
                                        <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                                        <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Customer</th>
                                        <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Product</th>
                                        <th className="text-right py-2 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                                        <th className="text-center py-2 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Recurring</th>
                                        <th className="text-center py-2 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dateTransactions.map((transaction) => (
                                        <tr key={transaction.id} className="border-b border-brand-light-border dark:border-brand-gray hover:bg-brand-light-bg dark:hover:bg-brand-ink">
                                            <td className="py-2 px-3 text-sm text-gray-600 dark:text-gray-400">{new Date(transaction.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                                            <td className="py-2 px-3 text-sm text-brand-light-text dark:text-white">{transaction.clientName}</td>
                                            <td className="py-2 px-3 text-sm text-gray-600 dark:text-gray-400">{transaction.product}</td>
                                            <td className="py-2 px-3 text-sm text-right font-semibold text-brand-lime">{formatCurrency(transaction.amount)}</td>
                                            <td className="py-2 px-3 text-sm text-center">
                                                {transaction.isRecurring && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300">Recurring</span>
                                                )}
                                            </td>
                                            <td className="py-2 px-3 text-sm text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => { setShowDateModal(false); setShowProductModal(false); handleEdit(transaction); }}
                                                        className="text-brand-blue hover:text-brand-blue/80 font-medium"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => { if (window.confirm('Delete this transaction?')) { setShowDateModal(false); setShowProductModal(false); handleDelete(transaction.id); } }}
                                                        className="text-red-600 hover:text-red-700 font-medium"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Product Transaction Detail Modal */}
            {showProductModal && selectedProduct && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowProductModal(false)}>
                    <div className="bg-brand-light-card dark:bg-brand-navy rounded-lg border border-brand-light-border dark:border-brand-gray p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-brand-light-text dark:text-white">{selectedProduct}</h2>
                            <button
                                onClick={() => setShowProductModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        {/* Summary Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="bg-brand-light-bg dark:bg-brand-ink p-3 rounded-lg text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                                <p className="text-xl font-bold text-brand-lime">{formatCurrency(productTransactions.reduce((sum, t) => sum + t.amount, 0))}</p>
                            </div>
                            <div className="bg-brand-light-bg dark:bg-brand-ink p-3 rounded-lg text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Transactions</p>
                                <p className="text-xl font-bold text-brand-light-text dark:text-white">{productTransactions.length}</p>
                            </div>
                            <div className="bg-brand-light-bg dark:bg-brand-ink p-3 rounded-lg text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Deal</p>
                                <p className="text-xl font-bold text-brand-blue">{formatCurrency(productTransactions.length > 0 ? productTransactions.reduce((sum, t) => sum + t.amount, 0) / productTransactions.length : 0)}</p>
                            </div>
                        </div>
                        
                        {/* Transaction List */}
                        <div className="flex-1 overflow-auto">
                            <table className="w-full">
                                <thead className="sticky top-0 bg-brand-light-card dark:bg-brand-navy">
                                    <tr className="border-b border-brand-light-border dark:border-brand-gray">
                                        <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                                        <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Customer</th>
                                        <th className="text-right py-2 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                                        <th className="text-center py-2 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Recurring</th>
                                        <th className="text-center py-2 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productTransactions.map((transaction) => (
                                        <tr key={transaction.id} className="border-b border-brand-light-border dark:border-brand-gray hover:bg-brand-light-bg dark:hover:bg-brand-ink">
                                            <td className="py-2 px-3 text-sm text-brand-light-text dark:text-white">{new Date(transaction.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                            <td className="py-2 px-3 text-sm text-brand-light-text dark:text-white">{transaction.clientName}</td>
                                            <td className="py-2 px-3 text-sm text-right font-semibold text-brand-lime">{formatCurrency(transaction.amount)}</td>
                                            <td className="py-2 px-3 text-sm text-center">
                                                {transaction.isRecurring && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300">Recurring</span>
                                                )}
                                            </td>
                                            <td className="py-2 px-3 text-sm text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => { setShowDateModal(false); setShowProductModal(false); handleEdit(transaction); }}
                                                        className="text-brand-blue hover:text-brand-blue/80 font-medium"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => { if (window.confirm('Delete this transaction?')) { setShowDateModal(false); setShowProductModal(false); handleDelete(transaction.id); } }}
                                                        className="text-red-600 hover:text-red-700 font-medium"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RevenuePage;