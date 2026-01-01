import React, { useState, useEffect } from 'react';

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

  useEffect(() => {
    if (hasInputs) {
      setShowResults(true);
    }
  }, [hasInputs]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-brand-ink to-gray-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Hero Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-lime via-green-400 to-brand-lime mb-4 animate-pulse">
            Massive Action Targets
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300 font-bold">
            The Revenue Engineering System
          </p>
          <p className="text-lg text-gray-400 mt-4 max-w-3xl mx-auto">
            Stop guessing. Start engineering your revenue with mathematical precision.
          </p>
        </div>

        {/* Why Targets Matter - High Contrast Card */}
        <div className="bg-gradient-to-r from-brand-lime/20 to-green-500/20 border-2 border-brand-lime rounded-2xl p-8 md:p-12 mb-12 shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
            ⚡ Why Targets Are Non-Negotiable
          </h2>
          <div className="space-y-4 text-lg md:text-xl">
            <p className="text-gray-100 leading-relaxed">
              Most salespeople fail not because they lack skill, but because they lack a <span className="text-brand-lime font-bold">target</span>. 
              Without a clear, measurable target, you are flying blind.
            </p>
            <p className="text-gray-100 leading-relaxed">
              <span className="text-brand-lime font-black text-2xl">Targets drive everything forward.</span> They set the vision, 
              provide the inspiration, and establish the accountability to ensure you actually arrive.
            </p>
            <p className="text-white font-bold text-xl bg-brand-lime/20 p-4 rounded-lg border-l-4 border-brand-lime">
              Without targets, you're hoping for success. With targets, you're engineering it.
            </p>
          </div>
        </div>

        {/* Three-Part System - Redesigned */}
        <div className="mb-12">
          <h2 className="text-4xl font-black text-white mb-8 text-center">The Three-Part Target System</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-gradient-to-br from-blue-600/30 to-blue-800/30 border-2 border-blue-400 rounded-2xl p-8 hover:scale-105 transition-transform">
              <div className="text-6xl font-black text-blue-400 mb-4">1</div>
              <h3 className="text-2xl font-bold text-white mb-4">💰 Revenue Targets</h3>
              <p className="text-gray-200 text-lg leading-relaxed">
                This is the number that matters most. Start with your annual revenue goal, then break it down into weekly and daily targets.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-600/30 to-green-800/30 border-2 border-green-400 rounded-2xl p-8 hover:scale-105 transition-transform">
              <div className="text-6xl font-black text-green-400 mb-4">2</div>
              <h3 className="text-2xl font-bold text-white mb-4">📞 Activity Targets</h3>
              <p className="text-gray-200 text-lg leading-relaxed">
                Revenue doesn't happen by accident. It happens because you made enough calls, set enough appointments, and delivered enough presentations.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-600/30 to-purple-800/30 border-2 border-purple-400 rounded-2xl p-8 hover:scale-105 transition-transform">
              <div className="text-6xl font-black text-purple-400 mb-4">3</div>
              <h3 className="text-2xl font-bold text-white mb-4">👥 People Targets</h3>
              <p className="text-gray-200 text-lg leading-relaxed">
                You cannot scale alone. The bigger your revenue target, the more people you need in your pipeline.
              </p>
            </div>
          </div>
        </div>

        {/* Fatal Mistake - High Impact Warning */}
        <div className="bg-gradient-to-r from-red-900/40 to-red-700/40 border-2 border-red-500 rounded-2xl p-8 md:p-12 mb-12 shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-black text-red-400 mb-6">
            🚨 The Fatal Mistake: Setting Targets Too Low
          </h2>
          <div className="space-y-4 text-lg md:text-xl">
            <p className="text-gray-100 leading-relaxed">
              The biggest mistake salespeople make with targets is not that they miss them—it's that they set them <span className="text-red-400 font-bold">too low</span> in the first place.
            </p>
            <p className="text-gray-100 leading-relaxed">
              Low targets create low thinking. They don't force you to innovate, hustle, or think strategically. They let you stay comfortable.
            </p>
            <p className="text-white font-bold text-2xl bg-brand-lime/20 p-6 rounded-lg border-l-4 border-brand-lime">
              A massive target will drive the level of thinking required to actually impact revenue.
            </p>
          </div>
        </div>

        {/* Calculator Section - Completely Redesigned */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-brand-lime rounded-2xl p-8 md:p-12 mb-12 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-black text-brand-lime mb-4">
              🎯 Your Target Calculator
            </h2>
            <p className="text-xl text-gray-300">
              Enter your numbers below to reverse-engineer your daily action plan
            </p>
          </div>

          {/* Input Grid - High Contrast */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-white font-bold text-lg mb-3">Annual Revenue Target ($)</label>
              <input
                type="number"
                value={annualRevenue}
                onChange={(e) => setAnnualRevenue(e.target.value)}
                className="w-full bg-gray-900 border-2 border-brand-lime/50 rounded-lg px-6 py-4 text-white text-xl font-bold focus:outline-none focus:border-brand-lime focus:ring-2 focus:ring-brand-lime/50 transition-all"
                placeholder="e.g., 500000"
              />
            </div>
            <div>
              <label className="block text-white font-bold text-lg mb-3">Average Sale Amount ($)</label>
              <input
                type="number"
                value={avgSaleAmount}
                onChange={(e) => setAvgSaleAmount(e.target.value)}
                className="w-full bg-gray-900 border-2 border-brand-lime/50 rounded-lg px-6 py-4 text-white text-xl font-bold focus:outline-none focus:border-brand-lime focus:ring-2 focus:ring-brand-lime/50 transition-all"
                placeholder="e.g., 5000"
              />
            </div>
            <div>
              <label className="block text-white font-bold text-lg mb-3">Close Rate (%)</label>
              <input
                type="number"
                value={closeRate}
                onChange={(e) => setCloseRate(e.target.value)}
                className="w-full bg-gray-900 border-2 border-brand-lime/50 rounded-lg px-6 py-4 text-white text-xl font-bold focus:outline-none focus:border-brand-lime focus:ring-2 focus:ring-brand-lime/50 transition-all"
                placeholder="e.g., 30"
              />
              <p className="text-gray-400 text-sm mt-2">How many presentations to close 1 deal?</p>
            </div>
            <div>
              <label className="block text-white font-bold text-lg mb-3">Appointment Show Rate (%)</label>
              <input
                type="number"
                value={showRate}
                onChange={(e) => setShowRate(e.target.value)}
                className="w-full bg-gray-900 border-2 border-brand-lime/50 rounded-lg px-6 py-4 text-white text-xl font-bold focus:outline-none focus:border-brand-lime focus:ring-2 focus:ring-brand-lime/50 transition-all"
                placeholder="e.g., 70"
              />
              <p className="text-gray-400 text-sm mt-2">How many appointments to get 1 show-up?</p>
            </div>
            <div>
              <label className="block text-white font-bold text-lg mb-3">Contact-to-Appointment Rate (%)</label>
              <input
                type="number"
                value={contactToApptRate}
                onChange={(e) => setContactToApptRate(e.target.value)}
                className="w-full bg-gray-900 border-2 border-brand-lime/50 rounded-lg px-6 py-4 text-white text-xl font-bold focus:outline-none focus:border-brand-lime focus:ring-2 focus:ring-brand-lime/50 transition-all"
                placeholder="e.g., 40"
              />
              <p className="text-gray-400 text-sm mt-2">How many contacts to set 1 appointment?</p>
            </div>
            <div>
              <label className="block text-white font-bold text-lg mb-3">Call-to-Contact Rate (%)</label>
              <input
                type="number"
                value={callToContactRate}
                onChange={(e) => setCallToContactRate(e.target.value)}
                className="w-full bg-gray-900 border-2 border-brand-lime/50 rounded-lg px-6 py-4 text-white text-xl font-bold focus:outline-none focus:border-brand-lime focus:ring-2 focus:ring-brand-lime/50 transition-all"
                placeholder="e.g., 25"
              />
              <p className="text-gray-400 text-sm mt-2">How many calls to have 1 conversation?</p>
            </div>
          </div>

          {/* Results - WOW FACTOR */}
          {hasInputs && showResults && (
            <div className="border-t-4 border-brand-lime pt-8 animate-fadeIn">
              <div className="text-center mb-8">
                <h3 className="text-3xl md:text-4xl font-black text-brand-lime mb-2">
                  💥 Your Daily Action Plan
                </h3>
                <p className="text-xl text-gray-300">
                  Here's what you need to do EVERY SINGLE DAY to hit ${parseInt(annualRevenue).toLocaleString()}
                </p>
              </div>

              {/* Big Numbers - Hero Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6 text-center shadow-xl hover:scale-105 transition-transform">
                  <div className="text-white/80 text-sm font-bold mb-2">DAILY CALLS</div>
                  <div className="text-5xl font-black text-white">{targets.dailyCalls}</div>
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-center shadow-xl hover:scale-105 transition-transform">
                  <div className="text-white/80 text-sm font-bold mb-2">DAILY CONTACTS</div>
                  <div className="text-5xl font-black text-white">{targets.dailyContacts}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 text-center shadow-xl hover:scale-105 transition-transform">
                  <div className="text-white/80 text-sm font-bold mb-2">DAILY APPOINTMENTS</div>
                  <div className="text-5xl font-black text-white">{targets.dailyAppts}</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-xl p-6 text-center shadow-xl hover:scale-105 transition-transform">
                  <div className="text-white/80 text-sm font-bold mb-2">DAILY DEMOS</div>
                  <div className="text-5xl font-black text-white">{targets.dailyDemos}</div>
                </div>
              </div>

              {/* Revenue Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-brand-lime/20 to-green-600/20 border-2 border-brand-lime rounded-xl p-6">
                  <div className="text-gray-300 text-sm font-bold mb-2">WEEKLY REVENUE TARGET</div>
                  <div className="text-4xl font-black text-brand-lime">${parseInt(targets.weeklyRevenue).toLocaleString()}</div>
                </div>
                <div className="bg-gradient-to-br from-brand-lime/20 to-green-600/20 border-2 border-brand-lime rounded-xl p-6">
                  <div className="text-gray-300 text-sm font-bold mb-2">DAILY REVENUE TARGET</div>
                  <div className="text-4xl font-black text-brand-lime">${parseInt(targets.dailyRevenue).toLocaleString()}</div>
                </div>
                <div className="bg-gradient-to-br from-brand-lime/20 to-green-600/20 border-2 border-brand-lime rounded-xl p-6">
                  <div className="text-gray-300 text-sm font-bold mb-2">DAILY DEALS NEEDED</div>
                  <div className="text-4xl font-black text-brand-lime">{targets.dailyDeals}</div>
                </div>
              </div>

              {/* Reality Check Message */}
              <div className="bg-gradient-to-r from-red-900/40 to-orange-900/40 border-2 border-orange-500 rounded-xl p-8 text-center">
                <p className="text-2xl md:text-3xl font-black text-white mb-4">
                  ⚡ THE REALITY CHECK ⚡
                </p>
                <p className="text-xl text-gray-200 leading-relaxed">
                  To hit <span className="text-brand-lime font-black">${parseInt(annualRevenue).toLocaleString()}</span> this year, 
                  you need to make <span className="text-orange-400 font-black">{targets.dailyCalls} calls EVERY DAY</span>.
                </p>
                <p className="text-lg text-gray-300 mt-4">
                  Are you doing that right now? If not, your target is just a wish.
                </p>
              </div>
            </div>
          )}

          {!hasInputs && (
            <div className="text-center py-12">
              <p className="text-2xl text-gray-400">
                👆 Fill in all fields above to see your personalized action plan
              </p>
            </div>
          )}
        </div>

        {/* Implementation Plan */}
        <div className="mb-12">
          <h2 className="text-4xl font-black text-white mb-8 text-center">Implementation: Your Next 30 Days</h2>
          
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-900/40 to-blue-700/40 border-2 border-blue-400 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-blue-400 mb-4">Week 1: Baseline Your Numbers</h3>
              <p className="text-gray-200 text-lg leading-relaxed">
                If you do not already know your core metrics (close rate, show rate, etc.), spend this week tracking everything. 
                Log every call, every appointment, and every deal. By the end of the week, you will have your baseline numbers.
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-900/40 to-green-700/40 border-2 border-green-400 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-green-400 mb-4">Week 2: Set Your Targets</h3>
              <p className="text-gray-200 text-lg leading-relaxed">
                Using the calculator above, calculate your daily and weekly activity targets. Write them down. Post them somewhere 
                visible. Share them with your coach or accountability partner. Make them real.
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-900/40 to-purple-700/40 border-2 border-purple-400 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-purple-400 mb-4">Week 3: Execute and Adjust</h3>
              <p className="text-gray-200 text-lg leading-relaxed">
                Hit your daily targets. Every single day. If you fall short, analyze why. Was your call-to-contact rate lower than expected? 
                Did prospects not show up? Adjust your activity levels accordingly.
              </p>
            </div>

            <div className="bg-gradient-to-r from-yellow-900/40 to-yellow-700/40 border-2 border-yellow-400 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">Week 4: Review and Scale</h3>
              <p className="text-gray-200 text-lg leading-relaxed">
                At the end of the month, review your results. Did you hit your revenue target? If yes, increase your target. 
                If no, identify the bottleneck and fix it. Then repeat the cycle.
              </p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-gradient-to-r from-brand-lime to-green-500 rounded-2xl p-12 text-center shadow-2xl">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
            Stop Hoping. Start Engineering.
          </h2>
          <p className="text-2xl text-gray-800 font-bold mb-8">
            Your revenue is not a mystery. It's math. And now you have the formula.
          </p>
          <p className="text-xl text-gray-900">
            Track your progress in the <span className="font-black">EOD Report</span> and watch your revenue grow.
          </p>
        </div>

      </div>
    </div>
  );
}
