import React, { useMemo } from 'react';
import { Contact, CalendarEvent } from '../types';

interface ProspectingKPIsProps {
  contacts: Contact[];
  events: CalendarEvent[];
}

const ProspectingKPIs: React.FC<ProspectingKPIsProps> = ({ contacts, events }) => {
  const metrics = useMemo(() => {
    const callsMade = contacts.filter(
      (c) => c.prospecting.SW || c.prospecting.NA || c.prospecting.LM
    ).length;

    const textsSent = contacts.filter((c) => c.prospecting.ST).length;
    const emailsSent = contacts.filter((c) => c.prospecting.EP).length;

    // 🔴 UPDATED: Appointments Set now counted from calendar events,
    // so Day View + Prospecting Page both feed this KPI.
    const apptsSet = (events || []).filter(
      (e) => e.type === 'Appointment'
    ).length;

    const demosHeld = (events || []).filter(
      (e) => e.type === 'Appointment' && e.conducted
    ).length;

    // Count any contact with at least one non-empty piece of information
    const prospectsCollected = contacts.filter(
      (c) => (c.name && c.name.trim()) || 
             (c.company && c.company.trim()) || 
             (c.phone && c.phone.trim()) || 
             (c.email && c.email.trim())
    ).length;

    return { callsMade, textsSent, emailsSent, apptsSet, demosHeld, prospectsCollected };
  }, [contacts, events]);

  return (
    <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
      <h3 className="text-lg font-bold mb-4 bg-brand-gray/80 text-white p-2 rounded text-center">
        DAILY PROSPECTING KPIS
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
        <div className="text-center">
          <p className="text-3xl font-black text-brand-lime">{metrics.callsMade}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Calls Made</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-black text-brand-lime">{metrics.apptsSet}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Appointments Set</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-black text-brand-lime">{metrics.demosHeld}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Demos Held</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-black text-brand-lime">{metrics.textsSent}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Texts Sent</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-black text-brand-lime">{metrics.emailsSent}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Emails Sent</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-black text-brand-lime">{metrics.prospectsCollected}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Prospects Collected</p>
        </div>
      </div>
    </div>
  );
};

export default ProspectingKPIs;
