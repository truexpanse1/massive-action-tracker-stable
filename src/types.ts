// src/types.ts

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
  | 'ai-content'
  | 'coaching'
  | 'team-control'
  | 'performance-dashboard'
  | 'eod-report'
  | 'account-settings'
  | 'ghl-integration'
  | 'dream-avatars'
  | 'scorecard-dashboard';

export type Role = 'Sales Rep' | 'Manager';
export type UserStatus = 'Active' | 'Inactive';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  company_id?: string;
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
  conducted?: boolean;
}

export interface Goal {
  id: string;
  text: string;
  completed: boolean;
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
  isHot?: boolean; // ADDED FOR HOT LEADS
  hotLeadDate?: string; // ADDED FOR HOT LEADS
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
    salesProcessLength: string;
    monthlyContractValue: number;
    initialAmountCollected: number;
    closeDate: string; // YYYY-MM-DD
    stage: string;
    userId?: string;
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
      newHotLeadsToday: number; // ADDED FOR HOT LEADS KPI
    };
    talkTime: string;
    eodSubmitted?: boolean;
    userId?: string;
}

export const getInitialDayData = (): DayData => ({
  revenue: { today: '', week: '', month: '', ytd: '', mcv: '', acv: '' },
  prospectingBlock: '',
  events: [],
  followUpBlock: '',
  winsToday: [],

  // 🔥 FIXED: Stable IDs for Top Targets
  topTargets: Array.from({ length: 6 }, (_, i) => ({
    id: `top-${i + 1}`,
    text: '',
    completed: false,
  })),

  // 🔥 FIXED: Stable IDs for Massive Goals
  massiveGoals: Array.from({ length: 6 }, (_, i) => ({
    id: `massive-${i + 1}`,
    text: '',
    completed: false,
  })),

  aiChallenge: {
    quote: null,
    challenges: [],
    challengesAccepted: false,
    completedChallenges: [],
  },

  // 🔥 FIXED: DO NOT USE Date.now() for contacts either
  prospectingContacts: Array.from({ length: 200 }, (_, i) => ({
    id: `contact-${i + 1}`,
    name: '',
    date: '',
    phone: '',
    email: '',
    interestLevel: 5,
    prospecting: {},
  })),

  milestones: {
    calls30Achieved: false,
    newHotLeadsToday: 0, // INITIALIZED FOR HOT LEADS KPI
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
};
