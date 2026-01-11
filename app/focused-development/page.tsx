import type { Metadata } from 'next';
import { FocusedDevelopment } from '../../screens/FocusedDevelopment';

export const metadata: Metadata = {
  title: 'Focused Development Teams',
  description:
    'Dedicated AI-augmented development pods that integrate with your workflow to accelerate your product roadmap.',
};

export default function Page() {
  return <FocusedDevelopment />;
}
