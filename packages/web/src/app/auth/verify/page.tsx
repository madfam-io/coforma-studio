'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-lg border">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h2 className="text-3xl font-bold mb-2">Check your email</h2>
          {email && (
            <p className="text-muted-foreground mb-4">
              We sent a verification link to <strong>{email}</strong>
            </p>
          )}
          <p className="text-sm text-muted-foreground mb-8">
            Click the link in the email to verify your account and sign in.
          </p>

          <div className="bg-muted p-4 rounded-lg text-left space-y-2">
            <p className="text-sm font-medium">What's next?</p>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Check your email inbox (and spam folder)</li>
              <li>Click the verification link</li>
              <li>Complete your company setup</li>
              <li>Start creating your first CAB!</li>
            </ol>
          </div>

          <div className="mt-8">
            <Link
              href="/auth/signin"
              className="text-sm text-primary hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
