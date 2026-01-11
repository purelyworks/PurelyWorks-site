import './globals.css';
import Script from 'next/script';
import type { Metadata } from 'next';
import { Inter, Patrick_Hand } from 'next/font/google';
import { AppShell } from '../components/AppShell';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.purelyworks.com';
const siteDescription =
  'Purely Works fuses elite talent with AI workflows to deliver development, recruiting, and proposal teams that scale with your business.';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
});

const patrickHand = Patrick_Hand({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-patrick-hand',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Purely Works | Elite Talent + AI Workflows',
    template: '%s | Purely Works',
  },
  description: siteDescription,
  icons: {
    icon: '/icon.png',
    apple: '/apple-touch-icon.png',
    shortcut: '/icon.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const hubspotPortalId =
    process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID || process.env.NEXT_PUBLIC_HS_PORTAL_ID;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'Purely Works',
        url: siteUrl,
        logo: `${siteUrl}/icon.png`,
        description: siteDescription,
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'Purely Works',
        description: siteDescription,
        publisher: {
          '@id': `${siteUrl}/#organization`,
        },
      },
    ],
  };

  return (
    <html lang="en" className={`${inter.variable} ${patrickHand.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased">
        <AppShell>{children}</AppShell>
        {hubspotPortalId ? (
          <Script
            id="hs-script-loader"
            src={`https://js.hs-scripts.com/${hubspotPortalId}.js`}
            strategy="afterInteractive"
            async
            defer
          />
        ) : null}
      </body>
    </html>
  );
}
