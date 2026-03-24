'use client';

import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/config/routes';
import { getOnboardingIntakeById } from '@/domains/onboarding/services/admin.service';

type IntakeDetailPanelProps = {
  intakeId: number;
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'MMM d, yyyy hh:mm a');
  } catch {
    return iso;
  }
}

export default function IntakeDetailPanel({ intakeId }: IntakeDetailPanelProps) {
  const intakeQuery = useQuery({
    queryKey: ['onboarding', 'intake', intakeId],
    queryFn: () => getOnboardingIntakeById(intakeId),
  });

  if (intakeQuery.isPending) {
    return <p className='text-muted-foreground text-sm'>Loading intake...</p>;
  }

  if (intakeQuery.data?.status === 'error') {
    return <p className='text-destructive text-sm'>{intakeQuery.data.message}</p>;
  }

  const intake = intakeQuery.data?.data;
  if (!intake) return null;

  const isEditable = intake.status === 'draft' || intake.status === 'in_progress';

  return (
    <Card>
      <CardHeader className='flex-row items-center justify-between'>
        <CardTitle className='text-base'>Intake #{intake.id}</CardTitle>
        <Badge variant='outline'>{intake.status}</Badge>
      </CardHeader>
      <CardContent className='space-y-3 text-sm'>
        <p>
          <span className='font-semibold'>Client:</span> {intake.user?.name ?? '—'} (
          {intake.user?.email ?? 'No email'})
        </p>
        <p>
          <span className='font-semibold'>Handler:</span> {intake.handler?.name ?? '—'}
        </p>
        <p>
          <span className='font-semibold'>Template:</span>{' '}
          {intake.template?.title ?? 'Unknown template'} (v
          {intake.template?.version ?? '—'})
        </p>
        <p>
          <span className='font-semibold'>Created:</span>{' '}
          {formatDate(intake.timestamps.created_at)}
        </p>
        <p>
          <span className='font-semibold'>Updated:</span>{' '}
          {formatDate(intake.timestamps.updated_at)}
        </p>
        {intake.notes && (
          <p>
            <span className='font-semibold'>Notes:</span> {intake.notes}
          </p>
        )}

        <div className='pt-2'>
          {isEditable ? (
            <Button asChild>
              <Link href={ROUTES.ADMIN.MODULES.ONBOARDING.INTAKES.WIZARD(String(intake.id))}>
                Open wizard
              </Link>
            </Button>
          ) : (
            <Button variant='outline' asChild>
              <Link href={ROUTES.ADMIN.MODULES.ONBOARDING.INTAKES.LIST}>
                Back to queue
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
