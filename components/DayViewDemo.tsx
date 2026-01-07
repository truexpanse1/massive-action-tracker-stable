import React from 'react';

export default function DayViewDemo() {
  return (
    <div className="space-y-6">
      {/* Demo Title */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-black text-gray-900 mb-2">
          Your Complete Daily Command Center
        </h3>
        <p className="text-lg text-gray-600">
          Everything you need to crush your goals - all in one view
        </p>
      </div>

      {/* Visual Walkthrough */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 border-2 border-blue-200">
        <div className="space-y-6">
          {/* Speed of Implementation */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-black">
                1
              </div>
              <h4 className="text-xl font-black text-gray-900">⚡ Speed of Implementation</h4>
            </div>
            <p className="text-gray-700 mb-4">
              Your Top 6 Daily Targets - the most important actions that will move the needle TODAY.
            </p>
            <div className="bg-purple-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-5 h-5" />
                <span className="text-gray-700">📞 Call 20 prospects from hot list</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-5 h-5" />
                <span className="text-gray-700">✍️ Send 5 personalized follow-up emails</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-5 h-5" />
                <span className="text-gray-700">🎯 Schedule 3 demos for next week</span>
              </div>
            </div>
          </div>

          {/* Daily Follow-Ups */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black">
                2
              </div>
              <h4 className="text-xl font-black text-gray-900">📋 Daily Follow-Ups</h4>
            </div>
            <p className="text-gray-700 mb-4">
              Never lose a lead again. Automatically rolls forward uncompleted items to tomorrow.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">🔥 Sarah Johnson - Demo scheduled</span>
                <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">HOT</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">📧 Mike Chen - Proposal sent</span>
                <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded">WARM</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">📞 Alex Rivera - Left voicemail</span>
                <span className="text-xs bg-gray-500 text-white px-2 py-1 rounded">COLD</span>
              </div>
            </div>
          </div>

          {/* Activity Tracking */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-black">
                3
              </div>
              <h4 className="text-xl font-black text-gray-900">📊 6 Critical KPIs</h4>
            </div>
            <p className="text-gray-700 mb-4">
              Track the activities that directly lead to revenue - calls, talks, meetings, demos, closes.
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-black text-green-600">15/20</div>
                <div className="text-xs text-gray-600">Calls</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-black text-blue-600">8/10</div>
                <div className="text-xs text-gray-600">Talks</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-black text-purple-600">3/5</div>
                <div className="text-xs text-gray-600">Meetings</div>
              </div>
            </div>
          </div>

          {/* EOD Report */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-black">
                4
              </div>
              <h4 className="text-xl font-black text-gray-900">📝 End of Day Report</h4>
            </div>
            <p className="text-gray-700 mb-4">
              Daily reflection + full KPI summary. Know exactly where you stand and what to improve tomorrow.
            </p>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-sm text-gray-700 italic">
                "Today was productive! Hit 15/20 calls and closed 2 deals. Tomorrow I'll focus on getting more meetings scheduled early in the day."
              </div>
              <div className="mt-3 flex gap-2">
                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">2 Closes</span>
                <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">$12,500 Revenue</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Use Case Example */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h4 className="text-xl font-black mb-3">💡 Real-World Example</h4>
        <p className="text-blue-100 mb-4">
          <strong className="text-white">Sarah, a B2B sales rep,</strong> starts her day by opening MAT's Day View. She sees her Top 6 targets, 8 follow-ups from yesterday (automatically rolled forward), and her activity goals (20 calls, 10 talks, 5 meetings).
        </p>
        <p className="text-blue-100 mb-4">
          By 3 PM, she's completed 4/6 targets and is at 18/20 calls. She can see exactly what she needs to do to hit her goal. At 5 PM, she writes her EOD report: "Crushed it today! 22 calls, 12 talks, 6 meetings, 2 closes. Tomorrow: focus on following up with hot leads."
        </p>
        <p className="text-white font-bold">
          Result: Sarah knows exactly where she stands every single day. No guessing, no overwhelm, just massive action.
        </p>
      </div>
    </div>
  );
}
