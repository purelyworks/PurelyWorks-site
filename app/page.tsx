import type { Metadata } from 'next';
import { Home } from '../screens/Home';

export const metadata: Metadata = {
  title: {
    absolute: 'Purely Works | Elite Talent + AI Workflows',
  },
  description:
    'Purely Works fuses elite talent with AI workflows to deliver development, recruiting, and proposal teams that scale with your business.',
};

export default function Page() {
  return <Home />;
}
