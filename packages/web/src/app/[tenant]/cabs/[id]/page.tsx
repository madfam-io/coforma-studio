'use client';

import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import { trpc } from '../../../../lib/trpc';

export default function CABDetailPage() {
  const router = useRouter();
  const params = useParams();
  const utils = trpc.useUtils();
  const cabId = params.id as string;

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Fetch CAB data
  const { data: cab, isLoading, error } = trpc.cabs.getById.useQuery({ id: cabId });

  // Delete mutation
  const deleteCABMutation = trpc.cabs.delete.useMutation({
    onSuccess: () => {
      utils.cabs.list.invalidate();
      router.push(`/${params.tenant}/cabs`);
    },
  });

  // Update mutation
  const updateCABMutation = trpc.cabs.update.useMutation({
    onSuccess: () => {
      utils.cabs.getById.invalidate({ id: cabId });
      utils.cabs.list.invalidate();
      setIsEditing(false);
    },
  });

  const handleDelete = () => {
    deleteCABMutation.mutate({ id: cabId });
  };

  const handleToggleActive = () => {
    if (!cab) return;
    updateCABMutation.mutate({
      id: cabId,
      isActive: !cab.isActive,
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

  // Error state
  if (error || !cab) {
    return (
      <div className="p-8">
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">CAB Not Found</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            {error?.message || 'The requested advisory board could not be found'}
          </p>
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
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/${params.tenant}/cabs`}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to CABs
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{cab.name}</h1>
              {cab.isActive ? (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-600 text-sm font-medium rounded-full">
                  <div className="w-2 h-2 rounded-full bg-green-600"></div>
                  Active
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-muted text-muted-foreground text-sm font-medium rounded-full">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                  Inactive
                </span>
              )}
            </div>
            <p className="text-muted-foreground">/{params.tenant}/cabs/{cab.slug}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleToggleActive}
              disabled={updateCABMutation.isPending}
              className="px-4 py-2 border border-input rounded-lg font-semibold hover:bg-accent transition disabled:opacity-50"
            >
              {cab.isActive ? 'Deactivate' : 'Activate'}
            </button>
            <Link
              href={`/${params.tenant}/cabs/${cabId}/edit`}
              className="px-4 py-2 border border-input rounded-lg font-semibold hover:bg-accent transition"
            >
              Edit
            </Link>
            <button
              onClick={() => setDeleteConfirmOpen(true)}
              className="px-4 py-2 border border-destructive text-destructive rounded-lg font-semibold hover:bg-destructive/10 transition"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold">{cab._count?.members || 0}</p>
              <p className="text-sm text-muted-foreground">Members</p>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold">{cab._count?.sessions || 0}</p>
              <p className="text-sm text-muted-foreground">Sessions</p>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold">{cab._count?.feedbackItems || 0}</p>
              <p className="text-sm text-muted-foreground">Feedback Items</p>
            </div>
          </div>
        </div>
      </div>

      {/* CAB Details */}
      <div className="bg-card border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Details</h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Description</label>
            <p className="mt-1">{cab.description || 'No description provided'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Maximum Members</label>
              <p className="mt-1">{cab.maxMembers ? cab.maxMembers.toString() : 'Unlimited'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">NDA Required</label>
              <p className="mt-1">{cab.requiresNDA ? 'Yes' : 'No'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created</label>
              <p className="mt-1">{new Date(cab.createdAt).toLocaleDateString()}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
              <p className="mt-1">{new Date(cab.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href={`/${params.tenant}/cabs/${cabId}/members`}
            className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition"
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Manage Members</h3>
              <p className="text-sm text-muted-foreground">Invite and manage CAB members</p>
            </div>
            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            href={`/${params.tenant}/cabs/${cabId}/sessions`}
            className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition"
          >
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Schedule Sessions</h3>
              <p className="text-sm text-muted-foreground">Plan and manage CAB meetings</p>
            </div>
            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <div className="flex items-center gap-4 p-4 border border-dashed rounded-lg opacity-50 cursor-not-allowed">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">View Feedback</h3>
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Delete CAB</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete <strong>{cab.name}</strong>? This will also delete all associated members, sessions, and feedback.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleteCABMutation.isPending}
                className="flex-1 px-4 py-3 bg-destructive text-destructive-foreground rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {deleteCABMutation.isPending ? 'Deleting...' : 'Delete CAB'}
              </button>
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                disabled={deleteCABMutation.isPending}
                className="flex-1 px-4 py-3 border border-input rounded-lg font-semibold hover:bg-accent transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
