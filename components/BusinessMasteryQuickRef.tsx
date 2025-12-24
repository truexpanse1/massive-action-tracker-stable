import React, { useState } from 'react';

interface BusinessMasteryQuickRefProps {}

const topics = [
  'Handling Objections',
  'Cold Calling Scripts',
  'Follow-Up Strategies',
  'Closing Techniques',
  'Prospecting Methods',
  'Email Templates',
  'LinkedIn Outreach',
  'Referral Requests',
  'Negotiation Tactics',
  'Time Management',
  'Goal Setting (10X)',
  'Content Marketing Basics',
];

const topicContent: Record<string, { summary: string; keyPoints: string[]; quickTips: string[] }> = {
  'Handling Objections': {
    summary: 'Turn objections into opportunities by listening, acknowledging, and reframing.',
    keyPoints: [
      'Listen fully before responding',
      'Use Feel-Felt-Found technique',
      'Isolate the objection: "Is that the only thing?"',
      'Never argue - acknowledge and pivot',
    ],
    quickTips: [
      '"I understand how you feel. Others felt the same way until they found..."',
      '"If we could solve [objection], would you move forward today?"',
      '"What would need to happen for this to be a yes?"',
    ],
  },
  'Cold Calling Scripts': {
    summary: 'Break through gatekeepers and get decision-makers on the phone.',
    keyPoints: [
      'Hook them in the first 10 seconds',
      'Use pattern interrupts',
      'Ask permission to continue',
      'Focus on their problem, not your solution',
    ],
    quickTips: [
      '"Hi [Name], this is [You] - did I catch you at a bad time?" (Pattern interrupt)',
      '"I help [industry] companies solve [problem]. Worth 27 seconds?"',
      '"Most [role] I talk to struggle with [pain point]. Sound familiar?"',
    ],
  },
  'Follow-Up Strategies': {
    summary: 'Most sales happen after the 5th follow-up. Persistence wins.',
    keyPoints: [
      '80% of sales require 5+ follow-ups',
      'Use multiple channels (email, phone, text, LinkedIn)',
      'Add value in every touch',
      'Set clear next steps',
    ],
    quickTips: [
      'Day 1: Thank you + recap',
      'Day 3: Share relevant case study or article',
      'Day 7: Check-in with new insight',
      'Day 14: "Should I close your file?" (urgency)',
    ],
  },
  'Closing Techniques': {
    summary: 'Ask for the sale confidently and handle final hesitations.',
    keyPoints: [
      'Assumptive close: Act like they already said yes',
      'Alternative close: "Would you prefer A or B?"',
      'Urgency close: "This offer expires..."',
      'Direct close: "Are you ready to move forward?"',
    ],
    quickTips: [
      '"Let\'s get you started - what\'s the best email for the invoice?"',
      '"Would Monday or Wednesday work better for onboarding?"',
      '"If not now, when? Let\'s lock in your spot."',
    ],
  },
  'Prospecting Methods': {
    summary: 'Fill your pipeline with qualified leads every single day.',
    keyPoints: [
      'Dedicate 1-2 hours daily to prospecting',
      'Use the 3-2-1 method: 3 calls, 2 emails, 1 social touch per prospect',
      'Target your ideal customer profile',
      'Track everything in your CRM',
    ],
    quickTips: [
      'LinkedIn: Comment on 10 posts, send 5 connection requests daily',
      'Referrals: Ask every happy client for 3 introductions',
      'Networking: Attend 1 event per week',
    ],
  },
  'Email Templates': {
    summary: 'Pre-written emails that get responses and move deals forward.',
    keyPoints: [
      'Subject line: Short, curiosity-driven',
      'Body: 3-5 sentences max',
      'One clear call-to-action',
      'Personalize the first line',
    ],
    quickTips: [
      'Subject: "Quick question, [Name]"',
      'Body: "Hi [Name], I noticed [specific detail]. I help [industry] with [problem]. Worth a 15-min call? [Link to calendar]"',
      'Follow-up: "Hi [Name], following up on my email below. Still interested?"',
    ],
  },
  'LinkedIn Outreach': {
    summary: 'Build relationships and generate leads on LinkedIn.',
    keyPoints: [
      'Personalize connection requests',
      'Comment before you connect',
      'Don\'t pitch immediately after connecting',
      'Share valuable content regularly',
    ],
    quickTips: [
      'Connection request: "Hi [Name], I see we\'re both in [industry]. Would love to connect!"',
      'First message: "Thanks for connecting! What\'s your biggest challenge with [topic] right now?"',
      'Value-add: Share article or insight related to their industry',
    ],
  },
  'Referral Requests': {
    summary: 'Turn happy clients into your best salespeople.',
    keyPoints: [
      'Ask at the peak of satisfaction',
      'Make it easy: "Who else do you know who..."',
      'Offer incentives (if appropriate)',
      'Follow up and thank them',
    ],
    quickTips: [
      '"I\'m so glad this is working for you! Who else in your network could benefit?"',
      '"Can you introduce me to 3 people who might need this?"',
      '"Would you mind writing a quick LinkedIn recommendation?"',
    ],
  },
  'Negotiation Tactics': {
    summary: 'Protect your value while finding win-win solutions.',
    keyPoints: [
      'Anchor high: Start with your full price',
      'Never discount without getting something in return',
      'Use silence as a weapon',
      'Walk away if needed',
    ],
    quickTips: [
      '"Our standard rate is $X. What budget did you have in mind?"',
      '"I can offer a discount if you commit to a 12-month contract."',
      '"I understand. Let me know if your budget changes."',
    ],
  },
  'Time Management': {
    summary: 'Maximize productivity by prioritizing high-impact activities.',
    keyPoints: [
      'Time-block your calendar',
      'Batch similar tasks',
      'Eliminate distractions during focus time',
      'Review your day every evening',
    ],
    quickTips: [
      'Morning: Prospecting and outreach (8-10am)',
      'Midday: Meetings and calls (10am-2pm)',
      'Afternoon: Follow-ups and admin (2-4pm)',
      'Use the 2-minute rule: If it takes <2 min, do it now',
    ],
  },
  'Goal Setting (10X)': {
    summary: 'Set massive goals and take massive action to achieve them.',
    keyPoints: [
      'Think 10X bigger than you normally would',
      'Break big goals into daily actions',
      'Track progress obsessively',
      'Adjust tactics, never the goal',
    ],
    quickTips: [
      'Annual goal: $1M revenue → Daily goal: $2,740',
      'Write your #1 goal on a card and read it 2x daily',
      'Ask: "What would I do if I had to 10X this result?"',
    ],
  },
  'Content Marketing Basics': {
    summary: 'Attract and educate prospects with valuable content.',
    keyPoints: [
      'Focus on solving problems, not selling',
      'Use the 80/20 rule: 80% value, 20% promotion',
      'Repurpose content across platforms',
      'Post consistently (daily if possible)',
    ],
    quickTips: [
      'LinkedIn: Share 1 post daily (tips, stories, insights)',
      'Email: Weekly newsletter with 1 key lesson',
      'Video: Record yourself answering common questions',
    ],
  },
};

const BusinessMasteryQuickRef: React.FC<BusinessMasteryQuickRefProps> = () => {
  const [selectedTopic, setSelectedTopic] = useState('Handling Objections');

  const content = topicContent[selectedTopic];

  return (
    <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
      <h3 className="text-lg font-bold mb-4 bg-brand-gray/80 text-white p-2 rounded text-center">
        📚 BUSINESS MASTERY QUICK REFERENCE
      </h3>
      
      <div className="space-y-4">
        {/* Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            Select a Topic
          </label>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full bg-brand-light-bg dark:bg-brand-gray/50 border border-brand-light-border dark:border-brand-gray rounded-md p-2 text-sm text-brand-light-text dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>

        {/* Content Display */}
        {content && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                {content.summary}
              </p>
            </div>

            {/* Key Points */}
            <div>
              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                🎯 Key Points:
              </h4>
              <ul className="space-y-1">
                {content.keyPoints.map((point, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Tips */}
            <div>
              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                💡 Quick Tips / Scripts:
              </h4>
              <div className="space-y-2">
                {content.quickTips.map((tip, index) => (
                  <div key={index} className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs text-gray-700 dark:text-gray-300">
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <p className="text-xs text-center text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
          Quick reference for sales reps and marketers on the go.
        </p>
      </div>
    </div>
  );
};

export default BusinessMasteryQuickRef;
