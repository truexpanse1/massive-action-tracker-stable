
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
  | 'scorecard-dashboard';

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
};