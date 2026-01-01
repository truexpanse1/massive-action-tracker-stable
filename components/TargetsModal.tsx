import React, { useState, useEffect } from 'react';

interface TargetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (targets: CalculatedTargets) => void;
  initialValues?: {
    annualRevenue: string;
    avgSaleAmount: string;
    closeRate: string;
    showRate: string;
    contactToApptRate: string;
    callToContactRate: string;
  };
}

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
}

export default function TargetsModal({ isOpen, onClose, onSave, initialValues }: TargetsModalProps) {
  const [annualRevenue, setAnnualRevenue] = useState(initialValues?.annualRevenue || '');
  const [avgSaleAmount, setAvgSaleAmount] = useState(initialValues?.avgSaleAmount || '');
  const [closeRate, setCloseRate] = useState(initialValues?.closeRate || '');
  const [showRate, setShowRate] = useState(initialValues?.showRate || '');
  const [contactToApptRate, setContactToApptRate] = useState(initialValues?.contactToApptRate || '');
  const [callToContactRate, setCallToContactRate] = useState(initialValues?.callToContactRate || '');

  useEffect(() => {
    if (initialValues) {
      setAnnualRevenue(initialValues.annualRevenue);
      setAvgSaleAmount(initialValues.avgSaleAmount);
      setCloseRate(initialValues.closeRate);
      setShowRate(initialValues.showRate);
      setContactToApptRate(initialValues.contactToApptRate);
      setCallToContactRate(initialValues.callToContactRate);
    }
  }, [initialValues]);

  const calculateTargets = (): CalculatedTargets => {
    const annual = parseFloat(annualRevenue) || 0;
    const avgSale = parseFloat(avgSaleAmount) || 1;
    const close = parseFloat(closeRate) / 100 || 0.01;
    const show = parseFloat(showRate) / 100 || 0.01;
    const contactAppt = parseFloat(contactToApptRate) / 100 || 0.01;
    const callContact = parseFloat(callToContactRate) / 100 || 0.01;

    const weeklyRevenue = annual / 52;
    const dailyRevenue = weeklyRevenue / 5;
    const dailyDeals = dailyRevenue / avgSale;
    const dailyDemos = dailyDeals / close;
    const dailyAppts = dailyDemos / show;
    const dailyContacts = dailyAppts / contactAppt;
    const dailyCalls = dailyContacts / callContact;

    return {
      annualRevenue: annual,
      avgSaleAmount: avgSale,
      closeRate: parseFloat(closeRate) || 0,
      showRate: parseFloat(showRate) || 0,
      contactToApptRate: parseFloat(contactToApptRate) || 0,
      callToContactRate: parseFloat(callToContactRate) || 0,
      weeklyRevenue: Math.round(weeklyRevenue),
      dailyRevenue: Math.round(dailyRevenue),
      dailyDeals: Math.ceil(dailyDeals),
      dailyDemos: Math.ceil(dailyDemos),
      dailyAppts: Math.ceil(dailyAppts),
      dailyContacts: Math.ceil(dailyContacts),
      dailyCalls: Math.ceil(dailyCalls),
    };
  };

  const hasInputs = annualRevenue && avgSaleAmount && closeRate && showRate && contactToApptRate && callToContactRate;

  const handleSave = () => {
    if (hasInputs) {
      const targets = calculateTargets();
      onSave(targets);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-brand-lime">Set Your Targets</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Calculator Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                How much money do you want to make this year?
              </label>
              <input
                type="number"
                value={annualRevenue}
                onChange={(e) => setAnnualRevenue(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-brand-lime"
                placeholder="500000"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                How much is one sale worth?
              </label>
              <input
                type="number"
                value={avgSaleAmount}
                onChange={(e) => setAvgSaleAmount(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-brand-lime"
                placeholder="9000"
              />
              <p className="text-xs text-gray-500 mt-1">For monthly plans, use the yearly value</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                How many demos to close 1 sale?
              </label>
              <input
                type="number"
                value={closeRate}
                onChange={(e) => setCloseRate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-brand-lime"
                placeholder="30"
              />
              <p className="text-xs text-gray-500 mt-1">Example: 3 demos = 1 sale = 33%</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                How many people actually show up?
              </label>
              <input
                type="number"
                value={showRate}
                onChange={(e) => setShowRate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-brand-lime"
                placeholder="70"
              />
              <p className="text-xs text-gray-500 mt-1">Example: 7 out of 10 show up = 70%</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                How many talks to book 1 meeting?
              </label>
              <input
                type="number"
                value={contactToApptRate}
                onChange={(e) => setContactToApptRate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-brand-lime"
                placeholder="10"
              />
              <p className="text-xs text-gray-500 mt-1">Example: Talk to 10 people, 1 books = 10%</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                How many calls to talk to 1 person?
              </label>
              <input
                type="number"
                value={callToContactRate}
                onChange={(e) => setCallToContactRate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-brand-lime"
                placeholder="14"
              />
              <p className="text-xs text-gray-500 mt-1">Example: Call 70 people, talk to 10 = 14%</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={!hasInputs}
              className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all ${
                hasInputs
                  ? 'bg-brand-lime text-gray-900 hover:bg-green-400 cursor-pointer'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {hasInputs ? '✅ Save My Targets' : '⬆️ Fill in all fields'}
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
