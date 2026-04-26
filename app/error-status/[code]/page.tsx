import { notFound } from 'next/navigation';

import ErrorStatusPage from '@/components/shared/ErrorStatusPage';
import {
  getErrorPresentation,
  isSupportedErrorStatus,
} from '@/lib/errors/http-status';

type ErrorStatusPageProps = {
  params: Promise<{ code: string }>;
};

export default async function ErrorStatus({ params }: ErrorStatusPageProps) {
  const { code } = await params;
  const statusCode = Number(code);

  if (!Number.isInteger(statusCode) || !isSupportedErrorStatus(statusCode)) {
    notFound();
  }

  return (
    <ErrorStatusPage
      presentation={getErrorPresentation(statusCode)}
      primaryHref='/'
      primaryLabel='Back to home'
      secondaryHref='/contact'
      secondaryLabel='Contact support'
    />
  );
}
