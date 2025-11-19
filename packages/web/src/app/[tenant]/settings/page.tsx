'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

export default function SettingsPage() {
  const params = useParams();
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    brandColor: '#3B82F6',
    locale: 'en',
    timezone: 'America/Mexico_City',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);

    try {
      // TODO: Use tRPC mutation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
    } catch (error) {
      console.error('Failed to update settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your workspace configuration and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">General</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                <p className="text-sm">Settings updated successfully!</p>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Workspace Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                placeholder="Acme Inc"
              />
            </div>

            <div>
              <label htmlFor="logo" className="block text-sm font-medium mb-2">
                Logo URL
              </label>
              <input
                id="logo"
                name="logo"
                type="url"
                value={formData.logo}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                placeholder="https://example.com/logo.png"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Upload your logo to Cloudflare R2 and paste the URL here
              </p>
            </div>

            <div>
              <label htmlFor="brandColor" className="block text-sm font-medium mb-2">
                Brand Color
              </label>
              <div className="flex gap-3 items-center">
                <input
                  id="brandColor"
                  name="brandColor"
                  type="color"
                  value={formData.brandColor}
                  onChange={handleChange}
                  className="h-10 w-20 rounded border border-input cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.brandColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, brandColor: e.target.value }))}
                  className="flex-1 px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background font-mono"
                  placeholder="#3B82F6"
                />
              </div>
            </div>

            <div>
              <label htmlFor="locale" className="block text-sm font-medium mb-2">
                Language
              </label>
              <select
                id="locale"
                name="locale"
                value={formData.locale}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>

            <div>
              <label htmlFor="timezone" className="block text-sm font-medium mb-2">
                Timezone
              </label>
              <select
                id="timezone"
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              >
                <option value="America/Mexico_City">Mexico City (GMT-6)</option>
                <option value="America/New_York">New York (GMT-5)</option>
                <option value="America/Los_Angeles">Los Angeles (GMT-8)</option>
                <option value="Europe/London">London (GMT+0)</option>
                <option value="Europe/Madrid">Madrid (GMT+1)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Billing Settings (Placeholder) */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Billing</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">Current Plan</p>
                <p className="text-sm text-muted-foreground">Starter ($500/month)</p>
              </div>
              <button className="px-4 py-2 border border-input rounded-lg hover:bg-accent transition">
                Upgrade
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">Billing Portal</p>
                <p className="text-sm text-muted-foreground">Manage subscription and invoices</p>
              </div>
              <button className="px-4 py-2 border border-input rounded-lg hover:bg-accent transition">
                Open Portal
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-card border border-destructive rounded-lg p-6">
          <h2 className="text-xl font-semibold text-destructive mb-4">Danger Zone</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">Delete Workspace</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this workspace and all data
                </p>
              </div>
              <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition">
                Delete Workspace
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
