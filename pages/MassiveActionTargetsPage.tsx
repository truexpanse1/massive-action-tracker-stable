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
      weeklyRevenue: weeklyRevenue.toFixed(2),
      dailyRevenue: dailyRevenue.toFixed(2),
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
    <div className="min-h-screen bg-brand-ink text-brand-cream p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-brand-lime mb-4">
            Massive Action Targets
          </h1>
          <p className="text-xl text-brand-cream/80">
            The Revenue Engineering System
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-brand-cream/5 border border-brand-lime/20 rounded-lg p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold text-brand-lime mb-4">Why Targets Are Non-Negotiable</h2>
          <p className="text-brand-cream/90 mb-4">
            Most salespeople fail not because they lack skill, but because they lack a <strong>target</strong>. Without a clear, measurable target, you are flying blind. You might be busy, but you are not building. Targets are the difference between activity and achievement.
          </p>
          <p className="text-brand-cream/90 mb-4">
            Here is the truth: <strong className="text-brand-lime">Targets drive everything forward.</strong> They set the vision for where you are going, provide the inspiration to get there, and establish the accountability to ensure you actually arrive. Without targets, you are just hoping for success. With targets, you are engineering it.
          </p>
        </div>

        {/* The Three-Part Target System */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-brand-lime mb-6">The Three-Part Target System</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-brand-cream/5 border border-brand-lime/20 rounded-lg p-6">
              <div className="text-4xl font-black text-brand-lime mb-3">1</div>
              <h3 className="text-xl font-bold text-brand-cream mb-3">Revenue Targets</h3>
              <p className="text-brand-cream/80">
                This is the number that matters most. How much money do you need to generate? Start with your annual revenue goal, then break it down into weekly and daily targets.
              </p>
            </div>
            <div className="bg-brand-cream/5 border border-brand-lime/20 rounded-lg p-6">
              <div className="text-4xl font-black text-brand-lime mb-3">2</div>
              <h3 className="text-xl font-bold text-brand-cream mb-3">Activity Targets</h3>
              <p className="text-brand-cream/80">
                Revenue does not happen by accident. It happens because you made enough calls, set enough appointments, and delivered enough presentations.
              </p>
            </div>
            <div className="bg-brand-cream/5 border border-brand-lime/20 rounded-lg p-6">
              <div className="text-4xl font-black text-brand-lime mb-3">3</div>
              <h3 className="text-xl font-bold text-brand-cream mb-3">People Targets</h3>
              <p className="text-brand-cream/80">
                You cannot scale alone. This includes prospects, referral partners, and strategic relationships. The bigger your revenue target, the more people you need in your pipeline.
              </p>
            </div>
          </div>
        </div>

        {/* The Fatal Mistake */}
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold text-red-400 mb-4">The Fatal Mistake: Setting Targets Too Low</h2>
          <p className="text-brand-cream/90 mb-4">
            The biggest mistake salespeople make with targets is not that they miss them—it is that they set them <strong>too low</strong> in the first place. Low targets create low thinking. They do not force you to innovate, hustle, or think strategically. They let you stay comfortable.
          </p>
          <p className="text-brand-cream/90">
            Massive targets, on the other hand, force you to think differently. They require you to ask better questions: "How can I reach more people?" "How can I close faster?" "What systems do I need to build?" <strong className="text-brand-lime">A massive target will drive the level of thinking required to actually impact revenue.</strong>
          </p>
        </div>

        {/* The Math Behind Massive Action */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-brand-lime mb-6">The Math Behind Massive Action</h2>
          <p className="text-brand-cream/90 mb-6">
            Hitting your revenue target is not about luck or motivation. It is about <strong>math</strong>. If you know your numbers, you can reverse-engineer exactly what you need to do every single day to hit your goals.
          </p>

          {/* Calculator Section */}
          <div className="bg-brand-cream/5 border border-brand-lime/20 rounded-lg p-6 md:p-8">
            <h3 className="text-2xl font-bold text-brand-lime mb-6">Your Target Calculator</h3>
            
            {/* Input Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-brand-cream font-semibold mb-2">Annual Revenue Target ($)</label>
                <input
                  type="number"
                  value={annualRevenue}
                  onChange={(e) => setAnnualRevenue(e.target.value)}
                  className="w-full bg-brand-ink border border-brand-lime/30 rounded px-4 py-3 text-brand-cream focus:outline-none focus:border-brand-lime"
                  placeholder="e.g., 500000"
                />
              </div>
              <div>
                <label className="block text-brand-cream font-semibold mb-2">Average Sale Amount ($)</label>
                <input
                  type="number"
                  value={avgSaleAmount}
                  onChange={(e) => setAvgSaleAmount(e.target.value)}
                  className="w-full bg-brand-ink border border-brand-lime/30 rounded px-4 py-3 text-brand-cream focus:outline-none focus:border-brand-lime"
                  placeholder="e.g., 5000"
                />
              </div>
              <div>
                <label className="block text-brand-cream font-semibold mb-2">Close Rate (%)</label>
                <input
                  type="number"
                  value={closeRate}
                  onChange={(e) => setCloseRate(e.target.value)}
                  className="w-full bg-brand-ink border border-brand-lime/30 rounded px-4 py-3 text-brand-cream focus:outline-none focus:border-brand-lime"
                  placeholder="e.g., 30"
                />
                <p className="text-brand-cream/60 text-sm mt-1">How many presentations to close 1 deal?</p>
              </div>
              <div>
                <label className="block text-brand-cream font-semibold mb-2">Appointment Show Rate (%)</label>
                <input
                  type="number"
                  value={showRate}
                  onChange={(e) => setShowRate(e.target.value)}
                  className="w-full bg-brand-ink border border-brand-lime/30 rounded px-4 py-3 text-brand-cream focus:outline-none focus:border-brand-lime"
                  placeholder="e.g., 70"
                />
                <p className="text-brand-cream/60 text-sm mt-1">How many appointments to get 1 show-up?</p>
              </div>
              <div>
                <label className="block text-brand-cream font-semibold mb-2">Contact-to-Appointment Rate (%)</label>
                <input
                  type="number"
                  value={contactToApptRate}
                  onChange={(e) => setContactToApptRate(e.target.value)}
                  className="w-full bg-brand-ink border border-brand-lime/30 rounded px-4 py-3 text-brand-cream focus:outline-none focus:border-brand-lime"
                  placeholder="e.g., 40"
                />
                <p className="text-brand-cream/60 text-sm mt-1">How many contacts to set 1 appointment?</p>
              </div>
              <div>
                <label className="block text-brand-cream font-semibold mb-2">Call-to-Contact Rate (%)</label>
                <input
                  type="number"
                  value={callToContactRate}
                  onChange={(e) => setCallToContactRate(e.target.value)}
                  className="w-full bg-brand-ink border border-brand-lime/30 rounded px-4 py-3 text-brand-cream focus:outline-none focus:border-brand-lime"
                  placeholder="e.g., 25"
                />
                <p className="text-brand-cream/60 text-sm mt-1">How many calls to have 1 conversation?</p>
              </div>
            </div>

            {/* Results */}
            {hasInputs && (
              <div className="border-t border-brand-lime/20 pt-8">
                <h4 className="text-xl font-bold text-brand-lime mb-6">Your Daily Action Plan</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-brand-ink border border-brand-lime/30 rounded-lg p-4">
                    <div className="text-brand-cream/60 text-sm mb-1">Weekly Revenue</div>
                    <div className="text-2xl font-bold text-brand-lime">${targets.weeklyRevenue}</div>
                  </div>
                  <div className="bg-brand-ink border border-brand-lime/30 rounded-lg p-4">
                    <div className="text-brand-cream/60 text-sm mb-1">Daily Revenue</div>
                    <div className="text-2xl font-bold text-brand-lime">${targets.dailyRevenue}</div>
                  </div>
                  <div className="bg-brand-ink border border-brand-lime/30 rounded-lg p-4">
                    <div className="text-brand-cream/60 text-sm mb-1">Daily Deals</div>
                    <div className="text-2xl font-bold text-brand-lime">{targets.dailyDeals}</div>
                  </div>
                  <div className="bg-brand-ink border border-brand-lime/30 rounded-lg p-4">
                    <div className="text-brand-cream/60 text-sm mb-1">Daily Demos</div>
                    <div className="text-2xl font-bold text-brand-lime">{targets.dailyDemos}</div>
                  </div>
                  <div className="bg-brand-ink border border-brand-lime/30 rounded-lg p-4">
                    <div className="text-brand-cream/60 text-sm mb-1">Daily Appointments</div>
                    <div className="text-2xl font-bold text-brand-lime">{targets.dailyAppts}</div>
                  </div>
                  <div className="bg-brand-ink border border-brand-lime/30 rounded-lg p-4">
                    <div className="text-brand-cream/60 text-sm mb-1">Daily Contacts</div>
                    <div className="text-2xl font-bold text-brand-lime">{targets.dailyContacts}</div>
                  </div>
                  <div className="bg-brand-ink border border-brand-lime/30 rounded-lg p-4 md:col-span-2">
                    <div className="text-brand-cream/60 text-sm mb-1">Daily Calls Required</div>
                    <div className="text-3xl font-bold text-brand-lime">{targets.dailyCalls}</div>
                  </div>
                </div>

                <div className="mt-6 bg-brand-lime/10 border border-brand-lime/30 rounded-lg p-4">
                  <p className="text-brand-cream/90">
                    <strong className="text-brand-lime">Your Daily Mission:</strong> Make <strong>{targets.dailyCalls} calls</strong> to generate <strong>{targets.dailyContacts} contacts</strong>, set <strong>{targets.dailyAppts} appointments</strong>, deliver <strong>{targets.dailyDemos} demos</strong>, and close <strong>{targets.dailyDeals} deals</strong> to hit your daily revenue target of <strong>${targets.dailyRevenue}</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Implementation Guide */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-brand-lime mb-6">Implementation: Your Next 30 Days</h2>
          <div className="space-y-4">
            <div className="bg-brand-cream/5 border border-brand-lime/20 rounded-lg p-6">
              <h3 className="text-xl font-bold text-brand-lime mb-3">Week 1: Baseline Your Numbers</h3>
              <p className="text-brand-cream/90">
                If you do not already know your core metrics (close rate, show rate, etc.), spend this week tracking everything. Log every call, every contact, every appointment, and every deal. By the end of the week, you will have your baseline numbers.
              </p>
            </div>
            <div className="bg-brand-cream/5 border border-brand-lime/20 rounded-lg p-6">
              <h3 className="text-xl font-bold text-brand-lime mb-3">Week 2: Set Your Targets</h3>
              <p className="text-brand-cream/90">
                Using the calculator above, calculate your daily and weekly activity targets. Write them down. Post them somewhere visible. Share them with your coach or accountability partner. Make them real.
              </p>
            </div>
            <div className="bg-brand-cream/5 border border-brand-lime/20 rounded-lg p-6">
              <h3 className="text-xl font-bold text-brand-lime mb-3">Week 3: Execute and Adjust</h3>
              <p className="text-brand-cream/90">
                Hit your daily targets. Every single day. If you fall short, analyze why. Was your call-to-contact rate lower than expected? Did appointments not show up? Adjust your activity levels accordingly.
              </p>
            </div>
            <div className="bg-brand-cream/5 border border-brand-lime/20 rounded-lg p-6">
              <h3 className="text-xl font-bold text-brand-lime mb-3">Week 4: Review and Scale</h3>
              <p className="text-brand-cream/90">
                At the end of 30 days, review your results. Did you hit your revenue target? If yes, raise your target. If no, identify the bottleneck. Was it activity (not enough calls)? Or conversion (not enough deals closed)? Fix the bottleneck and run it again.
              </p>
            </div>
          </div>
        </div>

        {/* The MAT Advantage */}
        <div className="bg-gradient-to-r from-brand-lime/10 to-brand-lime/5 border border-brand-lime/30 rounded-lg p-6 md:p-8">
          <h2 className="text-2xl font-bold text-brand-lime mb-4">The MAT Advantage</h2>
          <p className="text-brand-cream/90 mb-4">
            The Massive Action Tracker is not just a CRM. It is a <strong>revenue engineering system</strong>. It takes the guesswork out of sales and replaces it with data, accountability, and daily execution.
          </p>
          <p className="text-brand-cream/90">
            When you use the MAT platform, you are not just tracking your activities—you are tracking your progress toward your targets. You see in real-time whether you are on track or falling behind. And you get the daily accountability you need to stay focused.
          </p>
          <p className="text-brand-lime font-bold mt-4 text-lg">
            Targets drive everything forward. The MAT platform ensures you hit them.
          </p>
        </div>
      </div>
    </div>
  );
}
