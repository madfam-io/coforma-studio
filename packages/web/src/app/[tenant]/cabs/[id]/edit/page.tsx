'use client';

import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { trpc } from '../../../../../lib/trpc';

export default function EditCABPage() {
  const router = useRouter();
  const params = useParams();
  const utils = trpc.useUtils();
  const cabId = params.id as string;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    maxMembers: '',
    requiresNDA: false,
    isActive: true,
  });
  const [error, setError] = useState('');

  // Fetch CAB data
  const { data: cab, isLoading } = trpc.cabs.getById.useQuery({ id: cabId });

  // Update mutation
  const updateCABMutation = trpc.cabs.update.useMutation({
    onSuccess: () => {
      utils.cabs.getById.invalidate({ id: cabId });
      utils.cabs.list.invalidate();
      router.push(`/${params.tenant}/cabs/${cabId}`);
    },
    onError: (err) => {
      setError(err.message || 'Failed to update CAB');
    },
  });

  // Initialize form when CAB data loads
  useEffect(() => {
    if (cab) {
      setFormData({
        name: cab.name,
        description: cab.description || '',
        slug: cab.slug,
        maxMembers: cab.maxMembers?.toString() || '',
        requiresNDA: cab.requiresNDA,
        isActive: cab.isActive,
      });
    }
  }, [cab]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    updateCABMutation.mutate({
      id: cabId,
      name: formData.name,
      description: formData.description || undefined,
      slug: formData.slug,
      maxMembers: formData.maxMembers ? parseInt(formData.maxMembers) : undefined,
      requiresNDA: formData.requiresNDA,
      isActive: formData.isActive,
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!cab) {
    return (
      <div className="p-8">
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <h3 className="text-xl font-semibold mb-2">CAB Not Found</h3>
          <Link
            href={`/${params.tenant}/cabs`}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition"
          >
            Back to CABs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href={`/${params.tenant}/cabs/${cabId}`}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to CAB Details
        </Link>
        <h1 className="text-3xl font-bold mb-2">Edit CAB</h1>
        <p className="text-muted-foreground">
          Update the settings and details for this advisory board
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-card border rounded-lg p-6">
        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            CAB Name <span className="text-destructive">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            placeholder="e.g., Product Advisory Board, Enterprise Council"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium mb-2">
            URL Slug <span className="text-destructive">*</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              /{params.tenant}/cabs/
            </span>
            <input
              id="slug"
              name="slug"
              type="text"
              value={formData.slug}
              onChange={handleChange}
              required
              pattern="[a-z0-9-]+"
              className="flex-1 px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              placeholder="product-advisory"
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Lowercase letters, numbers, and hyphens only
          </p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            placeholder="Describe the purpose and goals of this advisory board..."
          />
        </div>

        <div>
          <label htmlFor="maxMembers" className="block text-sm font-medium mb-2">
            Maximum Members
          </label>
          <input
            id="maxMembers"
            name="maxMembers"
            type="number"
            min="1"
            value={formData.maxMembers}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            placeholder="Leave empty for unlimited"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Optional limit on the number of members who can join this CAB
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="requiresNDA"
            name="requiresNDA"
            type="checkbox"
            checked={formData.requiresNDA}
            onChange={handleChange}
            className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
          />
          <label htmlFor="requiresNDA" className="text-sm font-medium">
            Require NDA signature for members
          </label>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            checked={formData.isActive}
            onChange={handleChange}
            className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
          />
          <label htmlFor="isActive" className="text-sm font-medium">
            CAB is active
          </label>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={updateCABMutation.isPending}
            className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {updateCABMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            href={`/${params.tenant}/cabs/${cabId}`}
            className="px-4 py-3 border border-input rounded-lg font-semibold hover:bg-accent transition text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
