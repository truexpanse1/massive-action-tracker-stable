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

export interface GHLInvoice {
  id?: string;
  contactId?: string;
  name?: string;
  title?: string;
  businessName?: string;
  currency?: string;
  status?: string; // draft, sent, paid, void
  total?: number;
  amountDue?: number;
  amountPaid?: number;
  invoiceDate?: string;
  dueDate?: string;
  items?: Array<{
    name?: string;
    description?: string;
    price?: number;
    qty?: number;
  }>;
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
   * Get all contacts for a location (with pagination)
   */
  async getAllContacts(limit: number = 100, startAfterId?: string): Promise<{ contacts: GHLContact[]; meta: { total: number; nextStartAfterId?: string } }> {
    let endpoint = `/contacts/?locationId=${this.locationId}&limit=${limit}`;
    if (startAfterId) {
      endpoint += `&startAfterId=${startAfterId}`;
    }
    return this.makeRequest<{ contacts: GHLContact[]; meta: { total: number; nextStartAfterId?: string } }>(endpoint);
  }

  /**
   * Import all contacts from GHL (handles pagination automatically)
   */
  async importAllContacts(): Promise<GHLContact[]> {
    const allContacts: GHLContact[] = [];
    let startAfterId: string | undefined;
    let hasMore = true;

    while (hasMore) {
      const response = await this.getAllContacts(100, startAfterId);
      allContacts.push(...response.contacts);
      
      if (response.meta.nextStartAfterId) {
        startAfterId = response.meta.nextStartAfterId;
      } else {
        hasMore = false;
      }
    }

    return allContacts;
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
   * Get all opportunities for a contact
   */
  async getContactOpportunities(contactId: string): Promise<{ opportunities: GHLOpportunity[] }> {
    return this.makeRequest<{ opportunities: GHLOpportunity[] }>(
      `/contacts/${contactId}/opportunities`
    );
  }

  /**
   * Search opportunities by location
   */
  async searchOpportunities(pipelineId?: string, status?: string): Promise<{ opportunities: GHLOpportunity[] }> {
    let endpoint = `/opportunities/search?locationId=${this.locationId}`;
    if (pipelineId) {
      endpoint += `&pipelineId=${pipelineId}`;
    }
    if (status) {
      endpoint += `&status=${status}`;
    }
    return this.makeRequest<{ opportunities: GHLOpportunity[] }>(endpoint);
  }

  /**
   * INVOICES
   */

  /**
   * Get invoices for a contact
   */
  async getContactInvoices(contactId: string): Promise<{ invoices: GHLInvoice[] }> {
    return this.makeRequest<{ invoices: GHLInvoice[] }>(
      `/invoices/?altId=${contactId}&altType=contact`
    );
  }

  /**
   * Get all invoices for location
   */
  async getInvoices(limit: number = 100, offset: number = 0, status?: string): Promise<{ invoices: GHLInvoice[], total: number }> {
    // Build query parameters according to GHL API v2 spec
    const params = new URLSearchParams({
      altId: this.locationId,
      altType: 'location',
      limit: limit.toString(),
      offset: offset.toString(),
    });
    
    // Add optional status filter
    if (status) {
      params.append('status', status);
    }
    
    return this.makeRequest<{ invoices: GHLInvoice[], total: number }>(
      `/invoices/?${params.toString()}`
    );
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(invoiceId: string): Promise<{ invoice: GHLInvoice }> {
    return this.makeRequest<{ invoice: GHLInvoice }>(
      `/invoices/${invoiceId}`
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

  /**
   * MEDIA LIBRARY
   */

  /**
   * Upload file to GHL Media Library
   */
  async uploadMedia(file: File | Blob, fileName: string, folder?: string): Promise<{ fileId: string; url: string }> {
    const formData = new FormData();
    formData.append('file', file, fileName);
    
    if (folder) {
      formData.append('folder', folder);
    }

    const url = `${GHL_API_BASE_URL}/medias/upload-file`;
    
    const headers: HeadersInit = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Version': '2021-07-28',
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GHL Media Upload Error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      return {
        fileId: data.fileId || data.id,
        url: data.url || data.fileUrl,
      };
    } catch (error) {
      console.error('GHL Media Upload Failed:', error);
      throw error;
    }
  }

  /**
   * Upload file from URL to GHL Media Library
   */
  async uploadMediaFromUrl(imageUrl: string, fileName: string, folder?: string): Promise<{ fileId: string; url: string }> {
    // Fetch the image
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    // Upload to GHL
    return this.uploadMedia(blob, fileName, folder);
  }

  /**
   * Get media files from library
   */
  async getMediaFiles(folder?: string): Promise<{ files: any[] }> {
    let endpoint = `/medias/?locationId=${this.locationId}`;
    if (folder) {
      endpoint += `&folder=${encodeURIComponent(folder)}`;
    }
    return this.makeRequest<{ files: any[] }>(endpoint);
  }

  /**
   * Delete media file
   */
  async deleteMedia(fileId: string): Promise<void> {
    await this.makeRequest(`/medias/${fileId}`, 'DELETE');
  }
}

/**
 * Helper function to create GHL service instance
 */
export function createGHLService(apiKey: string, locationId?: string): GHLService {
  return new GHLService(apiKey, locationId);
}

export default GHLService;
