'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

type FeedbackFilter = 'all' | 'IDEA' | 'BUG' | 'REQUEST' | 'RESEARCH_INSIGHT';
type StatusFilter = 'all' | 'OPEN' | 'UNDER_REVIEW' | 'PLANNED' | 'IN_PROGRESS' | 'SHIPPED' | 'CLOSED';

export default function FeedbackPage() {
  const params = useParams();
  const [feedback, setFeedback] = useState([]);
  const [typeFilter, setTypeFilter] = useState<FeedbackFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const typeColors = {
    IDEA: 'bg-purple-100 text-purple-700',
    BUG: 'bg-red-100 text-red-700',
    REQUEST: 'bg-blue-100 text-blue-700',
    RESEARCH_INSIGHT: 'bg-green-100 text-green-700',
  };

  const statusColors = {
    OPEN: 'bg-gray-100 text-gray-700',
    UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
    PLANNED: 'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-indigo-100 text-indigo-700',
    SHIPPED: 'bg-green-100 text-green-700',
    CLOSED: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Feedback</h1>
          <p className="text-muted-foreground">
            Collect, prioritize, and act on customer insights
          </p>
        </div>
        <Link
          href={`/${params.tenant}/feedback/new`}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition"
        >
          Submit Feedback
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">Type</p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                typeFilter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              All Types
            </button>
            {(['IDEA', 'BUG', 'REQUEST', 'RESEARCH_INSIGHT'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  typeFilter === type
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Status</p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              All Statuses
            </button>
            {(['OPEN', 'UNDER_REVIEW', 'PLANNED', 'IN_PROGRESS', 'SHIPPED', 'CLOSED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  statusFilter === status
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {feedback.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">No feedback yet</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Start collecting valuable insights from your CAB members to drive product decisions
          </p>
          <Link
            href={`/${params.tenant}/feedback/new`}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition"
          >
            Submit First Feedback
          </Link>
        </div>
      )}

      {/* Feedback List */}
      {feedback.length > 0 && (
        <div className="space-y-4">
          {feedback.map((item: any) => (
            <Link
              key={item.id}
              href={`/${params.tenant}/feedback/${item.id}`}
              className="bg-card border rounded-lg p-6 hover:shadow-md transition block"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${typeColors[item.type as keyof typeof typeColors]}`}>
                    {item.type.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[item.status as keyof typeof statusColors]}`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  item.priority === 'CRITICAL'
                    ? 'bg-red-100 text-red-700'
                    : item.priority === 'HIGH'
                    ? 'bg-orange-100 text-orange-700'
                    : item.priority === 'MEDIUM'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {item.priority}
                </span>
              </div>

              <p className="text-muted-foreground line-clamp-2 mb-3">{item.description}</p>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  {item._count?.votes || 0} votes
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {item._count?.comments || 0} comments
                </span>
                {item.tags && item.tags.length > 0 && (
                  <div className="flex gap-1">
                    {item.tags.slice(0, 3).map((tag: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-muted rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
