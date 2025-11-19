'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const errorMessages: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: 'Server Configuration Error',
    description: 'There is a problem with the server configuration. Please contact support.',
  },
  AccessDenied: {
    title: 'Access Denied',
    description: 'You do not have permission to sign in.',
  },
  Verification: {
    title: 'Verification Failed',
    description: 'The verification token has expired or has already been used.',
  },
  OAuthSignin: {
    title: 'OAuth Sign In Error',
    description: 'Error occurred while trying to sign in with the OAuth provider.',
  },
  OAuthCallback: {
    title: 'OAuth Callback Error',
    description: 'Error occurred during the OAuth callback process.',
  },
  OAuthCreateAccount: {
    title: 'Account Creation Failed',
    description: 'Could not create your account with the OAuth provider.',
  },
  EmailCreateAccount: {
    title: 'Email Account Creation Failed',
    description: 'Could not create your account with the email provider.',
  },
  Callback: {
    title: 'Callback Error',
    description: 'Error occurred in the authentication callback.',
  },
  OAuthAccountNotLinked: {
    title: 'Account Not Linked',
    description: 'This email is already associated with another account. Please sign in with your original provider.',
  },
  EmailSignin: {
    title: 'Email Sign In Error',
    description: 'The email sign in link is invalid or has expired.',
  },
  CredentialsSignin: {
    title: 'Sign In Failed',
    description: 'The credentials you provided are incorrect.',
  },
  SessionRequired: {
    title: 'Authentication Required',
    description: 'You must be signed in to access this page.',
  },
  Default: {
    title: 'Authentication Error',
    description: 'An error occurred during authentication.',
  },
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'Default';
  const errorInfo = errorMessages[error] || errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-lg border">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-destructive"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h2 className="text-3xl font-bold mb-2">{errorInfo.title}</h2>
          <p className="text-muted-foreground mb-8">{errorInfo.description}</p>

          {/* Help Section */}
          <div className="bg-muted p-4 rounded-lg text-left space-y-2 mb-6">
            <p className="text-sm font-medium">What can you do?</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Try signing in again</li>
              <li>Clear your browser cache and cookies</li>
              <li>Try a different sign-in method</li>
              <li>Contact support if the problem persists</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/auth/signin"
              className="block w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition text-center"
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="block text-sm text-primary hover:underline"
            >
              Back to home
            </Link>
          </div>

          {/* Debug Info (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-3 bg-muted rounded text-left">
              <p className="text-xs font-mono text-muted-foreground">
                Error Code: {error}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
