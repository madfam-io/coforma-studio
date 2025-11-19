import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      image: string | null;
      tenants: Array<{
        id: string;
        slug: string;
        name: string;
        logo: string | null;
        brandColor: string | null;
        role: 'ADMIN' | 'FACILITATOR' | 'MEMBER';
      }>;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
  }
}
