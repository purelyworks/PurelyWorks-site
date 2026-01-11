import type { Metadata } from 'next';
import { Blog } from '../../screens/Blog';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Thoughts on building AI-enabled teams, recruiting, proposals, and modern delivery from Purely Works.',
};

export default function Page() {
  return <Blog />;
}
