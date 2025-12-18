/**
 * useGHLSync Hook
 * Automatically syncs clients and activities to GoHighLevel
 */

import { useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { syncClientToGHL, logActivityToGHL, createAppointmentInGHL } from '../services/ghlSyncService';

interface UseGHLSyncOptions {
  companyId: string;
  enabled?: boolean;
}

export function useGHLSync({ companyId, enabled = true }: UseGHLSyncOptions) {
  /**
   * Check if GHL integration is active for this company
   */
  const checkIntegrationActive = useCallback(async (): Promise<boolean> => {
    if (!enabled) return false;

    try {
      const { data, error } = await supabase
        .from('ghl_integrations')
        .select('is_active')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .single();

      return !error && data?.is_active === true;
    } catch (error) {
      console.error('Error checking GHL integration:', error);
      return false;
    }
  }, [companyId, enabled]);

  /**
   * Sync a client to GHL (call this after creating/updating a client)
   */
  const syncClient = useCallback(async (clientId: string): Promise<boolean> => {
    const isActive = await checkIntegrationActive();
    if (!isActive) return false;

    try {
      await syncClientToGHL(clientId);
      console.log(`✅ Client ${clientId} synced to GHL`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to sync client ${clientId} to GHL:`, error);
      return false;
    }
  }, [checkIntegrationActive]);

  /**
   * Log an activity to GHL (call this after logging a call/email/text)
   */
  const logActivity = useCallback(async (activityId: string): Promise<boolean> => {
    const isActive = await checkIntegrationActive();
    if (!isActive) return false;

    try {
      await logActivityToGHL(activityId);
      console.log(`✅ Activity ${activityId} logged to GHL`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to log activity ${activityId} to GHL:`, error);
      return false;
    }
  }, [checkIntegrationActive]);

  /**
   * Create an appointment in GHL (call this after creating an appointment)
   */
  const createAppointment = useCallback(async (appointmentId: string): Promise<boolean> => {
    const isActive = await checkIntegrationActive();
    if (!isActive) return false;

    try {
      await createAppointmentInGHL(appointmentId);
      console.log(`✅ Appointment ${appointmentId} created in GHL`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to create appointment ${appointmentId} in GHL:`, error);
      return false;
    }
  }, [checkIntegrationActive]);

  /**
   * Sync all pending clients (useful for bulk sync or retry)
   */
  const syncPendingClients = useCallback(async (): Promise<number> => {
    const isActive = await checkIntegrationActive();
    if (!isActive) return 0;

    try {
      const { data: clients, error } = await supabase
        .from('clients')
        .select('id')
        .eq('company_id', companyId)
        .or('sync_status.is.null,sync_status.eq.pending,sync_status.eq.error');

      if (error || !clients) {
        throw new Error('Failed to fetch pending clients');
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

      console.log(`✅ Synced ${syncedCount} of ${clients.length} pending clients to GHL`);
      return syncedCount;
    } catch (error) {
      console.error('❌ Failed to sync pending clients:', error);
      return 0;
    }
  }, [companyId, checkIntegrationActive]);

  return {
    syncClient,
    logActivity,
    createAppointment,
    syncPendingClients,
    checkIntegrationActive,
  };
}

export default useGHLSync;
