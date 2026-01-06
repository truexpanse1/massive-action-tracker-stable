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
          <p className="text-gray-400">Turn your money goal into a daily to-do list</p>
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
                  <label className="block text-sm font-semibold text-gray-300 mb-2">How much money do you want to make this year?</label>
                  <input
                    type="number"
                    value={annualRevenue}
                    onChange={(e) => setAnnualRevenue(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-brand-lime"
                    placeholder="500000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">How much is one sale worth?</label>
                  <input
                    type="number"
                    value={avgSaleAmount}
                    onChange={(e) => setAvgSaleAmount(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-brand-lime"
                    placeholder="9000"
                  />
                  <p className="text-xs text-gray-500 mt-1">For monthly plans, use the yearly value</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">How many demos to close 1 sale?</label>
                  <input
                    type="number"
                    value={closeRate}
                    onChange={(e) => setCloseRate(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-brand-lime"
                    placeholder="30"
                  />
                  <p className="text-xs text-gray-500 mt-1">Example: 3 demos = 1 sale = 33%</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">How many people actually show up?</label>
                  <input
                    type="number"
                    value={showRate}
                    onChange={(e) => setShowRate(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-brand-lime"
                    placeholder="70"
                  />
                  <p className="text-xs text-gray-500 mt-1">Example: 7 out of 10 show up = 70%</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">How many talks to book 1 meeting?</label>
                  <input
                    type="number"
                    value={contactToApptRate}
                    onChange={(e) => setContactToApptRate(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-brand-lime"
                    placeholder="10"
                  />
                  <p className="text-xs text-gray-500 mt-1">Example: Talk to 10 people, 1 books = 10%</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">How many calls to talk to 1 person?</label>
                  <input
                    type="number"
                    value={callToContactRate}
                    onChange={(e) => setCallToContactRate(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-brand-lime"
                    placeholder="14"
                  />
                  <p className="text-xs text-gray-500 mt-1">Example: Call 70 people, talk to 10 = 14%</p>
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
                  {hasInputs ? '🎯 Show Me What To Do' : '⬆️ Fill in all boxes above'}
                </button>
              </div>
            </div>

            {/* Action Plan Results */}
            {hasInputs && showResults && (
              <div className="space-y-6">
                
                {/* Daily & Weekly Action Plan Dashboard */}
                <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-lg p-6 border-2 border-brand-lime shadow-2xl">
                  <h2 className="text-2xl font-black text-brand-lime mb-6 text-center">📊 YOUR ACTION PLAN</h2>
                  
                  {/* Daily Targets */}
                  <div className="bg-gray-900/80 rounded-lg p-6 mb-6 border border-brand-lime/50">
                    <h3 className="text-xl font-bold text-brand-lime mb-4 flex items-center gap-2">
                      <span className="bg-brand-lime text-gray-900 rounded-full w-8 h-8 flex items-center justify-center text-sm">D</span>
                      DAILY TARGETS (What to do TODAY)
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-green-500">
                        <div className="text-4xl font-black text-brand-lime mb-1">${parseInt(targets.dailyRevenue).toLocaleString()}</div>
                        <div className="text-xs text-gray-400 uppercase">💰 Revenue to Generate</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500">
                        <div className="text-4xl font-black text-brand-lime mb-1">{targets.dailyCalls}</div>
                        <div className="text-xs text-gray-400 uppercase">📞 Calls to Make</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-purple-500">
                        <div className="text-4xl font-black text-brand-lime mb-1">{targets.dailyContacts}</div>
                        <div className="text-xs text-gray-400 uppercase">🤝 Conversations</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-yellow-500">
                        <div className="text-4xl font-black text-brand-lime mb-1">{targets.dailyAppts}</div>
                        <div className="text-xs text-gray-400 uppercase">📅 Meetings to Book</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-red-500">
                        <div className="text-4xl font-black text-brand-lime mb-1">{targets.dailyDemos}</div>
                        <div className="text-xs text-gray-400 uppercase">🎯 Demos to Run</div>
                      </div>
                    </div>
                  </div>

                  {/* Weekly Targets */}
                  <div className="bg-gray-900/80 rounded-lg p-6 border border-brand-lime/50">
                    <h3 className="text-xl font-bold text-brand-lime mb-4 flex items-center gap-2">
                      <span className="bg-brand-lime text-gray-900 rounded-full w-8 h-8 flex items-center justify-center text-sm">W</span>
                      WEEKLY TARGETS (This Week's Mission)
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-green-500">
                        <div className="text-4xl font-black text-brand-lime mb-1">${parseInt(targets.weeklyRevenue).toLocaleString()}</div>
                        <div className="text-xs text-gray-400 uppercase">💰 Weekly Revenue</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500">
                        <div className="text-4xl font-black text-brand-lime mb-1">{targets.dailyCalls * 5}</div>
                        <div className="text-xs text-gray-400 uppercase">📞 Total Calls</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-purple-500">
                        <div className="text-4xl font-black text-brand-lime mb-1">{targets.dailyContacts * 5}</div>
                        <div className="text-xs text-gray-400 uppercase">🤝 Conversations</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-yellow-500">
                        <div className="text-4xl font-black text-brand-lime mb-1">{targets.dailyAppts * 5}</div>
                        <div className="text-xs text-gray-400 uppercase">📅 Appointments</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-red-500">
                        <div className="text-4xl font-black text-brand-lime mb-1">{targets.dailyDemos * 5}</div>
                        <div className="text-xs text-gray-400 uppercase">🎯 Demos</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-pink-500">
                        <div className="text-4xl font-black text-brand-lime mb-1">{targets.dailyDeals * 5}</div>
                        <div className="text-xs text-gray-400 uppercase">💼 Deals to Close</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Your Numbers Summary */}
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h2 className="text-xl font-bold text-white mb-4">📊 Your Targets at a Glance</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                      <div className="text-xs text-gray-400 mb-1">CALLS</div>
                      <div className="text-2xl font-bold text-brand-lime">{targets.dailyCalls}</div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                      <div className="text-xs text-gray-400 mb-1">TALKS</div>
                      <div className="text-2xl font-bold text-brand-lime">{targets.dailyContacts}</div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                      <div className="text-xs text-gray-400 mb-1">MEETINGS</div>
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
                  <h2 className="text-xl font-bold text-white mb-4">✅ What To Do Every Day</h2>
                  <div className="space-y-4">
                    
                    {/* Step 1: Morning Calls */}
                    <div className="bg-gray-900 rounded-lg p-4 border-l-4 border-blue-500">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">1</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-white mb-2">Morning: Make Your Calls (9am - 12pm)</h3>
                          <div className="space-y-2 text-sm text-gray-300">
                            <p>• Call <strong className="text-brand-lime">{targets.dailyCalls} people</strong></p>
                            <p>• You will talk to about <strong className="text-brand-lime">{targets.dailyContacts} people</strong></p>
                            <p>• Book <strong className="text-brand-lime">{targets.dailyAppts} meetings</strong> for later this week</p>
                            <p className="text-xs text-gray-500 mt-2">💡 Tip: Do this first thing in the morning. No emails or other work yet.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 2: Run Meetings */}
                    <div className="bg-gray-900 rounded-lg p-4 border-l-4 border-green-500">
                      <div className="flex items-start gap-3">
                        <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">2</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-white mb-2">Afternoon: Do Your Demos</h3>
                          <div className="space-y-2 text-sm text-gray-300">
                            <p>• Run <strong className="text-brand-lime">{targets.dailyDemos} demos</strong> today</p>
                            <p>• Close <strong className="text-brand-lime">{targets.dailyDeals} sale(s)</strong> to make ${parseInt(targets.dailyRevenue).toLocaleString()}</p>
                            <p>• Write down what happens after each demo</p>
                            <p className="text-xs text-gray-500 mt-2">💡 Tip: Some people won't show up. That's normal. Keep going.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 3: Follow Up */}
                    <div className="bg-gray-900 rounded-lg p-4 border-l-4 border-purple-500">
                      <div className="flex items-start gap-3">
                        <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">3</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-white mb-2">Evening: Check On People</h3>
                          <div className="space-y-2 text-sm text-gray-300">
                            <p>• Message people who didn't show up</p>
                            <p>• Message people who said "maybe"</p>
                            <p>• Plan tomorrow's calls</p>
                            <p className="text-xs text-gray-500 mt-2">💡 Tip: Send a quick text or email. Keep it short.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 4: Track It */}
                    <div className="bg-gray-900 rounded-lg p-4 border-l-4 border-yellow-500">
                      <div className="flex items-start gap-3">
                        <div className="bg-yellow-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">4</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-white mb-2">Before Bed: Write It Down (5pm)</h3>
                          <div className="space-y-2 text-sm text-gray-300">
                            <p>• Fill out your EOD Report</p>
                            <p>• Check: Did you hit your numbers?</p>
                            <div className="ml-4 text-xs text-gray-400">
                              <p>- Calls: {targets.dailyCalls}?</p>
                              <p>- Meetings booked: {targets.dailyAppts}?</p>
                              <p>- Sales: {targets.dailyDeals}?</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">💡 Tip: If you missed your numbers, do more tomorrow.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Weekly Plan */}
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h2 className="text-xl font-bold text-white mb-4">📅 Your Week</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="text-brand-lime font-bold">Mon-Fri:</div>
                      <div className="text-sm text-gray-300">Do steps 1-4 above every day.</div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-brand-lime font-bold">Friday:</div>
                      <div className="text-sm text-gray-300">Add up your week. Did you make ${parseInt(targets.weeklyRevenue).toLocaleString()}?</div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-brand-lime font-bold">Weekend:</div>
                      <div className="text-sm text-gray-300">Get ready for next week. Make a list of people to call.</div>
                    </div>
                  </div>
                </div>

                {/* Reality Check */}
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-red-400 mb-3">⚡ The Truth</h3>
                  <p className="text-white text-sm mb-3">
                    To make <span className="text-brand-lime font-bold">${parseInt(annualRevenue).toLocaleString()}</span> this year, 
                    you need to call <span className="text-brand-lime font-bold">{targets.dailyCalls} people every day</span>.
                  </p>
                  <p className="text-gray-300 text-sm">
                    Are you doing that now? If not, you won't hit your goal. It's that simple.
                  </p>
                </div>

              </div>
            )}

          </div>

          {/* Right Column - Info Cards */}
          <div className="space-y-6">
            
            {/* Why This Matters */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-brand-lime mb-3">Why This Works</h3>
              <p className="text-sm text-gray-300 mb-3">
                Most people fail because they don't have a <strong className="text-white">plan</strong>.
              </p>
              <p className="text-sm text-gray-300">
                This calculator gives you a plan. Follow it every day and you will hit your goal.
              </p>
            </div>

            {/* The Three Parts */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4">Three Things You Need</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">1</div>
                    <div className="font-semibold text-white">Money Goal</div>
                  </div>
                  <p className="text-xs text-gray-400 ml-8">How much you want to make</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">2</div>
                    <div className="font-semibold text-white">Daily Actions</div>
                  </div>
                  <p className="text-xs text-gray-400 ml-8">Calls and meetings you need to do</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">3</div>
                    <div className="font-semibold text-white">People List</div>
                  </div>
                  <p className="text-xs text-gray-400 ml-8">Names of people to call</p>
                </div>
              </div>
            </div>

            {/* Big Mistake */}
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-red-400 mb-3">Don't Do This</h3>
              <p className="text-sm text-gray-300 mb-3">
                Don't set your goal <strong className="text-red-400">too small</strong>. 
              </p>
              <p className="text-sm text-gray-300">
                Small goals make you lazy. <strong className="text-brand-lime">Big goals make you work harder and think smarter.</strong>
              </p>
            </div>

            {/* What To Do Next */}
            <div className="bg-brand-lime/10 border border-brand-lime/30 rounded-lg p-6">
              <h3 className="text-lg font-bold text-brand-lime mb-3">💡 What To Do Now</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>1. <strong className="text-white">Save your numbers</strong> - take a screenshot</p>
                <p>2. <strong className="text-white">Block your morning</strong> for calls (no meetings!)</p>
                <p>3. <strong className="text-white">Track it daily</strong> in EOD Report</p>
                <p>4. <strong className="text-white">Check every Friday</strong> - did you hit your week?</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
