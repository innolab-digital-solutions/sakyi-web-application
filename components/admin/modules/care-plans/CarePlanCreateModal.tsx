'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ClipboardPlusIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';

import {
  enrollmentWizardDialogBodyClass,
  enrollmentWizardDialogContentClass,
  enrollmentWizardDialogFooterClass,
  enrollmentWizardDialogTitleClass,
  wizardOutlineButtonClass,
  wizardPrimaryButtonClass,
} from '@/components/admin/modules/enrollmentWizardModalUi';
import ComboboxField, {
  type ComboboxOption,
} from '@/components/shared/form/ComboBoxField';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ENDPOINTS } from '@/config/api/endpoints';
import { LOOKUP_ENDPOINTS } from '@/config/api/endpoints/lookup';
import { ROUTES } from '@/config/routes';
import { postCreateCarePlan } from '@/domains/care-plans/services';
import { http } from '@/lib/api/client';

type EnrollmentLookupItem = {
  id: number;
  code: string | null;
  status: string;
  starts_at: string | null;
  ends_at: string | null;
  client?: {
    id: number | null;
    name: string | null;
    email: string | null;
    client_code: string | null;
    picture_url: string | null;
  } | null;
  program?: {
    id: number | null;
    code: string | null;
    title: string | null;
  } | null;
};

export type CarePlanCreateModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CarePlanCreateModal({
  open,
  onOpenChange,
}: CarePlanCreateModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [enrollmentId, setEnrollmentId] = React.useState<string | null>(null);
  const [enrollmentError, setEnrollmentError] = React.useState<
    string | undefined
  >();

  React.useEffect(() => {
    if (!open) {
      setEnrollmentId(null);
      setEnrollmentError(undefined);
    }
  }, [open]);

  const enrollmentLookupQuery = useQuery({
    queryKey: ['lookup', LOOKUP_ENDPOINTS.ENROLLMENTS],
    enabled: open,
    queryFn: async () => {
      const response = await http.get<EnrollmentLookupItem[]>(
        LOOKUP_ENDPOINTS.ENROLLMENTS,
      );
      if (response.status !== 'success') return [];
      return response.data;
    },
  });

  const enrollmentOptions = React.useMemo<ComboboxOption[]>(() => {
    const rows = enrollmentLookupQuery.data ?? [];
    return rows.map((row) => {
      const code = row.code?.trim() || `#${row.id}`;
      const clientName = row.client?.name?.trim() || 'Unknown client';
      const programTitle =
        row.program?.title?.trim() || row.program?.code?.trim() || 'No program';
      return {
        value: String(row.id),
        label: `${code} - ${clientName}`,
        keywords: [
          code,
          clientName,
          row.client?.email ?? '',
          programTitle,
        ].filter(Boolean),
        content: (
          <div className='flex min-w-0 flex-col'>
            <span className='text-[13px] font-semibold'>{code}</span>
            <span className='text-muted-foreground text-xs'>
              {clientName} · {programTitle}
            </span>
          </div>
        ),
      };
    });
  }, [enrollmentLookupQuery.data]);

  const createMutation = useMutation({
    mutationFn: async (enrollmentIdNum: number) => {
      const response = await postCreateCarePlan({
        enrollment_id: enrollmentIdNum,
      });
      if (response.status === 'error') {
        throw new Error(response.message ?? 'Could not create care plan.');
      }
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('The care plan has been created successfully.');
      queryClient.invalidateQueries({
        queryKey: ['table', ENDPOINTS.ADMIN.MODULES.CARE_PLANS.LIST],
      });
      onOpenChange(false);
      router.push(ROUTES.ADMIN.MODULES.CARE_PLANS.WORKSPACE(String(data.id)));
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Could not create care plan.');
    },
  });

  const handleCreate = () => {
    if (!enrollmentId) {
      setEnrollmentError('Please select an enrollment.');
      return;
    }
    setEnrollmentError(undefined);
    createMutation.mutate(Number.parseInt(enrollmentId, 10));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={!createMutation.isPending}
        className={enrollmentWizardDialogContentClass}
      >
        <div className='border-border flex min-h-0 flex-1 flex-col overflow-hidden'>
          <DialogHeader className='border-border shrink-0 border-b px-6 pt-6 pb-4 text-left'>
            <DialogTitle className={enrollmentWizardDialogTitleClass}>
              Create care plan
            </DialogTitle>
            <DialogDescription className='text-muted-foreground text-[13px] leading-relaxed font-medium'>
              Start a draft care plan for an enrollment. You will continue in
              the care plan workspace to set dates, generate days, and define
              sections.
            </DialogDescription>
          </DialogHeader>

          <div className={enrollmentWizardDialogBodyClass}>
            <ComboboxField
              label='Enrollment'
              required
              placeholder='Select enrollment…'
              searchPlaceholder='Search enrollment, client, or program…'
              emptyMessage='No enrollments found.'
              options={enrollmentOptions}
              value={enrollmentId}
              onChange={(val) => {
                setEnrollmentId(val);
                setEnrollmentError(undefined);
              }}
              error={enrollmentError}
              disabled={
                createMutation.isPending || enrollmentLookupQuery.isLoading
              }
            />
          </div>
        </div>

        <DialogFooter className={enrollmentWizardDialogFooterClass}>
          <Button
            type='button'
            variant='outline'
            disabled={createMutation.isPending}
            className={wizardOutlineButtonClass}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type='button'
            variant='default'
            disabled={createMutation.isPending}
            className={wizardPrimaryButtonClass}
            onClick={handleCreate}
          >
            <ClipboardPlusIcon className='size-3.5 shrink-0' />
            {createMutation.isPending ? 'Creating…' : 'Create draft care plan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
