import React, { useState } from 'react';

export default function MassiveActionTargetsPage() {
  const [annualRevenue, setAnnualRevenue] = useState('');
  const [avgSaleAmount, setAvgSaleAmount] = useState('');
  const [closeRate, setCloseRate] = useState('');
  const [showRate, setShowRate] = useState('');
  const [contactToApptRate, setContactToApptRate] = useState('');
  const [callToContactRate, setCallToContactRate] = useState('');

  const calculateTargets = () => {
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
      weeklyRevenue: weeklyRevenue.toFixed(0),
      dailyRevenue: dailyRevenue.toFixed(0),
      dailyDeals: Math.ceil(dailyDeals),
      dailyDemos: Math.ceil(dailyDemos),
      dailyAppts: Math.ceil(dailyAppts),
      dailyContacts: Math.ceil(dailyContacts),
      dailyCalls: Math.ceil(dailyCalls),
    };
  };

  const targets = calculateTargets();
  const hasInputs = annualRevenue && avgSaleAmount && closeRate && showRate && contactToApptRate && callToContactRate;

  return (
    <div className="min-h-screen bg-brand-ink text-white p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-brand-lime mb-2">Massive Action Targets</h1>
          <p className="text-gray-400">Reverse-engineer your revenue with mathematical precision</p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Calculator */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Calculator Card */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Target Calculator</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Annual Revenue Target ($)</label>
                  <input
                    type="number"
                    value={annualRevenue}
                    onChange={(e) => setAnnualRevenue(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-brand-lime"
                    placeholder="500000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Average Sale Amount ($)</label>
                  <input
                    type="number"
                    value={avgSaleAmount}
                    onChange={(e) => setAvgSaleAmount(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-brand-lime"
                    placeholder="5000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Close Rate (%)</label>
                  <input
                    type="number"
                    value={closeRate}
                    onChange={(e) => setCloseRate(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-brand-lime"
                    placeholder="30"
                  />
                  <p className="text-xs text-gray-500 mt-1">Presentations to close 1 deal</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Show Rate (%)</label>
                  <input
                    type="number"
                    value={showRate}
                    onChange={(e) => setShowRate(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-brand-lime"
                    placeholder="70"
                  />
                  <p className="text-xs text-gray-500 mt-1">Appointments to get 1 show-up</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Contact → Appt Rate (%)</label>
                  <input
                    type="number"
                    value={contactToApptRate}
                    onChange={(e) => setContactToApptRate(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-brand-lime"
                    placeholder="40"
                  />
                  <p className="text-xs text-gray-500 mt-1">Contacts to set 1 appointment</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Call → Contact Rate (%)</label>
                  <input
                    type="number"
                    value={callToContactRate}
                    onChange={(e) => setCallToContactRate(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-brand-lime"
                    placeholder="25"
                  />
                  <p className="text-xs text-gray-500 mt-1">Calls to have 1 conversation</p>
                </div>
              </div>
            </div>

            {/* Results Card */}
            {hasInputs && (
              <div className="bg-gray-800 rounded-lg p-6 border border-brand-lime">
                <h2 className="text-xl font-bold text-brand-lime mb-4">Your Daily Action Plan</h2>
                
                {/* Big Numbers Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div className="text-xs text-gray-400 mb-1">DAILY CALLS</div>
                    <div className="text-3xl font-bold text-brand-lime">{targets.dailyCalls}</div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div className="text-xs text-gray-400 mb-1">CONTACTS</div>
                    <div className="text-3xl font-bold text-brand-lime">{targets.dailyContacts}</div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div className="text-xs text-gray-400 mb-1">APPOINTMENTS</div>
                    <div className="text-3xl font-bold text-brand-lime">{targets.dailyAppts}</div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div className="text-xs text-gray-400 mb-1">DEMOS</div>
                    <div className="text-3xl font-bold text-brand-lime">{targets.dailyDemos}</div>
                  </div>
                </div>

                {/* Revenue Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div className="text-xs text-gray-400 mb-1">WEEKLY REVENUE</div>
                    <div className="text-2xl font-bold text-white">${parseInt(targets.weeklyRevenue).toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div className="text-xs text-gray-400 mb-1">DAILY REVENUE</div>
                    <div className="text-2xl font-bold text-white">${parseInt(targets.dailyRevenue).toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div className="text-xs text-gray-400 mb-1">DAILY DEALS</div>
                    <div className="text-2xl font-bold text-white">{targets.dailyDeals}</div>
                  </div>
                </div>

                {/* Reality Check */}
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                  <p className="text-white font-bold mb-2">⚡ Reality Check</p>
                  <p className="text-gray-300 text-sm">
                    To hit <span className="text-brand-lime font-bold">${parseInt(annualRevenue).toLocaleString()}</span> this year, 
                    you need <span className="text-brand-lime font-bold">{targets.dailyCalls} calls every day</span>. 
                    Are you doing that right now?
                  </p>
                </div>
              </div>
            )}

            {/* Implementation Plan */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">30-Day Implementation</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
                  <div>
                    <div className="font-semibold text-white">Week 1: Baseline</div>
                    <div className="text-sm text-gray-400">Track all metrics to establish your baseline numbers</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
                  <div>
                    <div className="font-semibold text-white">Week 2: Set Targets</div>
                    <div className="text-sm text-gray-400">Calculate and commit to your daily activity targets</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
                  <div>
                    <div className="font-semibold text-white">Week 3: Execute</div>
                    <div className="text-sm text-gray-400">Hit your daily targets and adjust as needed</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-yellow-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">4</div>
                  <div>
                    <div className="font-semibold text-white">Week 4: Review & Scale</div>
                    <div className="text-sm text-gray-400">Analyze results and increase targets if successful</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Info Cards */}
          <div className="space-y-6">
            
            {/* Why Targets Matter */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-brand-lime mb-3">Why Targets Matter</h3>
              <p className="text-sm text-gray-300 mb-3">
                Most salespeople fail not because they lack skill, but because they lack a <strong className="text-white">target</strong>.
              </p>
              <p className="text-sm text-gray-300">
                <strong className="text-brand-lime">Targets drive everything forward.</strong> They set the vision, 
                provide inspiration, and establish accountability.
              </p>
            </div>

            {/* Three-Part System */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4">The Three-Part System</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">1</div>
                    <div className="font-semibold text-white">Revenue Targets</div>
                  </div>
                  <p className="text-xs text-gray-400 ml-8">Annual → Weekly → Daily revenue goals</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">2</div>
                    <div className="font-semibold text-white">Activity Targets</div>
                  </div>
                  <p className="text-xs text-gray-400 ml-8">Calls, appointments, presentations needed</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">3</div>
                    <div className="font-semibold text-white">People Targets</div>
                  </div>
                  <p className="text-xs text-gray-400 ml-8">Prospects and relationships in pipeline</p>
                </div>
              </div>
            </div>

            {/* Fatal Mistake */}
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-red-400 mb-3">The Fatal Mistake</h3>
              <p className="text-sm text-gray-300 mb-3">
                The biggest mistake is setting targets <strong className="text-red-400">too low</strong>. 
                Low targets create low thinking.
              </p>
              <p className="text-sm text-gray-300">
                <strong className="text-brand-lime">Massive targets force you to think differently</strong> and 
                drive the level of thinking required to actually impact revenue.
              </p>
            </div>

            {/* Quick Tip */}
            <div className="bg-brand-lime/10 border border-brand-lime/30 rounded-lg p-6">
              <h3 className="text-lg font-bold text-brand-lime mb-3">💡 Pro Tip</h3>
              <p className="text-sm text-gray-300">
                Track your daily progress in the <strong className="text-white">EOD Report</strong> to ensure 
                you're hitting these targets consistently.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
