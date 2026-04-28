import ErrorStatusPage from '@/components/shared/ErrorStatusPage';
import { getErrorPresentation } from '@/lib/errors/http-status';

export default function NotFound() {
  return (
    <ErrorStatusPage
      presentation={getErrorPresentation(404)}
      primaryHref='/'
      primaryLabel='Back to home'
      secondaryHref='/contact'
      secondaryLabel='Contact support'
    />
  );
}
