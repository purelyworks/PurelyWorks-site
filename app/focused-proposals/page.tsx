import type { Metadata } from 'next';
import { FocusedProposals } from '../../screens/FocusedProposals';

export const metadata: Metadata = {
  title: 'Focused Proposal Teams',
  description:
    'Proposal teams that handle compliance matrices, technical writing, and design to win government and enterprise bids.',
};

export default function Page() {
  return <FocusedProposals />;
}
