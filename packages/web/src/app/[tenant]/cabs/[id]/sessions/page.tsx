'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { trpc } from '../../../../../lib/trpc';

export default function CABSessionsPage() {
  const params = useParams();
  const cabId = params.id as string;
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Fetch CAB data
  const { data: cab, isLoading } = trpc.cabs.getById.useQuery({ id: cabId });

  // TODO: Fetch sessions list
  // const { data: sessions } = trpc.sessions.list.useQuery({ cabId });

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

  // Placeholder sessions data
  const sessions: any[] = [];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/${params.tenant}/cabs/${cabId}`}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to {cab.name}
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">CAB Sessions</h1>
            <p className="text-muted-foreground">
              Schedule and manage sessions for {cab.name}
            </p>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Schedule Session
          </button>
        </div>
      </div>

      {/* Session Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border rounded-lg p-4">
          <p className="text-2xl font-bold">{cab._count?.sessions || 0}</p>
          <p className="text-sm text-muted-foreground">Total Sessions</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-muted-foreground">Upcoming</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-muted-foreground">In Progress</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-muted-foreground">Completed</p>
        </div>
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="bg-card border rounded-lg p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">No sessions scheduled</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Schedule your first CAB session to start engaging with your members
            </p>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition"
            >
              Schedule First Session
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="bg-card border rounded-lg p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{session.title}</h3>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      session.status === 'SCHEDULED' ? 'bg-blue-500/10 text-blue-600' :
                      session.status === 'IN_PROGRESS' ? 'bg-green-500/10 text-green-600' :
                      session.status === 'COMPLETED' ? 'bg-muted text-muted-foreground' :
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {session.status}
                    </span>
                  </div>
                  {session.description && (
                    <p className="text-muted-foreground mb-4">{session.description}</p>
                  )}
                  <div className="flex gap-6 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(session.scheduledAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {session.duration} min
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      {session._count?.attendees || 0} attendees
                    </span>
                  </div>
                </div>
                <button className="p-2 hover:bg-accent rounded-lg transition">
                  <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Session Modal (Placeholder) */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Schedule Session</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-2 hover:bg-accent rounded-lg transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Session Title</label>
                <input
                  type="text"
                  placeholder="Q1 Product Roadmap Review"
                  className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date & Time</label>
                <input
                  type="datetime-local"
                  className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  min="15"
                  step="15"
                  defaultValue="60"
                  className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                />
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> Session management functionality is under development. This is a UI placeholder to demonstrate the planned workflow.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  disabled
                  className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold opacity-50 cursor-not-allowed"
                >
                  Schedule Session
                </button>
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-3 border border-input rounded-lg font-semibold hover:bg-accent transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
