/**
 * GHL Sync Service
 * Handles synchronization between MAT and GoHighLevel
 */

import { supabase } from './supabaseClient';
import { createGHLService, GHLContact } from './ghlService';

interface Client {
  id: string;
  user_id: string;
  company_id: string;
  name: string;
  email?: string;
  phone?: string;
  status?: string;
  ghl_contact_id?: string;
  last_synced_to_ghl?: string;
  sync_status?: string;
}

interface Activity {
  id: string;
  user_id: string;
  company_id: string;
  client_id: string;
  activity_type: string;
  activity_date: string;
  notes?: string;
}

/**
 * Get GHL integration for a company
 */
async function getGHLIntegration(companyId: string) {
  const { data, error } = await supabase
    .from('ghl_integrations')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    throw new Error('GHL integration not found or inactive');
  }

  return data;
}

/**
 * Sync a client/prospect from MAT to GHL
 */
export async function syncClientToGHL(clientId: string): Promise<string> {
  try {
    // Get client data
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      throw new Error('Client not found');
    }

    // Get GHL integration
    const integration = await getGHLIntegration(client.company_id);
    const ghlService = createGHLService(integration.ghl_api_key, integration.ghl_location_id);

    // Prepare contact data
    const nameParts = client.name.split(' ');
    const contactData: GHLContact = {
      firstName: nameParts[0],
      lastName: nameParts.slice(1).join(' ') || nameParts[0],
      email: client.email,
      phone: client.phone,
      tags: ['mat-prospect'],
      locationId: integration.ghl_location_id,
    };

    let ghlContactId: string;

    if (client.ghl_contact_id) {
      // Update existing contact
      const response = await ghlService.updateContact(client.ghl_contact_id, contactData);
      ghlContactId = response.contact.id!;
    } else {
      // Create new contact
      const response = await ghlService.createContact(contactData);
      ghlContactId = response.contact.id!;

      // Save GHL contact ID back to MAT
      await supabase
        .from('clients')
        .update({
          ghl_contact_id: ghlContactId,
          last_synced_to_ghl: new Date().toISOString(),
          sync_status: 'synced',
        })
        .eq('id', clientId);
    }

    // Update last sync time
    await supabase
      .from('ghl_integrations')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('company_id', client.company_id);

    return ghlContactId;
  } catch (error: any) {
    console.error('Error syncing client to GHL:', error);
    
    // Update sync status to error
    await supabase
      .from('clients')
      .update({ sync_status: 'error' })
      .eq('id', clientId);

    throw error;
  }
}

/**
 * Log an activity to GHL as a note
 */
export async function logActivityToGHL(activityId: string): Promise<void> {
  try {
    // Get activity data
    const { data: activity, error: activityError } = await supabase
      .from('activities')
      .select('*, clients(*)')
      .eq('id', activityId)
      .single();

    if (activityError || !activity) {
      throw new Error('Activity not found');
    }

    const client = activity.clients;
    if (!client || !client.ghl_contact_id) {
      throw new Error('Client not synced to GHL');
    }

    // Get GHL integration
    const integration = await getGHLIntegration(activity.company_id);
    const ghlService = createGHLService(integration.ghl_api_key, integration.ghl_location_id);

    // Create note in GHL
    const noteBody = `[MAT] ${activity.activity_type.toUpperCase()} logged on ${activity.activity_date}${activity.notes ? `\n\n${activity.notes}` : ''}`;
    
    await ghlService.addNote({
      contactId: client.ghl_contact_id,
      body: noteBody,
    });

    console.log(`Activity logged to GHL for contact ${client.ghl_contact_id}`);
  } catch (error) {
    console.error('Error logging activity to GHL:', error);
    throw error;
  }
}

/**
 * Create an appointment in GHL
 */
export async function createAppointmentInGHL(appointmentId: string): Promise<string> {
  try {
    // Get appointment data
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('*, clients(*)')
      .eq('id', appointmentId)
      .single();

    if (appointmentError || !appointment) {
      throw new Error('Appointment not found');
    }

    const client = appointment.clients;
    if (!client || !client.ghl_contact_id) {
      throw new Error('Client not synced to GHL');
    }

    // Get GHL integration
    const integration = await getGHLIntegration(appointment.company_id);
    const ghlService = createGHLService(integration.ghl_api_key, integration.ghl_location_id);

    // Get first available calendar
    const calendarsResponse = await ghlService.getCalendars();
    const calendar = calendarsResponse.calendars?.[0];
    
    if (!calendar) {
      throw new Error('No calendars found in GHL');
    }

    // Create appointment in GHL
    const ghlAppointment = await ghlService.createAppointment({
      calendarId: calendar.id,
      contactId: client.ghl_contact_id,
      startTime: appointment.start_time,
      endTime: appointment.end_time,
      title: appointment.title,
    });

    const eventId = ghlAppointment.event.id;

    // Save GHL event ID back to MAT
    await supabase
      .from('appointments')
      .update({ ghl_event_id: eventId })
      .eq('id', appointmentId);

    return eventId;
  } catch (error) {
    console.error('Error creating appointment in GHL:', error);
    throw error;
  }
}

/**
 * Sync all pending clients for a company
 */
export async function syncAllPendingClients(companyId: string): Promise<number> {
  try {
    // Get all clients that haven't been synced or have errors
    const { data: clients, error } = await supabase
      .from('clients')
      .select('id')
      .eq('company_id', companyId)
      .in('sync_status', ['pending', 'error', null]);

    if (error || !clients) {
      throw new Error('Failed to fetch clients');
    }

    let syncedCount = 0;
    for (const client of clients) {
      try {
        await syncClientToGHL(client.id);
        syncedCount++;
      } catch (error) {
        console.error(`Failed to sync client ${client.id}:`, error);
      }
    }

    return syncedCount;
  } catch (error) {
    console.error('Error syncing all clients:', error);
    throw error;
  }
}

export default {
  syncClientToGHL,
  logActivityToGHL,
  createAppointmentInGHL,
  syncAllPendingClients,
};
