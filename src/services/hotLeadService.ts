import { Contact, DayData } from '@/types';

// Placeholder for the global state or database access functions
const getDayData = (): DayData => {
    // Mock function to get today's data
    // NOTE: In a real app, this would fetch the actual DayData for today
    return {
        revenue: { today: '', week: '', month: '', ytd: '', mcv: '', acv: '' },
        prospectingBlock: '',
        events: [],
        followUpBlock: '',
        winsToday: [],
        topTargets: [],
        massiveGoals: [],
        aiChallenge: { quote: null, challenges: [], challengesAccepted: false, completedChallenges: [] },
        prospectingContacts: [],
        milestones: { calls30Achieved: false, newHotLeadsToday: 0 },
        talkTime: '',
        eodSubmitted: false,
    };
};

const updateDayData = (data: DayData) => {
    // Mock function to update today's data (e.g., to a database)
    console.log('DayData updated:', data);
};

const updateContact = (contact: Contact) => {
    // Mock function to update the contact in the database
    console.log('Contact updated:', contact);
};

/**
 * Marks a contact as a hot lead, updates the daily KPI, and syncs with EOD data.
 * @param contact The contact to mark as hot.
 */
export const markLeadAsHot = (contact: Contact): Contact => {
    // 1. Update Contact
    const updatedContact: Contact = {
        ...contact,
        isHot: true,
        hotLeadDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    };
    updateContact(updatedContact);

    // 2. Update Daily KPI (newHotLeadsToday)
    const todayData = getDayData();
    todayData.milestones.newHotLeadsToday += 1;
    updateDayData(todayData);

    // 3. EOD Report Synchronization (Implicit)
    // The EOD Report will simply read the 'newHotLeadsToday' KPI from the DayData.

    return updatedContact;
};

/**
 * Marks a contact as not hot.
 * @param contact The contact to mark as not hot.
 */
export const markLeadAsNotHot = (contact: Contact): Contact => {
    const updatedContact: Contact = {
        ...contact,
        isHot: false,
        hotLeadDate: undefined,
    };
    updateContact(updatedContact);
    return updatedContact;
};
