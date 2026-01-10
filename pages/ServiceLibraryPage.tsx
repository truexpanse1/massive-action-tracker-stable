// ServiceLibraryPage.tsx - Manage service packages for proposals
import React, { useState, useEffect } from 'react';
import { User } from '../src/types';
import {
  fetchServicePackages,
  createServicePackage,
  ServicePackage,
} from '../src/services/proposalService';
import { supabase } from '../src/services/supabaseClient';

interface ServiceLibraryPageProps {
  user: User;
}

interface ServiceItem {
  name: string;
  description: string;
}

const ServiceLibraryPage: React.FC<ServiceLibraryPageProps> = ({ user }) => {
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [packageName, setPackageName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [pricingModel, setPricingModel] = useState<'monthly' | 'one-time' | 'annual'>('monthly');
  const [price, setPrice] = useState<number>(0);
  const [services, setServices] = useState<ServiceItem[]>([{ name: '', description: '' }]);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const data = await fetchServicePackages(user.company_id);
      setPackages(data);
    } catch (err) {
      console.error('Error loading packages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = () => {
    setServices([...services, { name: '', description: '' }]);
  };

  const handleRemoveService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const handleServiceChange = (index: number, field: 'name' | 'description', value: string) => {
    const updated = [...services];
    updated[index][field] = value;
    setServices(updated);
  };

  const handleCreatePackage = async () => {
    if (!packageName.trim() || services.length === 0 || !services[0].name.trim()) {
      alert('Please provide a package name and at least one service');
      return;
    }

    setIsCreating(true);
    try {
      await createServicePackage({
        company_id: user.company_id,
        user_id: user.id,
        package_name: packageName,
        description: description || null,
        category: category || null,
        pricing_model: pricingModel,
        price,
        services: services.filter(s => s.name.trim()),
        is_template: true,
        is_active: true,
      });

      // Reset form
      setPackageName('');
      setDescription('');
      setCategory('');
      setPrice(0);
      setServices([{ name: '', description: '' }]);
      setShowForm(false);

      // Reload packages
      await loadPackages();
      alert('✅ Service package created successfully!');
    } catch (err) {
      console.error('Error creating package:', err);
      alert('Failed to create package. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;

    try {
      const { error } = await supabase
        .from('service_packages')
        .delete()
        .eq('id', packageId);

      if (error) throw error;

      await loadPackages();
      alert('Package deleted successfully');
    } catch (err) {
      console.error('Error deleting package:', err);
      alert('Failed to delete package');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading service packages...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-brand-light-card dark:bg-brand-navy p-6 rounded-lg border border-brand-light-border dark:border-brand-gray mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-brand-light-text dark:text-white">
              Service Library
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your service packages for AI-powered proposals
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {showForm ? 'Cancel' : 'Add Service Package'}
          </button>
        </div>
      </div>

      {/* Create Package Form */}
      {showForm && (
        <div className="bg-brand-light-card dark:bg-brand-navy p-6 rounded-lg border border-brand-light-border dark:border-brand-gray mb-6">
          <h2 className="text-xl font-bold text-brand-light-text dark:text-white mb-6">
            Create New Service Package
          </h2>

          <div className="space-y-6">
            {/* Package Name */}
            <div>
              <label className="block text-sm font-medium text-brand-light-text dark:text-white mb-2">
                Package Name *
              </label>
              <input
                type="text"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-brand-light-text dark:text-white"
                placeholder="e.g., Complete Marketing Package, Executive Coaching Program"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-brand-light-text dark:text-white mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-brand-light-text dark:text-white"
                rows={3}
                placeholder="Brief overview of what this package includes..."
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-brand-light-text dark:text-white mb-2">
                Category (Optional)
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-brand-light-text dark:text-white"
                placeholder="e.g., Marketing, Coaching, Consulting"
              />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-light-text dark:text-white mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-brand-light-text dark:text-white"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-light-text dark:text-white mb-2">
                  Pricing Model *
                </label>
                <select
                  value={pricingModel}
                  onChange={(e) => setPricingModel(e.target.value as any)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-brand-light-text dark:text-white"
                >
                  <option value="monthly">Monthly</option>
                  <option value="one-time">One-time</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
            </div>

            {/* Services */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-brand-light-text dark:text-white">
                  Services Included *
                </label>
                <button
                  onClick={handleAddService}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Service
                </button>
              </div>

              <div className="space-y-4">
                {services.map((service, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Service {index + 1}
                      </span>
                      {services.length > 1 && (
                        <button
                          onClick={() => handleRemoveService(index)}
                          className="text-red-500 hover:text-red-600 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={service.name}
                      onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-brand-light-text dark:text-white mb-2"
                      placeholder="Service name (e.g., Facebook Ads Management)"
                    />
                    <textarea
                      value={service.description}
                      onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-brand-light-text dark:text-white"
                      rows={2}
                      placeholder="Service description (e.g., Daily ad monitoring, A/B testing, monthly reporting)"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleCreatePackage}
                disabled={isCreating}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Creating...' : 'Create Package'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Package List */}
      <div className="bg-brand-light-card dark:bg-brand-navy p-6 rounded-lg border border-brand-light-border dark:border-brand-gray">
        <h2 className="text-xl font-bold text-brand-light-text dark:text-white mb-6">
          Your Service Packages ({packages.length})
        </h2>

        {packages.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-lg font-bold text-gray-600 dark:text-gray-400 mb-2">
              No service packages yet
            </h3>
            <p className="text-gray-500 dark:text-gray-500 mb-6">
              Create your first service package to start generating AI-powered proposals
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              Create Your First Package
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-600 dark:hover:border-purple-500 transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-brand-light-text dark:text-white mb-1">
                      {pkg.package_name}
                    </h3>
                    {pkg.category && (
                      <span className="inline-block px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs rounded">
                        {pkg.category}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeletePackage(pkg.id)}
                    className="text-red-500 hover:text-red-600"
                    title="Delete package"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {pkg.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                    {pkg.description}
                  </p>
                )}

                <div className="mb-4">
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    ${pkg.price.toLocaleString()}
                    <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                      /{pkg.pricing_model === 'one-time' ? 'one-time' : pkg.pricing_model === 'annual' ? 'year' : 'month'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Services included:
                  </p>
                  {pkg.services.slice(0, 3).map((service, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">{service.name}</span>
                    </div>
                  ))}
                  {pkg.services.length > 3 && (
                    <p className="text-sm text-purple-600 ml-6">
                      +{pkg.services.length - 3} more services
                    </p>
                  )}
                </div>

                {pkg.usage_count > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Used in {pkg.usage_count} proposal{pkg.usage_count !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceLibraryPage;
