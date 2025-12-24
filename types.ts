
// types.ts

//
// Core Application Types
//

export type View =
  | 'day-view'
  | 'month-view'
  | 'prospecting'
  | 'hot-leads'
  | 'new-clients'
  | 'revenue'
  | 'ai-images'
  | 'ai-images-pro'
  | 'ai-content'
  | 'coaching'
  | 'team-control'
  | 'performance-dashboard'
  | 'eod-report'
  | 'dream-avatars'
  | 'scorecard-dashboard'
  | 'billing-plans';

export type Role = 'Sales Rep' | 'Manager';
export type UserStatus = 'Active' | 'Inactive';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  password?: string;
}

export type EODSubmissions = Record<string, Record<string, boolean>>;

//
// Data Models
//

export interface RevenueData {
  today: string;
  week: string;
  month: string;
  ytd: string;
  mcv: string;
  acv: string;
}

export const eventTypes = ['Appointment', 'Meeting', 'Call', 'Follow-up', 'Personal', 'Task'] as const;
export type CalendarEventType = typeof eventTypes[number];

export interface CalendarEvent {
  id: string;
  time: string; // "HH:mm" format
  type: CalendarEventType;
  title: string;
  client?: string;
  details?: string;
  isRecurring?: boolean;
  groupId?: string;
  userId?: string;
  conducted?: boolean; // Added to track completed appointments
}

export interface Goal {
  id: string;
  text: string;
  completed: boolean;
  rolledOver?: boolean; // Indicates if this goal was rolled over from a previous day
}

export type ProspectingCode = 'SW' | 'NA' | 'LM' | 'ST' | 'EP' | 'SA';

export const prospectingCodes: ProspectingCode[] = ['SW', 'NA', 'LM', 'ST', 'EP', 'SA'];
export const prospectingCodeDescriptions: Record<ProspectingCode, string> = {
    SW: "Spoke With",
    NA: "No Answer",
    LM: "Left Message",
    ST: "Sent Text",
    EP: "Emailed Proposal",
    SA: "Set Appointment",
};

export interface Contact {
  id: string;
  name: string;
  company?: string;
  date: string; // YYYY-MM-DD
  phone: string;
  email: string;
  interestLevel: number; // 1-10
  prospecting: Partial<Record<ProspectingCode, boolean>>;
  dateAdded?: string; // ISO string
  appointmentDate?: string; // YYYY-MM-DD
  completedFollowUps?: Record<number, string>; // day number -> date completed
  userId?: string;
  lead_source?: string; // Facebook, Instagram, LinkedIn, TikTok, Website, Referral, Direct Call, Other
}

export interface Transaction {
    id: string;
    date: string; // YYYY-MM-DD
    clientName: string;
    product: string;
    amount: number;
    isRecurring: boolean;
    userId?: string;
}

export interface NewClient {
    id: string;
    name: string;
    company: string;
    phone: string;
    email: string;
    address: string;
    city?: string;
    state?: string;
    zip?: string;
    salesProcessLength: string;
    monthlyContractValue: number;
    initialAmountCollected: number;
    closeDate: string; // YYYY-MM-DD
    stage: string;
    userId?: string;
    assignedTo?: string; // User ID of the sales rep who owns this client
}

//
// AI & Chat Types
//

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Quote {
    id: string;
    text: string;
    author: string;
    savedAt?: string; // ISO string
}

export interface Book {
    title: string;
    author: string;
    description: string;
    amazonLink: string;
    ibooksLink: string;
}

export interface AIChallengeData {
  quote: { text: string; author: string; } | null;
  challenges: { id: string, text: string }[];
  challengesAccepted: boolean;
  completedChallenges: string[];
}

//
// Daily Data Structure
//

export interface DayData {
    revenue: RevenueData;
    prospectingBlock: string;
    events: CalendarEvent[];
    followUpBlock: string;
    winsToday: string[];
    topTargets: Goal[];
    massiveGoals: Goal[];
    aiChallenge: AIChallengeData;
    prospectingContacts: Contact[];
    milestones: {
      calls30Achieved: boolean;
    };
    talkTime: string; // Added for EOD Report
    eodSubmitted?: boolean;
    userId?: string;
    lastRolloverDate?: string; // Track when rollover last ran (YYYY-MM-DD)
    dailyNotes?: string; // Daily reflection/notes
}

export const getInitialDayData = (): DayData => ({
    revenue: { today: '', week: '', month: '', ytd: '', mcv: '', acv: '' },
    prospectingBlock: '',
    events: [],
    followUpBlock: '',
    winsToday: [],
    topTargets: Array.from({ length: 6 }, (_, i) => ({ id: `top-${i}-${Date.now()}`, text: '', completed: false })),
    massiveGoals: Array.from({ length: 6 }, (_, i) => ({ id: `massive-${i}-${Date.now()}`, text: '', completed: false })),
    aiChallenge: {
        quote: null,
        challenges: [],
        challengesAccepted: false,
        completedChallenges: [],
    },
    prospectingContacts: Array.from({ length: 200 }, (_, i) => ({
        id: `contact-${i}-${Date.now()}`,
        name: '', date: '', phone: '', email: '', interestLevel: 5, prospecting: {}
    })),
    milestones: {
      calls30Achieved: false,
    },
    talkTime: '',
    eodSubmitted: false,
});


//
// Utility Functions
//

export const followUpSchedule: Record<number, string> = {
    1: 'Call',
    2: 'Handwritten Letter',
    3: 'Text Video',
    4: 'Personal Visit',
    5: 'Thought of You',
    10: 'Event Offer',
    14: 'Informational Links',
    21: 'Video Email',
    30: 'Special Offer',
};


export const formatPhoneNumber = (value: string): string => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
        return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
};

export const formatTime12Hour = (time24: string): string => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours, 10);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
};

export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value);
};//
// Business Mastery Knowledge Base Types
//

export interface BusinessConcept {
  id: string;
  title: string;
  slug: string;
  category: 'sales' | 'marketing' | 'mindset' | 'leadership' | 'scripts';
  subcategory?: string;
  
  // AI-generated content
  definition?: string;
  why_it_matters?: string;
  key_principles?: Array<{ title: string; description: string }>;
  best_practices?: Array<{ title: string; description: string }>;
  common_mistakes?: Array<{ title: string; description: string }>;
  examples?: Array<{ scenario: string; dialogue: string }>;
  action_steps?: Array<{ step: number; description: string }>;
  scripts_templates?: string;
  expert_quotes?: Array<{ text: string; author: string }>;
  related_concepts?: string[];
  
  // Metadata
  search_keywords?: string[];
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  estimated_read_time?: number;
  
  // Tracking
  view_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ConceptNote {
  id: string;
  concept_id: string;
  user_id: string;
  assigned_to: string;
  company_id?: string;
  
  note_text: string;
  note_type: 'insight' | 'action' | 'example' | 'question' | 'goal' | 'metric';
  
  tags?: string[];
  linked_concepts?: string[];
  client_project?: string;
  
  created_at: string;
  updated_at: string;
}

export interface ImplementationStrategy {
  id: string;
  concept_id: string;
  user_id: string;
  assigned_to: string;
  company_id?: string;
  
  title: string;
  goal?: string;
  timeline: '1_week' | '1_month' | '3_months';
  target_audience?: string;
  current_skill_level?: 'beginner' | 'intermediate' | 'advanced';
  
  // AI-generated plan
  weekly_tasks?: Array<{
    week: number;
    tasks: Array<{ id: string; task: string; completed: boolean }>;
  }>;
  milestones?: Array<{ title: string; description: string; target_date?: string }>;
  metrics_to_track?: Array<{ metric: string; target?: string; current?: string }>;
  resources_needed?: string;
  potential_obstacles?: Array<{ obstacle: string; solution: string }>;
  content_opportunities?: Array<{ type: string; title: string; description: string }>;
  
  // Progress tracking
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
  progress_percentage: number;
  completed_tasks?: string[];
  
  // Dates
  start_date?: string;
  target_completion_date?: string;
  actual_completion_date?: string;
  
  created_at: string;
  updated_at: string;
}

export interface ConceptView {
  id: string;
  concept_id: string;
  user_id: string;
  assigned_to: string;
  company_id?: string;
  viewed_at: string;
  time_spent_seconds?: number;
}

// Category configuration for UI
export const CONCEPT_CATEGORIES = {
  sales: {
    label: 'Sales Mastery',
    icon: '📈',
    description: 'Master the art of selling and closing deals'
  },
  marketing: {
    label: 'Marketing Mastery',
    icon: '🎯',
    description: 'Build your brand and attract ideal clients'
  },
  mindset: {
    label: 'Mindset & Motivation',
    icon: '🧠',
    description: 'Develop the mindset of top performers'
  },
  leadership: {
    label: 'Leadership & Management',
    icon: '👥',
    description: 'Lead teams and build winning cultures'
  },
  scripts: {
    label: 'Scripts & Templates',
    icon: '💬',
    description: 'Ready-to-use scripts for every situation'
  }
} as const;

// Note type configuration for UI
export const NOTE_TYPES = {
  insight: { label: 'Key Insight', icon: '💡', color: 'blue' },
  action: { label: 'Action Item', icon: '✅', color: 'green' },
  example: { label: 'Personal Example', icon: '💬', color: 'purple' },
  question: { label: 'Question', icon: '❓', color: 'yellow' },
  goal: { label: 'Goal', icon: '🎯', color: 'red' },
  metric: { label: 'Metric', icon: '📊', color: 'indigo' }
} as const;
