# Content Generation System Implementation Guide
## 5th Grade Reading Level + Dream Client Profile Integration

**Date:** January 6, 2026

---

## Core Requirements

### 1. Reading Level: 5th Grade
All generated content MUST be written at a 5th grade reading level:
- **Short sentences** (10-15 words average)
- **Simple words** (avoid jargon, use everyday language)
- **Clear ideas** (one idea per sentence)
- **Active voice** (not passive)
- **Concrete examples** (not abstract concepts)

### 2. Dream Client Profile Integration
Content must pull from and adapt to the user's specific dream client profile:
- Industry
- Pain Points (top 3)
- Goals & Dreams
- Fears
- Buying Triggers
- Common Objections
- Age Range, Gender, Education Level
- Occupation, Income Range

### 3. MAT as Communication Bridge
The system helps users speak directly to their dream client in language that resonates.

---

## Implementation Steps

### Step 1: Update AI Content Generation Prompts

**Location:** `pages/AIContentPage.tsx` or content generation service

**Current System:** Generic content generation

**New System:** Dream client-aware, 5th grade level content

**Base Prompt Structure:**
```typescript
const generateContentPrompt = `You are an expert copywriter who writes at a 5th grade reading level.

CRITICAL REQUIREMENTS:
1. Use simple, everyday words (5th grade vocabulary)
2. Write short sentences (10-15 words average)
3. Use active voice, not passive
4. One clear idea per sentence
5. Avoid jargon - explain everything simply
6. Use concrete examples, not abstract ideas

DREAM CLIENT PROFILE:
- Name: ${dreamClient.avatar_name}
- Industry: ${dreamClient.industry}
- Age: ${dreamClient.age_range}
- Occupation: ${dreamClient.occupation}
- Income: ${dreamClient.income_range}

PAIN POINTS:
${dreamClient.pain_points.slice(0, 3).map((p, i) => `${i + 1}. ${p}`).join('\n')}

GOALS & DREAMS:
${dreamClient.goals.slice(0, 3).map((g, i) => `${i + 1}. ${g}`).join('\n')}

FEARS:
${dreamClient.fears.slice(0, 3).map((f, i) => `${i + 1}. ${f}`).join('\n')}

BUYING TRIGGERS:
${dreamClient.buying_triggers.slice(0, 3).map((t, i) => `${i + 1}. ${t}`).join('\n')}

COMMON OBJECTIONS:
${dreamClient.common_objections.slice(0, 3).map((o, i) => `${i + 1}. ${o}`).join('\n')}

YOUR TASK:
Create ${contentType} that speaks directly to this dream client.
Use their language. Address their specific pains, fears, and dreams.
Make them feel understood.

TONE: ${selectedTone}

CONTENT TYPE: ${contentType}

${additionalInstructions}

Remember: 5th grade reading level. Simple words. Short sentences. Clear ideas.
`;
```

---

### Step 2: Add New Content Types

**New Template Options to Add:**

1. **Long-Form Facebook Ad** (Problem-Agitate-Solution)
2. **Short-Form Facebook Ad** (Hook-Benefit-CTA)
3. **Opt-In Page Headline** (5 variations)
4. **Opt-In Page Full Copy** (Complete page)
5. **Email - Problem Agitation** (Awareness stage)
6. **Email - Solution Introduction** (Consideration stage)
7. **Email - Godfather Offer** (Decision stage)
8. **Social Media Post - Story** (Personal narrative)
9. **Social Media Post - Value** (Educational)
10. **Social Media Post - Engagement** (Question/poll)

---

### Step 3: Template Prompts for Each Content Type

#### Template 1: Long-Form Facebook Ad

```typescript
const longFormFacebookAdPrompt = `
Create a long-form Facebook ad (1500-2000 words) using this structure:

1. HOOK (3-4 sentences)
   - Start with "Hey ${dreamClient.occupation}..."
   - Ask a question about their ${painPoint1}
   - Make it personal and relatable

2. PROBLEM REFRAME (5-6 sentences)
   - What they think the problem is vs. what it really is
   - Use simple language to explain
   - Make them say "that's exactly right!"

3. AGITATION (8-10 sentences)
   - Describe ${painPoint1} in detail
   - Talk about ${painPoint2} and how it feels
   - Mention ${painPoint3} and the cost
   - Use short sentences
   - Make it emotional but clear

4. SOLUTION (6-8 sentences)
   - Introduce your product/service
   - Explain how it fixes the real problem
   - Use a simple comparison they'll understand
   - Keep it concrete, not abstract

5. PROOF (5-6 sentences)
   - Share specific results (numbers)
   - Mention how many people you've helped
   - Keep it believable and real

6. OFFER (10-12 sentences)
   - What they get
   - List 3-5 benefits (bullet points)
   - Show the value
   - Reveal the price
   - Add a guarantee

7. CALL TO ACTION (3-4 sentences)
   - Tell them exactly what to do next
   - Create urgency
   - Make it easy

REMEMBER: 
- 5th grade reading level
- Short sentences (10-15 words)
- Simple words only
- Speak directly to ${dreamClient.avatar_name}
- Address their specific ${painPoint1}, ${fear1}, and ${goal1}
`;
```

#### Template 2: Opt-In Page Headlines (5 Variations)

```typescript
const optInHeadlinePrompt = `
Create 5 different headline options for an opt-in page.

Each headline must:
- Be 10-15 words maximum
- Use 5th grade vocabulary
- Address ${dreamClient.avatar_name}'s main pain point: ${painPoint1}
- Promise a clear benefit related to their goal: ${goal1}
- Feel personal and direct

Use these formulas:

Formula 1: How To [Achieve Goal] Without [Pain Point]
Formula 2: The Simple Way To [Benefit] (Even If [Objection])
Formula 3: [Number] Ways To [Solve Problem] Starting Today
Formula 4: Stop [Pain Point]. Start [Desired Outcome].
Formula 5: Get [Benefit] In [Timeframe] (No [Objection] Required)

Make each headline feel like you're talking directly to a ${dreamClient.occupation} who struggles with ${painPoint1}.

Use simple, everyday words. No fancy language.
`;
```

#### Template 3: Short-Form Facebook Ad

```typescript
const shortFormFacebookAdPrompt = `
Create a short Facebook ad (300-400 words) with this structure:

1. HOOK (2-3 sentences)
   - Grab attention with a question or bold statement
   - Relate to ${painPoint1}

2. PROBLEM (3-4 sentences)
   - Describe the struggle with ${painPoint1}
   - Make them nod their head "yes, that's me"

3. SOLUTION (3-4 sentences)
   - Introduce what you offer
   - Explain the main benefit
   - Keep it simple and clear

4. PROOF (2 sentences)
   - One specific result or number
   - Build quick credibility

5. CALL TO ACTION (2-3 sentences)
   - Tell them what to do
   - Create urgency
   - Make it easy

TONE: ${selectedTone}

TARGET: ${dreamClient.avatar_name} (${dreamClient.occupation}, ${dreamClient.age_range})

KEY PAIN: ${painPoint1}
KEY GOAL: ${goal1}
KEY FEAR: ${fear1}

Write like you're texting a friend. Short sentences. Simple words. Clear message.
`;
```

---

### Step 4: Reading Level Validation

Add a reading level checker to ensure content meets 5th grade standard:

```typescript
// Flesch-Kincaid Grade Level formula
function calculateReadingLevel(text: string): number {
  const sentences = text.split(/[.!?]+/).length;
  const words = text.split(/\s+/).length;
  const syllables = countSyllables(text);
  
  const gradeLevel = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
  
  return Math.round(gradeLevel * 10) / 10;
}

function countSyllables(text: string): number {
  // Simple syllable counter
  const words = text.toLowerCase().split(/\s+/);
  let count = 0;
  
  words.forEach(word => {
    word = word.replace(/[^a-z]/g, '');
    if (word.length <= 3) {
      count += 1;
    } else {
      const vowels = word.match(/[aeiouy]+/g);
      count += vowels ? vowels.length : 1;
    }
  });
  
  return count;
}

// Validate and warn if reading level is too high
function validateReadingLevel(content: string): { valid: boolean; level: number; message: string } {
  const level = calculateReadingLevel(content);
  
  if (level <= 5.5) {
    return { valid: true, level, message: `✓ Reading level: Grade ${level} (Perfect!)` };
  } else if (level <= 7.0) {
    return { valid: true, level, message: `⚠ Reading level: Grade ${level} (Close, but try simpler words)` };
  } else {
    return { valid: false, level, message: `❌ Reading level: Grade ${level} (Too complex! Simplify.)` };
  }
}
```

---

### Step 5: UI Updates for AIContentPage

**Add Dream Client Selector:**

```typescript
// In AIContentPage.tsx
const [selectedDreamClient, setSelectedDreamClient] = useState<BuyerAvatar | null>(null);
const [dreamClients, setDreamClients] = useState<BuyerAvatar[]>([]);

// Fetch dream clients on mount
useEffect(() => {
  async function fetchDreamClients() {
    const { data, error } = await supabase
      .from('buyer_avatars')
      .select('*')
      .eq('user_id', user.id)
      .eq('company_id', user.company_id);
    
    if (data) setDreamClients(data);
  }
  
  fetchDreamClients();
}, [user.id, user.company_id]);
```

**Add Content Type Selector:**

```typescript
const contentTypes = [
  { value: 'long_form_ad', label: 'Long-Form Facebook Ad', icon: '📱' },
  { value: 'short_form_ad', label: 'Short-Form Facebook Ad', icon: '⚡' },
  { value: 'opt_in_headline', label: 'Opt-In Page Headlines (5 variations)', icon: '🎯' },
  { value: 'opt_in_full', label: 'Complete Opt-In Page', icon: '🌐' },
  { value: 'email_problem', label: 'Email - Problem Agitation', icon: '📧' },
  { value: 'email_solution', label: 'Email - Solution Introduction', icon: '💡' },
  { value: 'email_offer', label: 'Email - Godfather Offer', icon: '🎁' },
  { value: 'social_story', label: 'Social Post - Story', icon: '📖' },
  { value: 'social_value', label: 'Social Post - Value', icon: '💎' },
  { value: 'social_engagement', label: 'Social Post - Engagement', icon: '💬' },
];
```

**Update UI Layout:**

```tsx
<div className="content-generation-form">
  {/* Dream Client Selector */}
  <div className="form-section">
    <label>Select Dream Client Profile</label>
    <select 
      value={selectedDreamClient?.id || ''}
      onChange={(e) => {
        const client = dreamClients.find(dc => dc.id === e.target.value);
        setSelectedDreamClient(client || null);
      }}
    >
      <option value="">Choose a dream client...</option>
      {dreamClients.map(dc => (
        <option key={dc.id} value={dc.id}>
          {dc.avatar_name} ({dc.industry})
        </option>
      ))}
    </select>
    {!selectedDreamClient && (
      <p className="helper-text">
        ℹ️ Select a dream client to generate personalized content
      </p>
    )}
  </div>

  {/* Content Type Selector */}
  <div className="form-section">
    <label>Content Type</label>
    <div className="content-type-grid">
      {contentTypes.map(type => (
        <button
          key={type.value}
          className={`content-type-card ${selectedContentType === type.value ? 'selected' : ''}`}
          onClick={() => setSelectedContentType(type.value)}
        >
          <span className="icon">{type.icon}</span>
          <span className="label">{type.label}</span>
        </button>
      ))}
    </div>
  </div>

  {/* Tone Selector */}
  <div className="form-section">
    <label>Writing Tone</label>
    <select value={selectedTone} onChange={(e) => setSelectedTone(e.target.value)}>
      <option value="friendly">Friendly - Warm and approachable</option>
      <option value="professional">Professional - Polished and credible</option>
      <option value="business">Business - ROI-focused and strategic</option>
      <option value="bold">Bold - Direct and commanding (Dan Kennedy style)</option>
      <option value="confident">Confident - Expert and assured</option>
      <option value="fiery">Fiery - Aggressive and conversational (Sabri Suby style)</option>
    </select>
  </div>

  {/* Additional Instructions */}
  <div className="form-section">
    <label>Additional Instructions (Optional)</label>
    <textarea
      placeholder="Any specific details, offers, or points to include..."
      value={additionalInstructions}
      onChange={(e) => setAdditionalInstructions(e.target.value)}
      rows={4}
    />
  </div>

  {/* Generate Button */}
  <button
    className="generate-btn"
    onClick={handleGenerateContent}
    disabled={!selectedDreamClient || !selectedContentType || isGenerating}
  >
    {isGenerating ? 'Generating...' : 'Generate Content'}
  </button>
</div>

{/* Generated Content Display */}
{generatedContent && (
  <div className="generated-content-section">
    <div className="content-header">
      <h3>Generated Content</h3>
      <div className="reading-level-badge">
        {readingLevelValidation.message}
      </div>
    </div>
    
    <div className="content-display">
      {generatedContent}
    </div>
    
    <div className="content-actions">
      <button onClick={() => copyToClipboard(generatedContent)}>
        📋 Copy to Clipboard
      </button>
      <button onClick={() => saveContent(generatedContent)}>
        💾 Save to Library
      </button>
      <button onClick={() => regenerateContent()}>
        🔄 Regenerate
      </button>
    </div>
  </div>
)}
```

---

### Step 6: Content Generation Service Update

**Create new service file:** `services/dreamClientContentService.ts`

```typescript
import { supabase } from '../supabaseClient';
import { BuyerAvatar } from '../types';

export interface ContentGenerationRequest {
  dreamClient: BuyerAvatar;
  contentType: string;
  tone: string;
  additionalInstructions?: string;
  userId: string;
  companyId: string;
}

export async function generateDreamClientContent(request: ContentGenerationRequest): Promise<string> {
  const { dreamClient, contentType, tone, additionalInstructions } = request;
  
  // Build the prompt based on content type
  const prompt = buildPromptForContentType(dreamClient, contentType, tone, additionalInstructions);
  
  // Call OpenAI API
  const response = await fetch('/api/generate-content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, maxTokens: getMaxTokensForType(contentType) }),
  });
  
  const data = await response.json();
  return data.content;
}

function buildPromptForContentType(
  dreamClient: BuyerAvatar,
  contentType: string,
  tone: string,
  additionalInstructions?: string
): string {
  const basePrompt = `You are an expert copywriter who writes at a 5th grade reading level.

CRITICAL REQUIREMENTS:
1. Use simple, everyday words (5th grade vocabulary)
2. Write short sentences (10-15 words average)
3. Use active voice, not passive
4. One clear idea per sentence
5. Avoid jargon - explain everything simply
6. Use concrete examples, not abstract ideas

DREAM CLIENT PROFILE:
- Name: ${dreamClient.avatar_name}
- Industry: ${dreamClient.industry}
- Age: ${dreamClient.age_range}
- Occupation: ${dreamClient.occupation}
- Income: ${dreamClient.income_range}

PAIN POINTS:
${dreamClient.pain_points?.slice(0, 3).map((p, i) => `${i + 1}. ${p}`).join('\n') || 'Not specified'}

GOALS & DREAMS:
${dreamClient.goals?.slice(0, 3).map((g, i) => `${i + 1}. ${g}`).join('\n') || 'Not specified'}

FEARS:
${dreamClient.fears?.slice(0, 3).map((f, i) => `${i + 1}. ${f}`).join('\n') || 'Not specified'}

BUYING TRIGGERS:
${dreamClient.buying_triggers?.slice(0, 3).map((t, i) => `${i + 1}. ${t}`).join('\n') || 'Not specified'}

TONE: ${tone}

${additionalInstructions ? `ADDITIONAL INSTRUCTIONS:\n${additionalInstructions}\n` : ''}
`;

  // Add content-type-specific instructions
  const contentTypePrompts = {
    long_form_ad: getLongFormAdPrompt(),
    short_form_ad: getShortFormAdPrompt(),
    opt_in_headline: getOptInHeadlinePrompt(),
    // ... other content types
  };

  return basePrompt + '\n\n' + contentTypePrompts[contentType];
}

function getMaxTokensForType(contentType: string): number {
  const tokenLimits = {
    long_form_ad: 2500,
    short_form_ad: 600,
    opt_in_headline: 300,
    opt_in_full: 2000,
    email_problem: 800,
    email_solution: 800,
    email_offer: 1000,
    social_story: 400,
    social_value: 400,
    social_engagement: 300,
  };
  
  return tokenLimits[contentType] || 1000;
}
```

---

## Summary

This implementation ensures:

1. ✅ **5th grade reading level** - Enforced through prompts and validation
2. ✅ **Dream client profile integration** - Content pulls from specific profile data
3. ✅ **Diverse but targeted content** - Multiple content types, all tailored to the dream client
4. ✅ **MAT as communication bridge** - Helps users speak their dream client's language

The system transforms MAT into a powerful tool that helps users create content that truly resonates with their ideal clients.
