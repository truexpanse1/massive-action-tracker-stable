import { supabase } from './supabaseClient';
import { generateResponse } from './geminiService';

export interface DreamClientContentRequest {
  dreamClientId: string;
  contentType: string;
  tone: string;
  additionalInstructions?: string;
  specificOffer?: string;
}

export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'ads' | 'email' | 'social' | 'pages';
}

export const contentTemplates: ContentTemplate[] = [
  {
    id: 'long_form_ad',
    name: 'Long-Form Facebook Ad',
    description: 'Full problem-agitate-solution ad (1500-2000 words)',
    icon: '📱',
    category: 'ads'
  },
  {
    id: 'short_form_ad',
    name: 'Short-Form Facebook Ad',
    description: 'Quick hook-benefit-CTA ad (300-400 words)',
    icon: '⚡',
    category: 'ads'
  },
  {
    id: 'opt_in_headline',
    name: 'Opt-In Page Headlines',
    description: '5 headline variations for lead magnets',
    icon: '🎯',
    category: 'pages'
  },
  {
    id: 'opt_in_full',
    name: 'Complete Opt-In Page',
    description: 'Full landing page copy with all sections',
    icon: '🌐',
    category: 'pages'
  },
  {
    id: 'email_problem',
    name: 'Email - Problem Agitation',
    description: 'Awareness stage email highlighting pain',
    icon: '📧',
    category: 'email'
  },
  {
    id: 'email_solution',
    name: 'Email - Solution Introduction',
    description: 'Consideration stage introducing your solution',
    icon: '💡',
    category: 'email'
  },
  {
    id: 'email_offer',
    name: 'Email - Godfather Offer',
    description: 'Decision stage with irresistible offer',
    icon: '🎁',
    category: 'email'
  },
  {
    id: 'social_story',
    name: 'Social Post - Story',
    description: 'Personal narrative that builds connection',
    icon: '📖',
    category: 'social'
  },
  {
    id: 'social_value',
    name: 'Social Post - Value',
    description: 'Educational content that helps audience',
    icon: '💎',
    category: 'social'
  },
  {
    id: 'social_engagement',
    name: 'Social Post - Engagement',
    description: 'Question or poll to spark conversation',
    icon: '💬',
    category: 'social'
  },
];

export const toneOptions = [
  { value: 'friendly', label: 'Friendly', description: 'Warm, approachable, supportive' },
  { value: 'professional', label: 'Professional', description: 'Polished, credible, authoritative' },
  { value: 'business', label: 'Business', description: 'ROI-focused, strategic, corporate' },
  { value: 'bold', label: 'Bold', description: 'Direct, commanding, no-nonsense (Dan Kennedy style)' },
  { value: 'confident', label: 'Confident', description: 'Expert, assured, trustworthy' },
  { value: 'fiery', label: 'Fiery', description: 'Aggressive, conversational, pattern-interrupting (Sabri Suby style)' },
];

function buildBasePrompt(dreamClient: any, tone: string, additionalInstructions?: string): string {
  const painPoints = Array.isArray(dreamClient.pain_points) 
    ? dreamClient.pain_points.slice(0, 3) 
    : [];
  const goals = Array.isArray(dreamClient.goals) 
    ? dreamClient.goals.slice(0, 3) 
    : [];
  const fears = Array.isArray(dreamClient.fears) 
    ? dreamClient.fears.slice(0, 3) 
    : [];
  const buyingTriggers = Array.isArray(dreamClient.buying_triggers) 
    ? dreamClient.buying_triggers.slice(0, 3) 
    : [];

  return `You are an expert copywriter who writes at a 5th grade reading level.

CRITICAL REQUIREMENTS FOR 5TH GRADE READING LEVEL:
1. Use simple, everyday words (avoid complex vocabulary)
2. Write short sentences (10-15 words average)
3. Use active voice, not passive voice
4. One clear idea per sentence
5. Avoid jargon - explain everything simply
6. Use concrete examples, not abstract ideas
7. Break up long paragraphs (3-4 sentences max)

DREAM CLIENT PROFILE:
- Name: ${dreamClient.avatar_name || 'Not specified'}
- Industry: ${dreamClient.industry || 'Not specified'}
- Age Range: ${dreamClient.age_range || 'Not specified'}
- Gender: ${dreamClient.gender || 'Not specified'}
- Occupation: ${dreamClient.occupation || 'Not specified'}
- Income Range: ${dreamClient.income_range || 'Not specified'}

TOP 3 PAIN POINTS:
${painPoints.length > 0 ? painPoints.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n') : 'Not specified'}

TOP 3 GOALS & DREAMS:
${goals.length > 0 ? goals.map((g: string, i: number) => `${i + 1}. ${g}`).join('\n') : 'Not specified'}

TOP 3 FEARS:
${fears.length > 0 ? fears.map((f: string, i: number) => `${i + 1}. ${f}`).join('\n') : 'Not specified'}

TOP 3 BUYING TRIGGERS:
${buyingTriggers.length > 0 ? buyingTriggers.map((t: string, i: number) => `${i + 1}. ${t}`).join('\n') : 'Not specified'}

TONE: ${tone.charAt(0).toUpperCase() + tone.slice(1)}

${additionalInstructions ? `ADDITIONAL INSTRUCTIONS:\n${additionalInstructions}\n` : ''}

Remember: Every sentence must be simple and clear. Write like you're talking to a friend.
`;
}

function getLongFormAdPrompt(): string {
  return `
CREATE A LONG-FORM FACEBOOK AD (1500-2000 words)

Use this exact structure:

1. HOOK (3-4 sentences)
   - Start with "Hey [occupation]..." or "Attention [industry] professionals..."
   - Ask a question about their main pain point
   - Make it personal and relatable
   - Use simple words

2. PROBLEM REFRAME (5-6 sentences)
   - What they think the problem is
   - What the problem really is
   - Explain it simply
   - Make them say "that's exactly right!"

3. AGITATION (8-10 sentences)
   - Describe pain point #1 in detail
   - Talk about pain point #2 and how it feels
   - Mention pain point #3 and the cost
   - Use short sentences
   - Make it emotional but clear
   - Show you understand their struggle

4. THE VILLAIN (4-5 sentences)
   - What most people blame for the problem
   - Why that's not the real issue
   - What the real culprit is
   - Keep it simple and direct

5. THE EPIPHANY (6-8 sentences)
   - Introduce your solution
   - Explain how it fixes the real problem
   - Use a simple comparison or metaphor
   - Keep it concrete, not abstract
   - Make it easy to understand

6. PROOF & CREDENTIALS (5-6 sentences)
   - Share specific results (use numbers)
   - Mention how many people you've helped
   - Keep it believable and real
   - Build trust with facts

7. THE OFFER (10-12 sentences)
   - What they get (be specific)
   - List 3-5 benefits (use bullet points with ✓)
   - Show the value
   - Reveal the price (if applicable)
   - Add a guarantee
   - Make it irresistible

8. QUALIFICATION (3-4 sentences)
   - Say "This isn't for everyone"
   - List 2-3 requirements
   - Make them want to qualify

9. SCARCITY (2-3 sentences)
   - Add urgency (limited time, spots, etc.)
   - Make it genuine
   - Create FOMO (fear of missing out)

10. CALL TO ACTION (3-4 sentences)
    - Tell them exactly what to do next
    - Make it clear and easy
    - Repeat the main benefit

11. WARNING (2-3 sentences)
    - What happens if they don't take action
    - The cost of staying stuck
    - Create urgency

IMPORTANT:
- Every sentence should be 10-15 words
- Use simple words a 5th grader knows
- No jargon or fancy language
- Active voice only
- Short paragraphs (3-4 sentences max)
`;
}

function getShortFormAdPrompt(): string {
  return `
CREATE A SHORT-FORM FACEBOOK AD (300-400 words)

Use this exact structure:

1. HOOK (2-3 sentences)
   - Grab attention with a question or bold statement
   - Relate to their main pain point
   - Make it personal

2. PROBLEM (3-4 sentences)
   - Describe the struggle
   - Make them nod their head "yes, that's me"
   - Keep it simple and clear

3. SOLUTION (3-4 sentences)
   - Introduce what you offer
   - Explain the main benefit
   - Keep it concrete and easy to understand

4. PROOF (2 sentences)
   - One specific result or number
   - Build quick credibility

5. CALL TO ACTION (2-3 sentences)
   - Tell them what to do
   - Create urgency
   - Make it easy

IMPORTANT:
- Every sentence should be 10-15 words
- Use simple words only
- No jargon
- Active voice
- Write like you're texting a friend
`;
}

function getOptInHeadlinePrompt(): string {
  return `
CREATE 5 DIFFERENT HEADLINE OPTIONS for an opt-in page.

Each headline must:
- Be 10-15 words maximum
- Use 5th grade vocabulary (simple words only)
- Address the dream client's main pain point
- Promise a clear benefit related to their main goal
- Feel personal and direct

Use these 5 formulas:

Formula 1: How To [Achieve Goal] Without [Pain Point]
Example: "How To Get More Clients Without Cold Calling"

Formula 2: The Simple Way To [Benefit] (Even If [Objection])
Example: "The Simple Way To Double Your Sales (Even If You Hate Selling)"

Formula 3: [Number] Ways To [Solve Problem] Starting Today
Example: "7 Ways To Find Dream Clients Starting Today"

Formula 4: Stop [Pain Point]. Start [Desired Outcome].
Example: "Stop Chasing Leads. Start Attracting Clients."

Formula 5: Get [Benefit] In [Timeframe] (No [Objection] Required)
Example: "Get 10 New Leads In 7 Days (No Ads Required)"

Make each headline feel like you're talking directly to the dream client.
Use their language. Address their specific pain and goal.
Keep it simple. No fancy words.

Present the 5 headlines clearly numbered 1-5.
`;
}

function getEmailProblemPrompt(): string {
  return `
CREATE A PROBLEM AGITATION EMAIL (400-500 words)

This is an awareness stage email. The goal is to make them feel understood.

Structure:

1. SUBJECT LINE (5-10 words)
   - Create curiosity
   - Relate to their pain
   - Make them want to open

2. OPENING (2-3 sentences)
   - Personal greeting
   - Ask about their struggle
   - Show empathy

3. PROBLEM DESCRIPTION (5-6 sentences)
   - Describe pain point #1 in detail
   - Talk about how it feels
   - Mention pain point #2
   - Show you understand
   - Make them say "yes, that's exactly how I feel"

4. AGITATION (4-5 sentences)
   - What happens if this continues
   - The cost of not solving it
   - Paint a picture of the struggle
   - Keep it emotional but clear

5. HOPE (2-3 sentences)
   - Say there's a better way
   - Tease the solution (don't reveal yet)
   - Create curiosity

6. CALL TO ACTION (2 sentences)
   - Tell them to reply or click
   - Keep it simple
   - No pressure, just invitation

IMPORTANT:
- Write like you're emailing a friend
- Short sentences (10-15 words)
- Simple words only
- Show empathy and understanding
- Don't sell yet - just connect
`;
}

function getEmailSolutionPrompt(): string {
  return `
CREATE A SOLUTION INTRODUCTION EMAIL (400-500 words)

This is a consideration stage email. The goal is to introduce your solution.

Structure:

1. SUBJECT LINE (5-10 words)
   - Promise a solution
   - Create curiosity
   - Make them want to open

2. OPENING (2-3 sentences)
   - Reference their pain (from previous email)
   - Say you have good news
   - Build anticipation

3. THE EPIPHANY (4-5 sentences)
   - Explain what you discovered
   - Share the "aha moment"
   - Keep it simple and relatable
   - Make them curious

4. THE SOLUTION (6-7 sentences)
   - Introduce your product/service
   - Explain how it works (simply)
   - Show how it solves their pain
   - Use a simple comparison or example
   - Keep it concrete

5. BENEFITS (3-4 bullet points)
   - List 3-4 key benefits
   - Use ✓ checkmarks
   - Keep each benefit to one line
   - Focus on outcomes, not features

6. SOCIAL PROOF (2-3 sentences)
   - Share one quick result or testimonial
   - Use a specific number if possible
   - Build credibility

7. CALL TO ACTION (2-3 sentences)
   - Tell them what to do next
   - Make it easy and clear
   - Create slight urgency

IMPORTANT:
- Short sentences (10-15 words)
- Simple words only
- Focus on benefits, not features
- Make it feel like a discovery, not a sales pitch
`;
}

function getEmailOfferPrompt(): string {
  return `
CREATE A GODFATHER OFFER EMAIL (500-600 words)

This is a decision stage email. The goal is to make an irresistible offer.

Structure:

1. SUBJECT LINE (5-10 words)
   - Create urgency
   - Hint at special offer
   - Make them want to open

2. OPENING (2-3 sentences)
   - Recap the problem and solution
   - Say you have something special
   - Build anticipation

3. THE OFFER (8-10 sentences)
   - Clearly state what they get
   - List all components (use bullet points with ✓)
   - Show the value of each component
   - Add up the total value
   - Reveal the actual price
   - Make the gap between value and price obvious

4. BONUSES (3-4 bullet points)
   - List 2-3 bonuses
   - Show value of each
   - Make them highly desirable

5. GUARANTEE (3-4 sentences)
   - State your guarantee clearly
   - Remove all risk
   - Make it powerful
   - Build confidence

6. SCARCITY (2-3 sentences)
   - Add genuine urgency
   - Limited time, spots, or price
   - Make it real, not fake

7. CALL TO ACTION (3-4 sentences)
   - Tell them exactly what to do
   - Make it clear and easy
   - Repeat the main benefit
   - Create urgency

8. WARNING (2 sentences)
   - What happens if they don't act
   - The cost of waiting

IMPORTANT:
- Short sentences (10-15 words)
- Simple words only
- Make the offer feel irresistible
- Remove all risk with guarantee
- Create genuine urgency
`;
}

function getSocialStoryPrompt(): string {
  return `
CREATE A SOCIAL MEDIA STORY POST (150-200 words)

This is a personal narrative that builds connection.

Structure:

1. HOOK (1-2 sentences)
   - Start with a relatable moment
   - Create curiosity
   - Make them want to keep reading

2. THE STORY (5-7 sentences)
   - Share a personal experience
   - Relate to their pain or goal
   - Be vulnerable and real
   - Use simple language
   - Make it feel authentic

3. THE LESSON (2-3 sentences)
   - What you learned
   - How it changed things
   - Make it actionable

4. THE INVITATION (1-2 sentences)
   - Ask a question
   - Invite them to share
   - Create engagement

IMPORTANT:
- Write like you're talking to a friend
- Be authentic and real
- Short sentences (10-15 words)
- Simple words only
- Make it relatable
- End with a question to spark comments
`;
}

function getSocialValuePrompt(): string {
  return `
CREATE A SOCIAL MEDIA VALUE POST (150-200 words)

This is educational content that helps your audience.

Structure:

1. HOOK (1-2 sentences)
   - Start with a bold statement or question
   - Promise value
   - Make them want to keep reading

2. THE TIP/INSIGHT (6-8 sentences)
   - Share one valuable tip or insight
   - Explain it simply
   - Give a specific example
   - Make it actionable
   - Keep it practical

3. THE BENEFIT (2-3 sentences)
   - Explain what they'll gain
   - Show the result
   - Make it concrete

4. CALL TO ACTION (1-2 sentences)
   - Tell them to save, share, or comment
   - Ask for their experience
   - Create engagement

IMPORTANT:
- Focus on ONE tip or insight
- Make it immediately actionable
- Short sentences (10-15 words)
- Simple words only
- Give real value
- End with engagement prompt
`;
}

function getSocialEngagementPrompt(): string {
  return `
CREATE A SOCIAL MEDIA ENGAGEMENT POST (100-150 words)

This is a question or poll to spark conversation.

Structure:

1. HOOK (1-2 sentences)
   - Start with a relatable statement
   - Set up the question
   - Make them curious

2. THE QUESTION (2-3 sentences)
   - Ask a specific question
   - Relate to their pain or goal
   - Make it easy to answer
   - Keep it simple

3. OPTIONS (if applicable)
   - Give 2-3 options to choose from
   - Make them clear and distinct
   - Keep each option short

4. INVITATION (1-2 sentences)
   - Encourage them to comment
   - Say you want to hear from them
   - Create a welcoming tone

IMPORTANT:
- Make the question easy to answer
- Keep it relevant to their pain/goal
- Short sentences (10-15 words)
- Simple words only
- Create a conversation starter
- Be genuinely curious about their answers
`;
}

function getContentTypePrompt(contentType: string): string {
  const prompts: Record<string, string> = {
    long_form_ad: getLongFormAdPrompt(),
    short_form_ad: getShortFormAdPrompt(),
    opt_in_headline: getOptInHeadlinePrompt(),
    email_problem: getEmailProblemPrompt(),
    email_solution: getEmailSolutionPrompt(),
    email_offer: getEmailOfferPrompt(),
    social_story: getSocialStoryPrompt(),
    social_value: getSocialValuePrompt(),
    social_engagement: getSocialEngagementPrompt(),
  };

  return prompts[contentType] || getLongFormAdPrompt();
}

export async function generateDreamClientContent(request: DreamClientContentRequest): Promise<string> {
  try {
    // Fetch the dream client profile
    const { data: dreamClient, error: fetchError } = await supabase
      .from('buyer_avatars')
      .select('*')
      .eq('id', request.dreamClientId)
      .single();

    if (fetchError || !dreamClient) {
      throw new Error('Dream client profile not found');
    }

    // Build the complete prompt
    const basePrompt = buildBasePrompt(
      dreamClient,
      request.tone,
      request.additionalInstructions
    );

    const contentTypePrompt = getContentTypePrompt(request.contentType);

    const fullPrompt = basePrompt + '\n\n' + contentTypePrompt;

    // Call the generation service directly
    const content = await generateResponse(fullPrompt, false);
    return content;

  } catch (error) {
    console.error('Error generating dream client content:', error);
    throw error;
  }
}

// Reading level calculation
export function calculateReadingLevel(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const words = text.split(/\s+/).filter(w => w.trim().length > 0).length;
  const syllables = countSyllables(text);

  if (sentences === 0 || words === 0) return 0;

  const gradeLevel = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;

  return Math.round(gradeLevel * 10) / 10;
}

function countSyllables(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  let count = 0;

  words.forEach(word => {
    word = word.replace(/[^a-z]/g, '');
    if (word.length === 0) return;
    
    if (word.length <= 3) {
      count += 1;
    } else {
      const vowelGroups = word.match(/[aeiouy]+/g);
      count += vowelGroups ? vowelGroups.length : 1;
      
      // Adjust for silent e
      if (word.endsWith('e')) {
        count -= 1;
      }
      
      // Minimum of 1 syllable per word
      if (count < 1) count = 1;
    }
  });

  return count;
}

export function validateReadingLevel(content: string): {
  valid: boolean;
  level: number;
  message: string;
  emoji: string;
} {
  const level = calculateReadingLevel(content);

  if (level <= 5.5) {
    return {
      valid: true,
      level,
      message: `Reading level: Grade ${level} (Perfect!)`,
      emoji: '✅'
    };
  } else if (level <= 7.0) {
    return {
      valid: true,
      level,
      message: `Reading level: Grade ${level} (Close, try simpler words)`,
      emoji: '⚠️'
    };
  } else {
    return {
      valid: false,
      level,
      message: `Reading level: Grade ${level} (Too complex! Simplify.)`,
      emoji: '❌'
    };
  }
}
