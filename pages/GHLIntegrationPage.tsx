import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

interface GHLIntegrationPageProps {
  userId: string;
  companyId: string;
  userRole: string;
}

interface GHLIntegration {
  id: string;
  company_id: string;
  ghl_api_key: string;
  ghl_location_id: string | null;
  is_active: boolean;
  last_sync_at: string | null;
  created_at: string;
}

const GHLIntegrationPage: React.FC<GHLIntegrationPageProps> = ({
  userId,
  companyId,
  userRole,
}) => {
  const [integration, setIntegration] = useState<GHLIntegration | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [locationId, setLocationId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // Only admins can manage GHL integration
  const canManage = userRole === 'Admin';

  useEffect(() => {
    loadIntegration();
  }, [companyId]);

  const loadIntegration = async () => {
    try {
      const { data, error } = await supabase
        .from('ghl_integrations')
        .select('*')
        .eq('company_id', companyId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which is fine
        throw error;
      }

      if (data) {
        setIntegration(data);
        setLocationId(data.ghl_location_id || '');
      }
    } catch (error) {
      console.error('Error loading GHL integration:', error);
      setMessage({ type: 'error', text: 'Failed to load integration settings' });
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    if (!apiKey && !integration?.ghl_api_key) {
      setMessage({ type: 'error', text: 'Please enter an API key first' });
      return;
    }

    const testLocationId = locationId || integration?.ghl_location_id;
    if (!testLocationId) {
      setMessage({ type: 'error', text: 'Please enter a Location ID first' });
      return;
    }

    setIsTestingConnection(true);
    setMessage(null);

    try {
      // Test the connection by fetching the specific location
      const testKey = apiKey || integration?.ghl_api_key;
      const response = await fetch(`https://services.leadconnectorhq.com/locations/${testLocationId}`, {
        headers: {
          'Authorization': `Bearer ${testKey}`,
          'Version': '2021-07-28',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const locationName = data.location?.name || 'Unknown';
        setMessage({ 
          type: 'success', 
          text: `✅ Connection successful! Connected to location: ${locationName}` 
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMessage({ 
          type: 'error', 
          text: `❌ Connection failed: ${errorData.message || 'Invalid API key or Location ID'}` 
        });
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: `❌ Connection test failed: ${error.message || 'Network error'}` 
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const saveIntegration = async () => {
    if (!canManage) {
      setMessage({ type: 'error', text: 'Only admins can manage integrations' });
      return;
    }

    if (!apiKey) {
      setMessage({ type: 'error', text: 'API key is required' });
      return;
    }

    if (!locationId) {
      setMessage({ type: 'error', text: 'Location ID is required' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      if (integration) {
        // Update existing integration
        const { error } = await supabase
          .from('ghl_integrations')
          .update({
            ghl_api_key: apiKey,
            ghl_location_id: locationId || null,
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', integration.id);

        if (error) throw error;
      } else {
        // Create new integration
        const { error } = await supabase
          .from('ghl_integrations')
          .insert({
            company_id: companyId,
            ghl_api_key: apiKey,
            ghl_location_id: locationId || null,
            is_active: true,
          });

        if (error) throw error;
      }

      setMessage({ type: 'success', text: '✅ Integration saved successfully!' });
      await loadIntegration();
      setApiKey(''); // Clear the input after saving
    } catch (error: any) {
      console.error('Error saving integration:', error);
      setMessage({ type: 'error', text: `Failed to save: ${error.message}` });
    } finally {
      setIsSaving(false);
    }
  };

  const disconnectIntegration = async () => {
    if (!canManage || !integration) return;

    if (!confirm('Are you sure you want to disconnect GoHighLevel? This will stop all syncing.')) {
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('ghl_integrations')
        .update({ is_active: false })
        .eq('id', integration.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Integration disconnected' });
      await loadIntegration();
    } catch (error: any) {
      setMessage({ type: 'error', text: `Failed to disconnect: ${error.message}` });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading integration settings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2">GoHighLevel Integration</h1>
        <p className="text-gray-600 mb-8">
          Connect your GoHighLevel account to sync contacts, appointments, and revenue data.
        </p>

        {/* Connection Status */}
        {integration && (
          <div className={`mb-6 p-4 rounded-lg ${integration.is_active ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">
                  {integration.is_active ? '🟢 Connected' : '🔴 Disconnected'}
                </div>
                {integration.last_sync_at && (
                  <div className="text-sm text-gray-600">
                    Last synced: {new Date(integration.last_sync_at).toLocaleString()}
                  </div>
                )}
              </div>
              {canManage && integration.is_active && (
                <button
                  onClick={disconnectIntegration}
                  disabled={isSaving}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  Disconnect
                </button>
              )}
            </div>
          </div>
        )}

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {/* API Key Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GoHighLevel API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            disabled={!canManage}
            placeholder={integration ? '••••••••••••••••' : 'Enter your GHL Agency API Key'}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />
          <p className="mt-2 text-sm text-gray-600">
            Find this in your GHL account: <strong>Settings → API</strong>
          </p>
        </div>

        {/* Location ID Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sub-Account Location ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            disabled={!canManage}
            placeholder="Enter your GHL Location ID"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />
          <p className="mt-2 text-sm text-gray-600">
            Find this in your sub-account settings. Leave blank to use default location.
          </p>
        </div>

        {/* Action Buttons */}
        {canManage && (
          <div className="flex gap-4">
            <button
              onClick={testConnection}
              disabled={isTestingConnection || (!apiKey && !integration)}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTestingConnection ? 'Testing...' : 'Test Connection'}
            </button>
            <button
              onClick={saveIntegration}
              disabled={isSaving || !apiKey || !locationId}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : integration ? 'Update Integration' : 'Save Integration'}
            </button>
          </div>
        )}

        {!canManage && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              ⚠️ Only administrators can manage the GoHighLevel integration. Please contact your admin.
            </p>
          </div>
        )}

        {/* How It Works Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-xl font-bold mb-4">How It Works</h2>
          <div className="space-y-4 text-gray-700">
            <div className="flex items-start">
              <span className="text-2xl mr-3">📝</span>
              <div>
                <strong>Add Prospects in MAT</strong> → Automatically creates contacts in GoHighLevel with <code className="bg-gray-100 px-2 py-1 rounded">mat-prospect</code> tag
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">📞</span>
              <div>
                <strong>Log Calls/Emails</strong> → Adds notes to the contact's activity timeline in GHL
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">📅</span>
              <div>
                <strong>Set Appointments</strong> → Syncs to GHL calendar and your Google Calendar
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">💰</span>
              <div>
                <strong>Close Deals in GHL</strong> → Revenue automatically updates in MAT dashboard
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GHLIntegrationPage;
