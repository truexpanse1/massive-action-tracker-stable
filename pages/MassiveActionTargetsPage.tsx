import React, { useState } from 'react';

export default function MassiveActionTargetsPage() {
  const [annualRevenue, setAnnualRevenue] = useState('');
  const [avgSaleAmount, setAvgSaleAmount] = useState('');
  const [closeRate, setCloseRate] = useState('');
  const [showRate, setShowRate] = useState('');
  const [contactToApptRate, setContactToApptRate] = useState('');
  const [callToContactRate, setCallToContactRate] = useState('');
  const [showResults, setShowResults] = useState(false);

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

  // Auto-show results when all inputs are filled
  React.useEffect(() => {
    if (hasInputs) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [hasInputs]);

  return (
    <div className="min-h-screen bg-brand-ink text-white p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-brand-lime mb-2">Massive Action Targets</h1>
          <p className="text-gray-400">Reverse-engineer your revenue into daily action steps</p>
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
              
              {/* Calculate Button */}
              <div className="mt-6">
                <button
                  onClick={() => setShowResults(true)}
                  disabled={!hasInputs}
                  className={`w-full py-3 px-6 rounded-lg font-bold text-lg transition-all ${
                    hasInputs
                      ? 'bg-brand-lime text-gray-900 hover:bg-green-400 cursor-pointer'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {hasInputs ? '🎯 Calculate My Action Plan' : '⬆️ Fill in all fields above'}
                </button>
              </div>
            </div>

            {/* Action Plan Results */}
            {hasInputs && showResults && (
              <div className="space-y-6">
                
                {/* Your Numbers Summary */}
                <div className="bg-gray-800 rounded-lg p-6 border border-brand-lime">
                  <h2 className="text-xl font-bold text-brand-lime mb-4">📊 Your Numbers at a Glance</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                      <div className="text-xs text-gray-400 mb-1">DAILY CALLS</div>
                      <div className="text-2xl font-bold text-brand-lime">{targets.dailyCalls}</div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                      <div className="text-xs text-gray-400 mb-1">CONTACTS</div>
                      <div className="text-2xl font-bold text-brand-lime">{targets.dailyContacts}</div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                      <div className="text-xs text-gray-400 mb-1">APPOINTMENTS</div>
                      <div className="text-2xl font-bold text-brand-lime">{targets.dailyAppts}</div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                      <div className="text-xs text-gray-400 mb-1">DEMOS</div>
                      <div className="text-2xl font-bold text-brand-lime">{targets.dailyDemos}</div>
                    </div>
                  </div>
                </div>

                {/* Daily Action Steps */}
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h2 className="text-xl font-bold text-white mb-4">✅ Your Daily Action Steps</h2>
                  <div className="space-y-4">
                    
                    {/* Step 1: Morning Prospecting Block */}
                    <div className="bg-gray-900 rounded-lg p-4 border-l-4 border-blue-500">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">1</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-white mb-2">Morning Prospecting Block (9am - 12pm)</h3>
                          <div className="space-y-2 text-sm text-gray-300">
                            <p>• <strong className="text-brand-lime">Make {targets.dailyCalls} calls</strong> to reach {targets.dailyContacts} contacts</p>
                            <p>• Use the <strong>Prospecting page</strong> to log each call (SW/NA/LM codes)</p>
                            <p>• Goal: Set <strong className="text-brand-lime">{targets.dailyAppts} appointments</strong> for this week</p>
                            <p className="text-xs text-gray-500 mt-2">💡 Tip: Block this time on your calendar. No meetings, no distractions.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 2: Appointment Execution */}
                    <div className="bg-gray-900 rounded-lg p-4 border-l-4 border-green-500">
                      <div className="flex items-start gap-3">
                        <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">2</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-white mb-2">Run Your Appointments (Afternoon)</h3>
                          <div className="space-y-2 text-sm text-gray-300">
                            <p>• Deliver <strong className="text-brand-lime">{targets.dailyDemos} presentations/demos</strong> today</p>
                            <p>• Track show rate: Expect {Math.ceil(targets.dailyDemos / (parseFloat(showRate) / 100))} scheduled to get {targets.dailyDemos} shows</p>
                            <p>• Close <strong className="text-brand-lime">{targets.dailyDeals} deal(s)</strong> to hit ${parseInt(targets.dailyRevenue).toLocaleString()} daily revenue</p>
                            <p className="text-xs text-gray-500 mt-2">💡 Tip: Log outcomes immediately in Hot Leads page</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 3: Follow-Up & Pipeline Management */}
                    <div className="bg-gray-900 rounded-lg p-4 border-l-4 border-purple-500">
                      <div className="flex items-start gap-3">
                        <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">3</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-white mb-2">Follow-Up & Pipeline Management</h3>
                          <div className="space-y-2 text-sm text-gray-300">
                            <p>• Review <strong>Hot Leads</strong> page for follow-ups</p>
                            <p>• Send follow-up messages to no-shows and pending decisions</p>
                            <p>• Update deal stages in pipeline</p>
                            <p className="text-xs text-gray-500 mt-2">💡 Tip: Set reminders for next touchpoints</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 4: EOD Tracking */}
                    <div className="bg-gray-900 rounded-lg p-4 border-l-4 border-yellow-500">
                      <div className="flex items-start gap-3">
                        <div className="bg-yellow-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">4</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-white mb-2">End of Day Review (5pm)</h3>
                          <div className="space-y-2 text-sm text-gray-300">
                            <p>• Complete <strong>EOD Report</strong> to track today's metrics</p>
                            <p>• Compare actual vs targets:</p>
                            <div className="ml-4 text-xs text-gray-400">
                              <p>- Calls: Did you hit {targets.dailyCalls}?</p>
                              <p>- Appointments set: Did you hit {targets.dailyAppts}?</p>
                              <p>- Deals closed: Did you hit {targets.dailyDeals}?</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">💡 Tip: If you missed targets, adjust tomorrow's activity</p>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Weekly Implementation */}
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h2 className="text-xl font-bold text-white mb-4">📅 Weekly Implementation Plan</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="text-brand-lime font-bold">Mon-Fri:</div>
                      <div className="text-sm text-gray-300">Execute daily action steps above. Track everything in MAT.</div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-brand-lime font-bold">Friday EOD:</div>
                      <div className="text-sm text-gray-300">Review weekly totals. Did you hit ${parseInt(targets.weeklyRevenue).toLocaleString()}?</div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-brand-lime font-bold">Weekend:</div>
                      <div className="text-sm text-gray-300">Plan next week's appointments. Prep materials for demos.</div>
                    </div>
                  </div>
                </div>

                {/* Reality Check */}
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-red-400 mb-3">⚡ Reality Check</h3>
                  <p className="text-white text-sm mb-3">
                    To hit <span className="text-brand-lime font-bold">${parseInt(annualRevenue).toLocaleString()}</span> this year, 
                    you need to make <span className="text-brand-lime font-bold">{targets.dailyCalls} calls every single day</span>.
                  </p>
                  <p className="text-gray-300 text-sm">
                    Are you currently doing that? If not, your revenue target is just a wish. 
                    Use this action plan to turn it into reality.
                  </p>
                </div>

              </div>
            )}

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
              <h3 className="text-lg font-bold text-brand-lime mb-3">💡 Next Steps</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>1. <strong className="text-white">Save these numbers</strong> - screenshot or write them down</p>
                <p>2. <strong className="text-white">Block your calendar</strong> for morning prospecting</p>
                <p>3. <strong className="text-white">Track daily</strong> in EOD Report</p>
                <p>4. <strong className="text-white">Review weekly</strong> and adjust</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
