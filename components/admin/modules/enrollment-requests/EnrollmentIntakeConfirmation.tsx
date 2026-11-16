'use client';

import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { CircleQuestionMark, ClipboardListIcon } from 'lucide-react';
import * as React from 'react';

import SelectField from '@/components/shared/form/SelectField';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  getOnboardingIntakes,
  getOnboardingTemplateByVersion,
} from '@/domains/onboarding/services';
import type { CreateOnboardingIntakePayload } from '@/domains/onboarding/types/admin';
import {
  buildClientIntakeSearchQuery,
  filterCompatibleCompletedIntakes,
} from '@/lib/onboarding/prefillIntakes';

export type EnrollmentIntakePrefillChoice = Pick<
  CreateOnboardingIntakePayload,
  'prefill' | 'prefill_from_intake_id'
>;

type EnrollmentIntakeClient = {
  id: number;
  name?: string | null;
  client_code?: string | null;
};

type EnrollmentIntakeConfirmationProps = {
  open: boolean;
  isSubmitting: boolean;
  requestReference?: string;
  client?: EnrollmentIntakeClient | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (prefill: EnrollmentIntakePrefillChoice) => void;
};

function formatCompletedLabel(iso: string | null | undefined): string {
  if (!iso?.trim()) return 'Completed date unknown';
  try {
    return format(parseISO(iso), 'dd MMM yyyy');
  } catch {
    return iso.trim();
  }
}

export default function EnrollmentIntakeConfirmation({
  open,
  isSubmitting,
  requestReference,
  client,
  onOpenChange,
  onConfirm,
}: EnrollmentIntakeConfirmationProps) {
  const [usePreviousAssessment, setUsePreviousAssessment] =
    React.useState(false);
  const [selectedSourceId, setSelectedSourceId] = React.useState<
    string | undefined
  >(undefined);

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setUsePreviousAssessment(false);
        setSelectedSourceId(undefined);
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange],
  );

  const templateQuery = useQuery({
    queryKey: ['onboarding', 'template', 'version', 1],
    enabled: open,
    queryFn: async () => {
      const response = await getOnboardingTemplateByVersion(1);
      if (response.status === 'error') {
        throw new Error(response.message || 'Could not load template.');
      }
      return response.data;
    },
  });

  const search = client ? buildClientIntakeSearchQuery(client) : '';
  const priorIntakesQuery = useQuery({
    queryKey: [
      'onboarding',
      'intakes',
      'prefill-candidates',
      client?.id ?? null,
      templateQuery.data?.id ?? null,
      search,
    ],
    enabled: open && client?.id != null && templateQuery.data?.id != null,
    queryFn: async () => {
      const response = await getOnboardingIntakes({
        status: 'completed',
        search: search || undefined,
        per_page: 50,
      });
      if (response.status === 'error') {
        throw new Error(response.message || 'Could not load prior intakes.');
      }
      const rows = Array.isArray(response.data) ? response.data : [];
      return filterCompatibleCompletedIntakes({
        intakes: rows,
        clientId: client!.id,
        templateId: templateQuery.data!.id,
      });
    },
  });

  const priorIntakes = React.useMemo(
    () => priorIntakesQuery.data ?? [],
    [priorIntakesQuery.data],
  );
  const canPrefill = priorIntakes.length > 0;
  const usePrefill = usePreviousAssessment && canPrefill;

  const effectiveSourceId = React.useMemo(() => {
    if (!canPrefill) return undefined;
    if (
      selectedSourceId &&
      priorIntakes.some((intake) => String(intake.id) === selectedSourceId)
    ) {
      return selectedSourceId;
    }
    return String(priorIntakes[0].id);
  }, [canPrefill, priorIntakes, selectedSourceId]);

  const sourceOptions = priorIntakes.map((intake) => {
    const code = intake.code?.trim() || `#${intake.id}`;
    const completedAt =
      intake.timestamps.completed_at ?? intake.timestamps.updated_at;
    return {
      value: String(intake.id),
      label: code,
      description: formatCompletedLabel(completedAt),
    };
  });

  const handleConfirm = () => {
    if (!usePrefill) {
      onConfirm({});
      return;
    }
    const sourceId = effectiveSourceId
      ? Number.parseInt(effectiveSourceId, 10)
      : NaN;
    onConfirm({
      prefill: true,
      ...(Number.isFinite(sourceId) && sourceId > 0
        ? { prefill_from_intake_id: sourceId }
        : {}),
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className='gap-0 overflow-hidden p-0 sm:max-w-md'>
        <AlertDialogHeader className='border-border border-b p-6'>
          <div className='flex items-start gap-3'>
            <div className='bg-primary/10 border-primary/20 text-primary mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-md border'>
              <CircleQuestionMark className='size-5' />
            </div>
            <div className='space-y-1.5'>
              <AlertDialogTitle className='text-foreground/90 text-sm font-bold capitalize'>
                Do you want to start the intake assessment?
              </AlertDialogTitle>
              <AlertDialogDescription className='text-muted-foreground text-[13px] font-medium'>
                Starting this process will create a new intake assessment for{' '}
                <span className='text-primary text-xs font-semibold'>
                  {requestReference || 'the selected enrollment request'}
                </span>
                . You will be directed to the interview form to begin the
                assessment immediately. Prefill copies answers into a new intake
                — review them before completing.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        {canPrefill ? (
          <div className='border-border space-y-3 border-b px-6 py-4'>
            <div className='flex items-start gap-2.5'>
              <Checkbox
                id='use-previous-assessment'
                checked={usePreviousAssessment}
                disabled={isSubmitting || priorIntakesQuery.isPending}
                onCheckedChange={(checked) =>
                  setUsePreviousAssessment(checked === true)
                }
                className='mt-0.5'
              />
              <div className='space-y-1'>
                <Label
                  htmlFor='use-previous-assessment'
                  className='text-foreground cursor-pointer text-[13px] leading-snug font-semibold'
                >
                  Use previous assessment
                </Label>
                <p className='text-muted-foreground text-[12px] leading-relaxed font-medium'>
                  Copy answers from a completed intake for this client on the
                  same template. You can still edit before completing.
                </p>
              </div>
            </div>
            {usePrefill ? (
              <SelectField
                label='Previous assessment'
                placeholder='Select a completed intake…'
                options={sourceOptions}
                value={effectiveSourceId}
                onChange={(value) => setSelectedSourceId(value)}
                disabled={isSubmitting}
              />
            ) : null}
          </div>
        ) : null}

        {priorIntakesQuery.isError ? (
          <p className='text-muted-foreground px-6 py-3 text-[12px] font-medium'>
            Could not check for previous assessments. You can still create a
            blank intake.
          </p>
        ) : null}

        <AlertDialogFooter className='bg-muted/30 border-border gap-2 border-t p-4 sm:justify-end'>
          <AlertDialogCancel
            disabled={isSubmitting}
            className='text-foreground bg-background hover:bg-muted h-10 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
          >
            Not now
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={
              isSubmitting ||
              (open && templateQuery.isPending) ||
              (usePrefill && !effectiveSourceId)
            }
            className='h-10 gap-1.5 rounded-md px-3 text-[13px]! font-semibold'
            onClick={(event) => {
              event.preventDefault();
              handleConfirm();
            }}
          >
            <ClipboardListIcon className='size-3.5' />
            {isSubmitting
              ? 'Creating intake...'
              : usePrefill
                ? 'Create with prefill'
                : 'Create and open interview'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
