import React, { useState } from 'react';
import {
  calculateTargets,
  getDefaultInputs,
  validateInputs,
  formatCurrency,
  formatNumber,
  type CalculatorInputs,
  type CalculatedTargets,
} from '../services/salesTargetCalculatorService';
import { saveUserTargets, type UserTargets } from '../services/targetsService';
import { supabase } from '../src/services/supabaseClient';

export default function MassiveActionTargetsPage() {
  // Start with good default numbers
  const [inputs, setInputs] = useState<CalculatorInputs>(getDefaultInputs());
  const [showResults, setShowResults] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [planAdopted, setPlanAdopted] = useState(false);
  const [adoptionLoading, setAdoptionLoading] = useState(false);

  // Update a single input field
  const updateInput = (field: keyof CalculatorInputs, value: string) => {
    const numValue = parseFloat(value) || 0;
    setInputs({ ...inputs, [field]: numValue });
  };

  // Calculate targets when user clicks button
  const handleCalculate = () => {
    const validationErrors = validateInputs(inputs);
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setShowResults(false);
    } else {
      setErrors([]);
      setShowResults(true);
      setPlanAdopted(false); // Reset adoption status when recalculating
    }
  };

  // Adopt the plan and save to database
  const handleAdoptPlan = async () => {
    if (!targets) return;
    
    setAdoptionLoading(true);
    
    try {
      // Get user info from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Get company_id from user metadata
      const companyId = user.user_metadata?.company_id || '';
      
      // Convert calculated targets to UserTargets format
      const userTargets: UserTargets = {
        user_id: user.id,
        company_id: companyId,
        annual_revenue: Math.round(inputs.annualRevenueGoal),
        avg_sale_amount: Math.round(inputs.averageDealSize),
        close_rate: inputs.oppToCloseRate,
        show_rate: inputs.leadToOppRate,
        contact_to_appt_rate: inputs.leadToOppRate,
        call_to_contact_rate: inputs.leadToOppRate,
        daily_calls: Math.ceil(targets.daily.calls),
        daily_contacts: Math.ceil(targets.daily.leads),
        daily_appts: Math.ceil(targets.daily.opportunities),
        daily_demos: Math.ceil(targets.daily.deals),
        daily_deals: Math.ceil(targets.daily.deals),
        daily_revenue: Math.round(targets.daily.revenue),
        weekly_revenue: Math.round(targets.weekly.revenue),
      };
      
      await saveUserTargets(userTargets);
      setPlanAdopted(true);
      
      // Show success message
      setTimeout(() => {
        alert('✅ Success! Your daily plan is now active.\n\nYou can see it on your Prospecting Page.');
      }, 300);
    } catch (error) {
      console.error('Error adopting plan:', error);
      alert('❌ Failed to save your plan. Please try again.');
    } finally {
      setAdoptionLoading(false);
    }
  };

  // Get the calculated results
  const targets: CalculatedTargets | null = errors.length === 0 ? calculateTargets(inputs) : null;

  // Check if all required fields are filled
  const hasRequiredInputs = 
    inputs.annualRevenueGoal > 0 && 
    inputs.averageDealSize > 0 &&
    inputs.workingDaysPerYear > 0;

  return (
    <div className="min-h-screen bg-brand-ink text-white p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-brand-lime mb-2">
            💰 Turn Your Money Goal Into a Daily Plan
          </h1>
          <p className="text-gray-400 text-lg">
            Answer a few simple questions and we'll tell you exactly what to do every day
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Calculator */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Step 1: Your Money Goal */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-brand-lime text-gray-900 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <h2 className="text-2xl font-bold text-white">Your Money Goal</h2>
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
                      value={inputs.annualRevenueGoal || ''}
                      onChange={(e) => updateInput('annualRevenueGoal', e.target.value)}
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
                      value={inputs.averageDealSize || ''}
                      onChange={(e) => updateInput('averageDealSize', e.target.value)}
                      className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 pl-8 text-white focus:outline-none focus:border-brand-lime"
                      placeholder="5000"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Example: $5,000 per customer</p>
                </div>
              </div>
            </div>

            {/* Step 2: Your Time */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-brand-lime text-gray-900 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <h2 className="text-2xl font-bold text-white">Your Time</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    How many days will you work this year?
                  </label>
                  <input
                    type="number"
                    value={inputs.workingDaysPerYear || ''}
                    onChange={(e) => updateInput('workingDaysPerYear', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-brand-lime"
                    placeholder="250"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Usually 250 days (5 days × 50 weeks)
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    How many days does it take to close a sale?
                  </label>
                  <input
                    type="number"
                    value={inputs.salesCycleDays || ''}
                    onChange={(e) => updateInput('salesCycleDays', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-brand-lime"
                    placeholder="30"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    From first call to money in the bank
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3: Your Success Rates */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-brand-lime text-gray-900 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <h2 className="text-2xl font-bold text-white">Your Success Rates</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Out of 100 leads, how many become real opportunities?
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={inputs.leadToOppRate || ''}
                      onChange={(e) => updateInput('leadToOppRate', e.target.value)}
                      className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 pr-10 text-white focus:outline-none focus:border-brand-lime"
                      placeholder="25"
                    />
                    <span className="absolute right-3 top-3 text-gray-400">%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Example: 25 out of 100 = 25%
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Out of 100 opportunities, how many buy?
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={inputs.oppToCloseRate || ''}
                      onChange={(e) => updateInput('oppToCloseRate', e.target.value)}
                      className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 pr-10 text-white focus:outline-none focus:border-brand-lime"
                      placeholder="25"
                    />
                    <span className="absolute right-3 top-3 text-gray-400">%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Example: 25 out of 100 = 25%
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4: Your Activities */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-brand-lime text-gray-900 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                  4
                </div>
                <h2 className="text-2xl font-bold text-white">Your Activities</h2>
              </div>
              
              <p className="text-sm text-gray-400 mb-4">
                For each lead, how many times do you...
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    📞 Call them?
                  </label>
                  <input
                    type="number"
                    value={inputs.callsPerLead || ''}
                    onChange={(e) => updateInput('callsPerLead', e.target.value)}
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
                    value={inputs.emailsPerLead || ''}
                    onChange={(e) => updateInput('emailsPerLead', e.target.value)}
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
                    value={inputs.textsPerLead || ''}
                    onChange={(e) => updateInput('textsPerLead', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-brand-lime"
                    placeholder="2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Usually 2 texts</p>
                </div>
              </div>
            </div>

            {/* Calculate Button */}
            <div className="bg-gradient-to-r from-brand-lime to-green-400 rounded-lg p-1">
              <button
                onClick={handleCalculate}
                disabled={!hasRequiredInputs}
                className={`w-full py-4 px-6 rounded-lg font-bold text-xl transition-all ${
                  hasRequiredInputs
                    ? 'bg-gray-900 text-brand-lime hover:bg-gray-800 cursor-pointer'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                {hasRequiredInputs ? '🎯 Show Me My Daily Plan' : '⬆️ Fill in the boxes above'}
              </button>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                <h3 className="text-red-400 font-bold mb-2">⚠️ Fix These Problems:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, i) => (
                    <li key={i} className="text-red-300 text-sm">{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Results */}
            {showResults && targets && (
              <div className="space-y-6">
                
                {/* Daily Plan - Most Important! */}
                <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-lg p-6 border-4 border-brand-lime shadow-2xl">
                  <h2 className="text-3xl font-black text-brand-lime mb-2 text-center">
                    📋 YOUR DAILY PLAN
                  </h2>
                  <p className="text-center text-gray-300 mb-6">
                    Do this EVERY DAY to hit your goal
                  </p>
                  
                  {/* Activity Section */}
                  <div className="bg-gray-900/80 rounded-lg p-6 mb-4">
                    <h3 className="text-xl font-bold text-yellow-400 mb-4">
                      ⚡ ACTIVITY (What to do in the morning)
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500">
                        <div className="text-5xl font-black text-brand-lime mb-2">
                          {targets.daily.calls}
                        </div>
                        <div className="text-sm text-gray-300">📞 Calls to Make</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-purple-500">
                        <div className="text-5xl font-black text-brand-lime mb-2">
                          {targets.daily.emails}
                        </div>
                        <div className="text-sm text-gray-300">📧 Emails to Send</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-pink-500">
                        <div className="text-5xl font-black text-brand-lime mb-2">
                          {targets.daily.texts}
                        </div>
                        <div className="text-sm text-gray-300">💬 Texts to Send</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-cyan-500">
                        <div className="text-5xl font-black text-brand-lime mb-2">
                          {targets.daily.leads}
                        </div>
                        <div className="text-sm text-gray-300">🎯 New Leads</div>
                      </div>
                    </div>
                  </div>

                  {/* Pipeline Section */}
                  <div className="bg-gray-900/80 rounded-lg p-6 mb-4">
                    <h3 className="text-xl font-bold text-blue-400 mb-4">
                      📊 PIPELINE (What you're building)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-green-500">
                        <div className="text-5xl font-black text-brand-lime mb-2">
                          {targets.daily.opportunities}
                        </div>
                        <div className="text-sm text-gray-300">✨ New Opportunities</div>
                        <div className="text-xs text-gray-500 mt-1">
                          People who are ready to buy
                        </div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-yellow-500">
                        <div className="text-5xl font-black text-brand-lime mb-2">
                          {formatCurrency(targets.pipeline.requiredPipelineValue)}
                        </div>
                        <div className="text-sm text-gray-300">💼 Total Pipeline Needed</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {targets.pipeline.coverageRatio}x your annual goal
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Results Section */}
                  <div className="bg-gray-900/80 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-green-400 mb-4">
                      💰 RESULTS (What you'll make)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-red-500">
                        <div className="text-5xl font-black text-brand-lime mb-2">
                          {targets.daily.deals.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-300">🎉 Sales to Close</div>
                        <div className="text-xs text-gray-500 mt-1">
                          About {Math.ceil(targets.daily.deals)} per day
                        </div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-green-500">
                        <div className="text-5xl font-black text-brand-lime mb-2">
                          {formatCurrency(targets.daily.revenue)}
                        </div>
                        <div className="text-sm text-gray-300">💵 Money to Make</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Every single day
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weekly & Monthly Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Weekly */}
                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4">📅 This Week</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Money to make:</span>
                        <span className="text-brand-lime font-bold text-lg">
                          {formatCurrency(targets.weekly.revenue)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Sales to close:</span>
                        <span className="text-white font-bold">{targets.weekly.deals}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Leads to add:</span>
                        <span className="text-white font-bold">{targets.weekly.leads}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total calls:</span>
                        <span className="text-white font-bold">{targets.daily.calls * 5}</span>
                      </div>
                    </div>
                  </div>

                  {/* Monthly */}
                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4">📆 This Month</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Money to make:</span>
                        <span className="text-brand-lime font-bold text-lg">
                          {formatCurrency(targets.monthly.revenue)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Sales to close:</span>
                        <span className="text-white font-bold">{targets.monthly.deals}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Leads to add:</span>
                        <span className="text-white font-bold">{targets.monthly.leads}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total calls:</span>
                        <span className="text-white font-bold">{targets.daily.calls * 21}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* The Big Picture */}
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-xl font-bold text-white mb-4">🎯 The Big Picture</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-black text-brand-lime mb-1">
                        {formatNumber(targets.annual.leadsNeeded)}
                      </div>
                      <div className="text-xs text-gray-400">Total Leads Needed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-black text-brand-lime mb-1">
                        {formatNumber(targets.annual.opportunitiesNeeded)}
                      </div>
                      <div className="text-xs text-gray-400">Total Opportunities</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-black text-brand-lime mb-1">
                        {formatNumber(targets.annual.dealsNeeded)}
                      </div>
                      <div className="text-xs text-gray-400">Total Sales</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-black text-brand-lime mb-1">
                        {formatCurrency(targets.annual.revenue)}
                      </div>
                      <div className="text-xs text-gray-400">Your Goal!</div>
                    </div>
                  </div>
                </div>

                {/* Reality Check */}
                <div className="bg-red-900/20 border-2 border-red-500/50 rounded-lg p-6">
                  <h3 className="text-2xl font-bold text-red-400 mb-3">⚡ The Truth</h3>
                  <p className="text-white text-lg mb-3">
                    To make <span className="text-brand-lime font-bold">{formatCurrency(inputs.annualRevenueGoal)}</span> this year, 
                    you need to make <span className="text-brand-lime font-bold">{targets.daily.calls} calls</span> and 
                    add <span className="text-brand-lime font-bold">{targets.daily.leads} new leads</span> EVERY DAY.
                  </p>
                  <p className="text-gray-300">
                    Are you doing that now? If not, you won't hit your goal. It's that simple.
                  </p>
                </div>

                {/* Adopt Plan Button */}
                <div className="bg-gradient-to-r from-brand-lime/10 to-green-500/10 border-2 border-brand-lime rounded-lg p-8 text-center">
                  <h3 className="text-2xl font-bold text-white mb-3">🎯 Ready to Commit?</h3>
                  <p className="text-gray-300 mb-6">
                    Click below to adopt this plan. It will show up on your Prospecting Page every day as your committed daily targets.
                  </p>
                  <button
                    onClick={handleAdoptPlan}
                    disabled={adoptionLoading || planAdopted}
                    className={`px-8 py-4 rounded-lg font-bold text-xl transition-all ${
                      planAdopted
                        ? 'bg-green-600 text-white cursor-default'
                        : adoptionLoading
                        ? 'bg-gray-700 text-gray-400 cursor-wait'
                        : 'bg-brand-lime text-gray-900 hover:bg-green-400 cursor-pointer shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {adoptionLoading ? (
                      '⏳ Saving Your Plan...'
                    ) : planAdopted ? (
                      '✅ Plan Adopted!'
                    ) : (
                      '🚀 Adopt This Plan'
                    )}
                  </button>
                  {planAdopted && (
                    <p className="text-green-400 mt-4 text-sm">
                      ✓ Success! Your plan is now active on the Prospecting Page.
                    </p>
                  )}
                </div>

              </div>
            )}

          </div>

          {/* Right Column - Help Cards */}
          <div className="space-y-6">
            
            {/* Why This Works */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-brand-lime mb-3">✨ Why This Works</h3>
              <p className="text-sm text-gray-300 mb-3">
                We use simple math to work backward from your goal.
              </p>
              <p className="text-sm text-gray-300 mb-3">
                <strong className="text-white">Your Goal ÷ Price = Sales Needed</strong>
              </p>
              <p className="text-sm text-gray-300">
                Then we figure out how many calls, emails, and leads you need to get those sales.
              </p>
            </div>

            {/* How to Use This */}
            <div className="bg-brand-lime/10 border border-brand-lime/30 rounded-lg p-6">
              <h3 className="text-lg font-bold text-brand-lime mb-3">💡 What To Do Now</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-2">
                  <span className="text-brand-lime font-bold">1.</span>
                  <span>Take a screenshot of your daily plan</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-brand-lime font-bold">2.</span>
                  <span>Do these activities EVERY morning</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-brand-lime font-bold">3.</span>
                  <span>Track your numbers in the EOD Report</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-brand-lime font-bold">4.</span>
                  <span>Check every Friday - are you on track?</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-3">💪 Pro Tips</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <p>
                  <strong className="text-brand-lime">Do calls first:</strong> Make all your calls before lunch. Don't check email first.
                </p>
                <p>
                  <strong className="text-brand-lime">Track everything:</strong> Write down every call, email, and text. Numbers don't lie.
                </p>
                <p>
                  <strong className="text-brand-lime">Adjust as you go:</strong> If your close rate gets better, come back and update these numbers.
                </p>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-yellow-400 mb-3">⚠️ Important</h3>
              <p className="text-sm text-gray-300">
                These numbers are based on YOUR conversion rates. If you don't know your real numbers, 
                start tracking today and come back to update this calculator in 30 days.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
