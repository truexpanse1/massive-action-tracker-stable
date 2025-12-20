// api/generate-content.ts
import { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { avatar, platform, framework } = JSON.parse(event.body || '{}');

    const frameworks: Record<string, { name: string; description: string }> = {
      PAS: {
        name: 'Problem-Agitate-Solution',
        description: 'Hook with a problem, agitate the pain, present your solution',
      },
      BAB: {
        name: 'Before-After-Bridge',
        description: 'Show the before state, paint the after picture, bridge with your solution',
      },
      Dream: {
        name: 'Dream Outcome',
        description: 'Lead with the dream result they want to achieve',
      },
      SocialProof: {
        name: 'Social Proof',
        description: 'Leverage customer success stories and testimonials',
      },
    };

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert copywriter specializing in high-converting ${platform} ads using the ${frameworks[framework].name} framework. You write compelling, benefit-driven copy that speaks directly to the target audience's desires and pain points.`,
          },
          {
            role: 'user',
            content: `Create a ${platform} ad for a ${avatar.industry || 'business'} targeting this avatar:

Avatar: ${avatar.avatar_name}
Demographics: ${avatar.age_range || 'N/A'} | ${avatar.gender || 'N/A'} | ${avatar.income_range || 'N/A'}
Goals: ${(avatar.goals || []).slice(0, 3).join(', ')}
Fears: ${(avatar.fears || []).slice(0, 3).join(', ')}
Pain Points: ${(avatar.pain_points || []).slice(0, 3).join(', ')}
Buying Triggers: ${(avatar.buying_triggers || []).slice(0, 3).join(', ')}

Framework: ${frameworks[framework].name}

Return ONLY a JSON object with this exact structure:
{
  "headline": "Attention-grabbing headline (max 60 characters)",
  "body": "Main ad copy (3-5 paragraphs, use line breaks)",
  "cta": "Clear call-to-action (max 30 characters)",
  "imagePrompt": "Detailed prompt for AI image generation showing the transformation or result"
}`,
          },
        ],
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(content),
    };
  } catch (error: any) {
    console.error('Error generating content:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to generate content',
        details: error.message 
      }),
    };
  }
};

export { handler };
