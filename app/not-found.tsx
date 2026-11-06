import ErrorStatusPage from '@/components/shared/ErrorStatusPage';
import { ROUTES } from '@/config/routes';
import { getErrorPresentation } from '@/lib/errors/http-status';

export default function NotFound() {
  return (
    <ErrorStatusPage
      presentation={getErrorPresentation(404)}
      primary={{
        kind: 'link',
        href: ROUTES.MARKETING.HOME,
        label: 'Back to home',
      }}
      outline={{
        kind: 'link',
        href: ROUTES.MARKETING.CONTACT,
        label: 'Contact support',
      }}
    />
  );
}
