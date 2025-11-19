'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { trpc } from '../../../../../lib/trpc';

export default function CABMembersPage() {
  const params = useParams();
  const cabId = params.id as string;
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  // Fetch CAB data
  const { data: cab, isLoading } = trpc.cabs.getById.useQuery({ id: cabId });

  // TODO: Fetch members list
  // const { data: members } = trpc.cabMembers.list.useQuery({ cabId });

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

  // Placeholder members data
  const members: any[] = [];

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
            <h1 className="text-3xl font-bold mb-2">CAB Members</h1>
            <p className="text-muted-foreground">
              Manage members and invitations for {cab.name}
            </p>
          </div>

          <button
            onClick={() => setInviteModalOpen(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Invite Members
          </button>
        </div>
      </div>

      {/* Member Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border rounded-lg p-4">
          <p className="text-2xl font-bold">{cab._count?.members || 0}</p>
          <p className="text-sm text-muted-foreground">Total Members</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-muted-foreground">Pending Invites</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-2xl font-bold">{cab.maxMembers || '∞'}</p>
          <p className="text-sm text-muted-foreground">Member Limit</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-muted-foreground">With NDA Signed</p>
        </div>
      </div>

      {/* Members List */}
      {members.length === 0 ? (
        <div className="bg-card border rounded-lg p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">No members yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Start building your advisory board by inviting strategic customers and partners
            </p>
            <button
              onClick={() => setInviteModalOpen(true)}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition"
            >
              Invite Your First Member
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-card border rounded-lg divide-y">
          {members.map((member) => (
            <div key={member.id} className="p-6 flex items-center justify-between hover:bg-accent/50 transition">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary">
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                  {member.company && (
                    <p className="text-sm text-muted-foreground">{member.company} • {member.title}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                {member.ndaSigned && (
                  <span className="text-sm px-3 py-1 bg-green-500/10 text-green-600 rounded-full">
                    NDA Signed
                  </span>
                )}
                {member.tags?.map((tag: string) => (
                  <span key={tag} className="text-sm px-3 py-1 bg-muted text-muted-foreground rounded-full">
                    {tag}
                  </span>
                ))}
                <button className="p-2 hover:bg-accent rounded-lg transition">
                  <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Modal (Placeholder) */}
      {inviteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Invite Members</h3>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="p-2 hover:bg-accent rounded-lg transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="member@company.com"
                  className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Role (Optional)</label>
                <select className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background">
                  <option>MEMBER</option>
                  <option>FACILITATOR</option>
                </select>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> Member management functionality is under development. This is a UI placeholder to demonstrate the planned workflow.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  disabled
                  className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold opacity-50 cursor-not-allowed"
                >
                  Send Invitation
                </button>
                <button
                  onClick={() => setInviteModalOpen(false)}
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
