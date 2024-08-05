// app/layout.tsx
import "./globals.css";
import cx from "classnames";
import { sfPro, inter } from "./fonts";
import Nav from "@/components/layout/nav";
import Footer from "@/components/layout/footer";
import { Suspense } from "react";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import ClientSessionProvider from "@/components/ClientSessionProvider"; // Adjust the path accordingly

export const metadata = {
  title: "ProPost - Connecting Code with Conversations",
  description:
    "We assist you in leveraging AI to craft insightful LinkedIn posts from the code you commit, helping developers expand their reach by connecting code with meaningful conversations.",
  // metadataBase: new URL("https://precedent.dev"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={cx(sfPro.variable, inter.variable)}>
        <div className="fixed h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-cyan-100" />
        <ClientSessionProvider>
          <Suspense fallback="...">
            <Nav />
          </Suspense>
          <main className="flex min-h-screen w-full flex-col items-center justify-center py-32">
            {children}
          </main>
          <Footer />
          <VercelAnalytics />
        </ClientSessionProvider>
      </body>
    </html>
  );
}
