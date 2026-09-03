import type { Metadata } from 'next';
import './globals.css';

/* ============================================================================
   METADATA
   ============================================================================ */

export const metadata: Metadata = {
  title: 'Mohammad Moghraby — Web Developer',
  description:
    'Mohammad Moghraby portfolio — web and desktop applications built with practical, sustainable tools.',
  openGraph: {
    title: 'Mohammad Moghraby Portfolio',
    description: 'Web Developer',
    type: 'website',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Mohammad Moghraby Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mohammad Moghraby Portfolio',
    description: 'Web Developer',
    images: ['/og.png'],
  },
};

/* ============================================================================
   ROOT LAYOUT COMPONENT
   ============================================================================ */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
