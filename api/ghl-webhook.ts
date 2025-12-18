/**
 * GHL Webhook Handler
 * Receives webhooks from GoHighLevel and updates MAT data
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body;
    const eventType = payload.type || payload.event_type;

    console.log('GHL Webhook received:', eventType);

    // Log the webhook for debugging
    await supabase.from('webhook_logs').insert({
      event_type: eventType,
      payload: payload,
      processed: false,
    });

    // Route to appropriate handler based on event type
    switch (eventType) {
      case 'AppointmentCreate':
      case 'AppointmentUpdate':
        await handleAppointmentEvent(payload);
        break;

      case 'OpportunityStatusChange':
      case 'OpportunityUpdate':
        await handleOpportunityEvent(payload);
        break;

      case 'ContactDelete':
        await handleContactDelete(payload);
        break;

      default:
        console.log('Unhandled event type:', eventType);
    }

    // Mark webhook as processed
    await supabase
      .from('webhook_logs')
      .update({ processed: true })
      .eq('payload', payload);

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    
    // Log error
    await supabase
      .from('webhook_logs')
      .update({ 
        processed: false,
        error_message: error.message 
      })
      .eq('payload', req.body);

    return res.status(500).json({ error: error.message });
  }
}

/**
 * Handle appointment creation/update from GHL
 */
async function handleAppointmentEvent(payload: any) {
  const eventId = payload.id || payload.event_id;
  const contactId = payload.contact_id || payload.contactId;
  const startTime = payload.start_time || payload.startTime;
  const endTime = payload.end_time || payload.endTime;
  const title = payload.title || 'Appointment';
  const status = payload.appointment_status || payload.status || 'scheduled';

  // Find the client in MAT by GHL contact ID
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('ghl_contact_id', contactId)
    .single();

  if (!client) {
    console.log('Client not found for GHL contact:', contactId);
    return;
  }

  // Check if appointment already exists
  const { data: existingAppointment } = await supabase
    .from('appointments')
    .select('id')
    .eq('ghl_event_id', eventId)
    .single();

  if (existingAppointment) {
    // Update existing appointment
    await supabase
      .from('appointments')
      .update({
        start_time: startTime,
        end_time: endTime,
        title: title,
        status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingAppointment.id);

    console.log('Updated appointment:', existingAppointment.id);
  } else {
    // Create new appointment
    await supabase.from('appointments').insert({
      user_id: client.user_id,
      company_id: client.company_id,
      client_id: client.id,
      title: title,
      start_time: startTime,
      end_time: endTime,
      status: status,
      ghl_event_id: eventId,
    });

    console.log('Created new appointment for client:', client.id);
  }
}

/**
 * Handle opportunity status change (deal won/lost)
 */
async function handleOpportunityEvent(payload: any) {
  const opportunityId = payload.id || payload.opportunity_id;
  const contactId = payload.contact_id || payload.contactId;
  const status = payload.status;
  const monetaryValue = payload.monetary_value || payload.value || 0;
  const name = payload.name || 'Deal';

  // Find the client in MAT
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('ghl_contact_id', contactId)
    .single();

  if (!client) {
    console.log('Client not found for GHL contact:', contactId);
    return;
  }

  // Check if revenue record already exists
  const { data: existingRevenue } = await supabase
    .from('revenue_tracking')
    .select('id')
    .eq('ghl_opportunity_id', opportunityId)
    .single();

  const revenueData = {
    user_id: client.user_id,
    company_id: client.company_id,
    client_id: client.id,
    deal_amount: monetaryValue,
    deal_status: status.toLowerCase(),
    closed_date: status === 'won' ? new Date().toISOString().split('T')[0] : null,
    ghl_opportunity_id: opportunityId,
    product_name: name,
  };

  if (existingRevenue) {
    // Update existing revenue record
    await supabase
      .from('revenue_tracking')
      .update({
        ...revenueData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingRevenue.id);

    console.log('Updated revenue record:', existingRevenue.id);
  } else {
    // Create new revenue record
    await supabase.from('revenue_tracking').insert(revenueData);

    console.log('Created new revenue record for client:', client.id);
  }

  // If deal is won, update client status
  if (status === 'won') {
    await supabase
      .from('clients')
      .update({ status: 'customer' })
      .eq('id', client.id);
  }
}

/**
 * Handle contact deletion from GHL
 */
async function handleContactDelete(payload: any) {
  const contactId = payload.contact_id || payload.contactId;

  // Find and soft-delete the client in MAT
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('ghl_contact_id', contactId)
    .single();

  if (client) {
    await supabase
      .from('clients')
      .update({ 
        status: 'deleted',
        ghl_contact_id: null 
      })
      .eq('id', client.id);

    console.log('Marked client as deleted:', client.id);
  }
}
