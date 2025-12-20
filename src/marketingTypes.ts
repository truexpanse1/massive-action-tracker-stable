// src/marketingTypes.ts
// Types for the MAT Scorecard Domination Platform (Marketing Intelligence Suite)

export interface BuyerAvatar {
  id: string;
  company_id: string;
  assigned_to: string;
  created_at: string;
  updated_at: string;
  
  // Basic Profile
  avatar_name: string;
  industry: string | null;
  
  // Demographics
  age_range: string | null;
  gender: string | null;
  education_level: string | null;
  marital_status: string | null;
  occupation: string | null;
  income_range: string | null;
  location: string | null;
  
  // Psychographics (stored as JSON arrays)
  goals: string[];
  fears: string[];
  dreams: string[];
  pain_points: string[];
  desires: string[];
  beliefs: string[];
  
  // Behavioral
  buying_triggers: string[];
  objections: string[];
  preferred_content_types: string[];
  social_platforms: string[];
  ad_receptivity: Record<string, boolean>;
  
  // Relationships & Context
  relationships: string | null;
  daily_habits: string | null;
  media_consumption: string | null;
  expectations: string | null;
  
  // Deep Insights (Sabri Suby Framework)
  obsessed_stalker_insights: string | null;
  deep_seeded_triggers: string | null;
  market_wants: string | null;
  
  // AI-Generated Summary
  avatar_summary: string | null;
  avatar_image_url: string | null;
  
  // Metadata
  is_active: boolean;
  notes: string | null;
}

export interface GeneratedContent {
  id: string;
  company_id: string;
  assigned_to: string;
  avatar_id: string;
  created_at: string;
  updated_at: string;
  
  // Content Details
  platform: 'Facebook' | 'Instagram' | 'LinkedIn' | 'TikTok';
  content_type: 'Post' | 'Ad' | 'Story' | 'Reel' | 'Article';
  
  // Post Components
  headline: string;
  body_copy: string;
  call_to_action: string | null;
  image_prompt: string | null;
  image_url: string | null;
  
  // Metadata
  hook_type: string | null;
  tone: string | null;
  target_audience: string | null;
  
  // Engagement Tracking
  used: boolean;
  used_date: string | null;
  performance_notes: string | null;
  
  // Versioning
  version: number;
  parent_content_id: string | null;
  
  // Metadata
  is_favorite: boolean;
  notes: string | null;
}

export interface ContentTemplate {
  id: string;
  created_at: string;
  template_name: string;
  template_description: string | null;
  framework_type: string | null;
  template_structure: {
    sections: string[];
    prompts?: Record<string, string>;
  };
  example_content: any | null;
  is_active: boolean;
  sort_order: number;
}

// Form data types for creating avatars
export interface AvatarFormData {
  avatar_name: string;
  industry: string;
  age_range: string;
  gender: string;
  education_level: string;
  marital_status: string;
  occupation: string;
  income_range: string;
  location: string;
  goals: string[];
  fears: string[];
  dreams: string[];
  pain_points: string[];
  desires: string[];
  beliefs: string[];
  buying_triggers: string[];
  objections: string[];
  preferred_content_types: string[];
  social_platforms: string[];
  relationships: string;
  daily_habits: string;
  media_consumption: string;
  expectations: string;
  obsessed_stalker_insights: string;
  deep_seeded_triggers: string;
  market_wants: string;
}

// Content generation request
export interface ContentGenerationRequest {
  avatar_id: string;
  platform: 'Facebook' | 'Instagram' | 'LinkedIn' | 'TikTok';
  content_type: 'Post' | 'Ad' | 'Story' | 'Reel' | 'Article';
  framework_type: 'PAS' | 'BAB' | 'Dream' | 'SocialProof';
  tone?: string;
}

// Add to View type in types.ts
export type MarketingView = 'dream-avatars' | 'content-studio' | 'content-library';
