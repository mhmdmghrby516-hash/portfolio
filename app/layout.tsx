import type { Metadata } from 'next';
import './globals.css';

/* ============================================================================
   METADATA
   ============================================================================ */

export const metadata: Metadata = {
  title: 'Kintaro — Full Stack Developer',
  description:
    'Kintaro portfolio — web and desktop applications built with practical, sustainable tools.',
  openGraph: {
    title: 'Kintaro Portfolio',
    description: 'Full Stack Developer',
    type: 'website',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Kintaro Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kintaro Portfolio',
    description: 'Full Stack Developer',
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
