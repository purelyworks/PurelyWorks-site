import './globals.css';
import Script from 'next/script';
import { Inter, Patrick_Hand } from 'next/font/google';
import { AppShell } from '../components/AppShell';

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

export const metadata = {
  title: 'Purely Flex - Adaptive Team Solutions',
  description: 'Purely Works Website',
  icons: {
    icon: '/assets/Circle.png',
    apple: '/assets/Circle.png',
    shortcut: '/assets/Circle.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const hubspotPortalId =
    process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID || process.env.NEXT_PUBLIC_HS_PORTAL_ID;

  return (
    <html lang="en" className={`${inter.variable} ${patrickHand.variable}`}>
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
