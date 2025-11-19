'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function CABsPage() {
  const params = useParams();
  const [cabs, setCabs] = useState([]);
  const [loading, setLoading] = useState(true);

  // TODO: Fetch CABs from tRPC
  // const { data: cabs, isLoading } = trpc.cabs.list.useQuery();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Customer Advisory Boards</h1>
          <p className="text-muted-foreground">
            Manage your advisory boards and member communities
          </p>
        </div>
        <Link
          href={`/${params.tenant}/cabs/new`}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition"
        >
          Create CAB
        </Link>
      </div>

      {/* Empty State */}
      {cabs.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">No CABs yet</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Create your first Customer Advisory Board to start engaging with your strategic customers
          </p>
          <Link
            href={`/${params.tenant}/cabs/new`}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition"
          >
            Create Your First CAB
          </Link>
        </div>
      )}

      {/* CAB List */}
      {cabs.length > 0 && (
        <div className="grid gap-4">
          {cabs.map((cab: any) => (
            <Link
              key={cab.id}
              href={`/${params.tenant}/cabs/${cab.id}`}
              className="bg-card border rounded-lg p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{cab.name}</h3>
                  {cab.description && (
                    <p className="text-muted-foreground mb-4">{cab.description}</p>
                  )}
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      {cab._count?.members || 0} members
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {cab._count?.sessions || 0} sessions
                    </span>
                    {cab.isActive ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <div className="w-2 h-2 rounded-full bg-green-600"></div>
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
