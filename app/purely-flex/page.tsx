import type { Metadata } from 'next';
import { PurelyFlex } from '../../screens/PurelyFlex';

export const metadata: Metadata = {
  title: 'Purely Flex',
  description:
    'Purely Flex gives you access to recruiting, proposals, and development in one flexible subscription with bandwidth that adapts month to month.',
};

export default function Page() {
  return <PurelyFlex />;
}
