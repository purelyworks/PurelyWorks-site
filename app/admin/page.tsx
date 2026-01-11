import type { Metadata } from 'next';
import { AdminLogin } from '../../screens/AdminLogin';

export const metadata: Metadata = {
  title: 'Admin',
  description: 'Admin access for the Purely Works Payload handoff.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <AdminLogin />;
}
