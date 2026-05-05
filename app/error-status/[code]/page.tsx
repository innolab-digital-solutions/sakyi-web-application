import { notFound } from 'next/navigation';

import ErrorStatusPage from '@/components/shared/ErrorStatusPage';
import { ROUTES } from '@/config/routes';
import {
  getErrorPresentation,
  isSupportedErrorStatus,
} from '@/lib/errors/http-status';

type ErrorStatusRoutePageProps = {
  params: Promise<{ code: string }>;
};

export default async function ErrorStatus({
  params,
}: ErrorStatusRoutePageProps) {
  const { code } = await params;
  const statusCode = Number(code);

  if (!Number.isInteger(statusCode) || !isSupportedErrorStatus(statusCode)) {
    notFound();
  }

  return (
    <ErrorStatusPage
      presentation={getErrorPresentation(statusCode)}
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
