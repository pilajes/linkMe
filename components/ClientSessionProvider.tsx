// components/ClientSessionProvider.tsx
"use client"; // Mark this as a client-side component

import { SessionProvider } from "next-auth/react";

export default function ClientSessionProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
