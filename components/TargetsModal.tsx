import React, { useState, useEffect } from 'react';
import {
  calculateTargets,
  getDefaultInputs,
  validateInputs,
  formatCurrency,
  type CalculatorInputs,
  type CalculatedTargets as EnhancedTargets,
} from '../services/salesTargetCalculatorService';

interface TargetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (targets: CalculatedTargets) => void;
  initialValues?: {
    annualRevenue: string;
    avgSaleAmount: string;
    workingDaysPerYear: string;
    salesCycleDays: string;
    leadToOppRate: string;
    oppToCloseRate: string;
    callsPerLead: string;
    emailsPerLead: string;
    textsPerLead: string;
  };
}

// Keep the old interface for backward compatibility with ProspectingPage
export interface CalculatedTargets {
  annualRevenue: number;
  avgSaleAmount: number;
  closeRate: number;
  showRate: number;
  contactToApptRate: number;
  callToContactRate: number;
  dailyCalls: number;
  dailyContacts: number;
  dailyAppts: number;
  dailyDemos: number;
  dailyDeals: number;
  dailyRevenue: number;
  weeklyRevenue: number;
  // New fields from enhanced calculator
  dailyLeads?: number;
  dailyOpportunities?: number;
  dailyEmails?: number;
  dailyTexts?: number;
  monthlyRevenue?: number;
  monthlyDeals?: number;
}

export default function TargetsModal({ isOpen, onClose, onSave, initialValues }: TargetsModalProps) {
  // Get defaults from the enhanced calculator
  const defaults = getDefaultInputs();
  
  const [annualRevenue, setAnnualRevenue] = useState(initialValues?.annualRevenue || defaults.annualRevenueGoal.toString());
  const [avgSaleAmount, setAvgSaleAmount] = useState(initialValues?.avgSaleAmount || defaults.averageDealSize.toString());
  const [workingDaysPerYear, setWorkingDaysPerYear] = useState(initialValues?.workingDaysPerYear || defaults.workingDaysPerYear.toString());
  const [salesCycleDays, setSalesCycleDays] = useState(initialValues?.salesCycleDays || defaults.salesCycleDays.toString());
  const [leadToOppRate, setLeadToOppRate] = useState(initialValues?.leadToOppRate || defaults.leadToOppRate.toString());
  const [oppToCloseRate, setOppToCloseRate] = useState(initialValues?.oppToCloseRate || defaults.oppToCloseRate.toString());
  const [callsPerLead, setCallsPerLead] = useState(initialValues?.callsPerLead || defaults.callsPerLead.toString());
  const [emailsPerLead, setEmailsPerLead] = useState(initialValues?.emailsPerLead || defaults.emailsPerLead.toString());
  const [textsPerLead, setTextsPerLead] = useState(initialValues?.textsPerLead || defaults.textsPerLead.toString());
  
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (initialValues) {
      setAnnualRevenue(initialValues.annualRevenue);
      setAvgSaleAmount(initialValues.avgSaleAmount);
      setWorkingDaysPerYear(initialValues.workingDaysPerYear || defaults.workingDaysPerYear.toString());
      setSalesCycleDays(initialValues.salesCycleDays || defaults.salesCycleDays.toString());
      setLeadToOppRate(initialValues.leadToOppRate || defaults.leadToOppRate.toString());
      setOppToCloseRate(initialValues.oppToCloseRate || defaults.oppToCloseRate.toString());
      setCallsPerLead(initialValues.callsPerLead || defaults.callsPerLead.toString());
      setEmailsPerLead(initialValues.emailsPerLead || defaults.emailsPerLead.toString());
      setTextsPerLead(initialValues.textsPerLead || defaults.textsPerLead.toString());
    }
  }, [initialValues]);

  const hasRequiredInputs = annualRevenue && avgSaleAmount && workingDaysPerYear;

  const handleCalculateAndSave = () => {
    if (!hasRequiredInputs) return;

    const inputs: CalculatorInputs = {
      annualRevenueGoal: parseFloat(annualRevenue) || 0,
      averageDealSize: parseFloat(avgSaleAmount) || 0,
      workingDaysPerYear: parseFloat(workingDaysPerYear) || 250,
      salesCycleDays: parseFloat(salesCycleDays) || 30,
      leadToOppRate: parseFloat(leadToOppRate) || 25,
      oppToCloseRate: parseFloat(oppToCloseRate) || 25,
      callsPerLead: parseFloat(callsPerLead) || 3,
      emailsPerLead: parseFloat(emailsPerLead) || 5,
      textsPerLead: parseFloat(textsPerLead) || 2,
    };

    // Validate inputs
    const validationErrors = validateInputs(inputs);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Calculate using enhanced calculator
    const enhanced = calculateTargets(inputs);

    // Convert to old format for backward compatibility
    // IMPORTANT: Round all values to integers for database storage
    const targets: CalculatedTargets = {
      annualRevenue: Math.round(inputs.annualRevenueGoal),
      avgSaleAmount: Math.round(inputs.averageDealSize),
      closeRate: Math.round(inputs.oppToCloseRate),
      showRate: 70, // Default show rate (not used in new calculator)
      contactToApptRate: 10, // Default contact to appt rate (not used in new calculator)
      callToContactRate: 14, // Default call to contact rate (not used in new calculator)
      dailyCalls: Math.ceil(enhanced.daily.calls),
      dailyContacts: Math.ceil(enhanced.daily.leads), // Map leads to contacts for compatibility
      dailyAppts: Math.ceil(enhanced.daily.opportunities), // Map opportunities to appts for compatibility
      dailyDemos: Math.ceil(enhanced.daily.opportunities),
      dailyDeals: Math.ceil(enhanced.daily.deals),
      dailyRevenue: Math.round(enhanced.daily.revenue),
      weeklyRevenue: Math.round(enhanced.weekly.revenue),
      // New enhanced fields
      dailyLeads: Math.ceil(enhanced.daily.leads),
      dailyOpportunities: Math.ceil(enhanced.daily.opportunities),
      dailyEmails: Math.ceil(enhanced.daily.emails),
      dailyTexts: Math.ceil(enhanced.daily.texts),
      monthlyRevenue: Math.round(enhanced.monthly.revenue),
      monthlyDeals: Math.ceil(enhanced.monthly.deals),
    };

    setErrors([]);
    onSave(targets);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-brand-lime">Set Your Daily Targets</h2>
              <p className="text-gray-400 text-sm mt-1">Answer these questions to get your daily plan</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Step 1: Your Money Goal */}
          <div className="bg-gray-800 rounded-lg p-5 mb-4 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-brand-lime text-gray-900 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-lg font-bold text-white">Your Money Goal</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  How much money do you want to make this year?
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-400">$</span>
                  <input
                    type="number"
                    value={annualRevenue}
                    onChange={(e) => setAnnualRevenue(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 pl-8 text-white focus:outline-none focus:border-brand-lime"
                    placeholder="500000"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Example: $500,000</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  How much is one sale worth?
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-400">$</span>
                  <input
                    type="number"
                    value={avgSaleAmount}
                    onChange={(e) => setAvgSaleAmount(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 pl-8 text-white focus:outline-none focus:border-brand-lime"
                    placeholder="5000"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Example: $5,000 per customer</p>
              </div>
            </div>
          </div>

          {/* Step 2: Your Time */}
          <div className="bg-gray-800 rounded-lg p-5 mb-4 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-brand-lime text-gray-900 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-lg font-bold text-white">Your Time</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  How many days will you work this year?
                </label>
                <input
                  type="number"
                  value={workingDaysPerYear}
                  onChange={(e) => setWorkingDaysPerYear(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-brand-lime"
                  placeholder="250"
                />
                <p className="text-xs text-gray-500 mt-1">Usually 250 days (5 days × 50 weeks)</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  How many days does it take to close a sale?
                </label>
                <input
                  type="number"
                  value={salesCycleDays}
                  onChange={(e) => setSalesCycleDays(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-brand-lime"
                  placeholder="30"
                />
                <p className="text-xs text-gray-500 mt-1">From first call to money in the bank</p>
              </div>
            </div>
          </div>

          {/* Step 3: Your Success Rates */}
          <div className="bg-gray-800 rounded-lg p-5 mb-4 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-brand-lime text-gray-900 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="text-lg font-bold text-white">Your Success Rates</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Out of 100 leads, how many become real opportunities?
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={leadToOppRate}
                    onChange={(e) => setLeadToOppRate(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 pr-10 text-white focus:outline-none focus:border-brand-lime"
                    placeholder="25"
                  />
                  <span className="absolute right-3 top-3 text-gray-400">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Example: 25 out of 100 = 25%</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Out of 100 opportunities, how many buy?
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={oppToCloseRate}
                    onChange={(e) => setOppToCloseRate(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 pr-10 text-white focus:outline-none focus:border-brand-lime"
                    placeholder="25"
                  />
                  <span className="absolute right-3 top-3 text-gray-400">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Example: 25 out of 100 = 25%</p>
              </div>
            </div>
          </div>

          {/* Step 4: Your Activities */}
          <div className="bg-gray-800 rounded-lg p-5 mb-4 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-brand-lime text-gray-900 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h3 className="text-lg font-bold text-white">Your Activities</h3>
            </div>
            
            <p className="text-sm text-gray-400 mb-4">For each lead, how many times do you...</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  📞 Call them?
                </label>
                <input
                  type="number"
                  value={callsPerLead}
                  onChange={(e) => setCallsPerLead(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-brand-lime"
                  placeholder="3"
                />
                <p className="text-xs text-gray-500 mt-1">Usually 3 calls</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  📧 Email them?
                </label>
                <input
                  type="number"
                  value={emailsPerLead}
                  onChange={(e) => setEmailsPerLead(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-brand-lime"
                  placeholder="5"
                />
                <p className="text-xs text-gray-500 mt-1">Usually 5 emails</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  💬 Text them?
                </label>
                <input
                  type="number"
                  value={textsPerLead}
                  onChange={(e) => setTextsPerLead(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-brand-lime"
                  placeholder="2"
                />
                <p className="text-xs text-gray-500 mt-1">Usually 2 texts</p>
              </div>
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-4">
              <h3 className="text-red-400 font-bold mb-2">⚠️ Fix These Problems:</h3>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, i) => (
                  <li key={i} className="text-red-300 text-sm">{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCalculateAndSave}
              disabled={!hasRequiredInputs}
              className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all ${
                hasRequiredInputs
                  ? 'bg-brand-lime text-gray-900 hover:bg-green-400 cursor-pointer'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {hasRequiredInputs ? '✅ Calculate & Save Targets' : '⬆️ Fill in the boxes above'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
