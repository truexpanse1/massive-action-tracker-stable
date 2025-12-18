/**
 * GoHighLevel API Service
 * Handles all API interactions with GoHighLevel platform
 */

const GHL_API_BASE_URL = 'https://services.leadconnectorhq.com';

export interface GHLContact {
  id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  locationId?: string;
}

export interface GHLAppointment {
  id?: string;
  contactId: string;
  calendarId: string;
  startTime: string; // ISO 8601 format
  endTime: string;
  title: string;
  appointmentStatus?: string;
}

export interface GHLNote {
  id?: string;
  contactId: string;
  body: string;
  userId?: string;
}

export interface GHLOpportunity {
  id?: string;
  contactId: string;
  name: string;
  monetaryValue?: number;
  status: string; // open, won, lost, abandoned
  pipelineId: string;
  pipelineStageId: string;
}

class GHLService {
  private apiKey: string;
  private locationId?: string;

  constructor(apiKey: string, locationId?: string) {
    this.apiKey = apiKey;
    this.locationId = locationId;
  }

  /**
   * Make authenticated request to GHL API
   */
  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<T> {
    const url = `${GHL_API_BASE_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28', // GHL API version
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GHL API Error (${response.status}): ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('GHL API Request Failed:', error);
      throw error;
    }
  }

  /**
   * CONTACTS
   */

  /**
   * Create a new contact in GHL
   */
  async createContact(contact: GHLContact): Promise<{ contact: GHLContact }> {
    const payload = {
      ...contact,
      locationId: this.locationId || contact.locationId,
    };

    return this.makeRequest<{ contact: GHLContact }>(
      '/contacts/',
      'POST',
      payload
    );
  }

  /**
   * Get contact by ID
   */
  async getContact(contactId: string): Promise<{ contact: GHLContact }> {
    return this.makeRequest<{ contact: GHLContact }>(
      `/contacts/${contactId}`
    );
  }

  /**
   * Update existing contact
   */
  async updateContact(contactId: string, updates: Partial<GHLContact>): Promise<{ contact: GHLContact }> {
    return this.makeRequest<{ contact: GHLContact }>(
      `/contacts/${contactId}`,
      'PUT',
      updates
    );
  }

  /**
   * Delete contact
   */
  async deleteContact(contactId: string): Promise<void> {
    await this.makeRequest(`/contacts/${contactId}`, 'DELETE');
  }

  /**
   * Search contacts by email or phone
   */
  async searchContacts(query: string): Promise<{ contacts: GHLContact[] }> {
    return this.makeRequest<{ contacts: GHLContact[] }>(
      `/contacts/?locationId=${this.locationId}&query=${encodeURIComponent(query)}`
    );
  }

  /**
   * NOTES / ACTIVITIES
   */

  /**
   * Add a note to a contact
   */
  async addNote(note: GHLNote): Promise<{ note: GHLNote }> {
    return this.makeRequest<{ note: GHLNote }>(
      `/contacts/${note.contactId}/notes`,
      'POST',
      { body: note.body, userId: note.userId }
    );
  }

  /**
   * APPOINTMENTS / CALENDAR
   */

  /**
   * Get available calendars for the location
   */
  async getCalendars(): Promise<{ calendars: any[] }> {
    return this.makeRequest<{ calendars: any[] }>(
      `/calendars/?locationId=${this.locationId}`
    );
  }

  /**
   * Create an appointment
   */
  async createAppointment(appointment: GHLAppointment): Promise<{ event: any }> {
    const payload = {
      calendarId: appointment.calendarId,
      contactId: appointment.contactId,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      title: appointment.title,
      appointmentStatus: appointment.appointmentStatus || 'confirmed',
    };

    return this.makeRequest<{ event: any }>(
      `/calendars/${appointment.calendarId}/events`,
      'POST',
      payload
    );
  }

  /**
   * Get appointment by ID
   */
  async getAppointment(eventId: string): Promise<{ event: any }> {
    return this.makeRequest<{ event: any }>(
      `/calendars/events/${eventId}`
    );
  }

  /**
   * Update appointment status
   */
  async updateAppointment(eventId: string, updates: Partial<GHLAppointment>): Promise<{ event: any }> {
    return this.makeRequest<{ event: any }>(
      `/calendars/events/${eventId}`,
      'PUT',
      updates
    );
  }

  /**
   * OPPORTUNITIES / DEALS
   */

  /**
   * Create an opportunity
   */
  async createOpportunity(opportunity: GHLOpportunity): Promise<{ opportunity: GHLOpportunity }> {
    return this.makeRequest<{ opportunity: GHLOpportunity }>(
      `/opportunities/`,
      'POST',
      opportunity
    );
  }

  /**
   * Update opportunity status
   */
  async updateOpportunity(opportunityId: string, updates: Partial<GHLOpportunity>): Promise<{ opportunity: GHLOpportunity }> {
    return this.makeRequest<{ opportunity: GHLOpportunity }>(
      `/opportunities/${opportunityId}`,
      'PUT',
      updates
    );
  }

  /**
   * Get opportunity by ID
   */
  async getOpportunity(opportunityId: string): Promise<{ opportunity: GHLOpportunity }> {
    return this.makeRequest<{ opportunity: GHLOpportunity }>(
      `/opportunities/${opportunityId}`
    );
  }

  /**
   * WEBHOOKS
   */

  /**
   * Create a webhook subscription
   */
  async createWebhook(url: string, events: string[]): Promise<any> {
    const payload = {
      url,
      events,
      locationId: this.locationId,
    };

    return this.makeRequest<any>(
      `/webhooks/`,
      'POST',
      payload
    );
  }

  /**
   * List all webhooks
   */
  async listWebhooks(): Promise<{ webhooks: any[] }> {
    return this.makeRequest<{ webhooks: any[] }>(
      `/webhooks/?locationId=${this.locationId}`
    );
  }

  /**
   * Delete a webhook
   */
  async deleteWebhook(webhookId: string): Promise<void> {
    await this.makeRequest(`/webhooks/${webhookId}`, 'DELETE');
  }
}

/**
 * Helper function to create GHL service instance
 */
export function createGHLService(apiKey: string, locationId?: string): GHLService {
  return new GHLService(apiKey, locationId);
}

export default GHLService;
