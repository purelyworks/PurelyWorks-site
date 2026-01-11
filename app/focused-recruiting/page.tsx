import type { Metadata } from 'next';
import { FocusedRecruiting } from '../../screens/FocusedRecruiting';

export const metadata: Metadata = {
  title: 'Focused Recruiting Teams',
  description:
    'A dedicated recruiting engine with AI-powered scoring and human vetting to build a consistent hiring pipeline.',
};

export default function Page() {
  return <FocusedRecruiting />;
}
