'use client';

import { PlusIcon, SaveIcon, Trash2Icon } from 'lucide-react';

import { clearCareTeamFieldErrors } from '@/components/admin/modules/enrollmentCareTeamValidation';
import {
  enrollmentWizardDialogBodyClass,
  enrollmentWizardDialogContentClass,
  enrollmentWizardDialogFooterClass,
  enrollmentWizardDialogHeaderClass,
  enrollmentWizardDialogTitleClass,
  wizardOutlineButtonClass,
  wizardPrimaryButtonClass,
} from '@/components/admin/modules/enrollmentWizardModalUi';
import ComboboxField, {
  type ComboboxOption,
} from '@/components/shared/form/ComboBoxField';
import TextField from '@/components/shared/form/TextField';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils/styles';

export type EnrollmentCareTeamRow = {
  key: string;
  userId: string;
  position: string;
};

export type CareTeamEditorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detailLoading: boolean;
  detailError: boolean;
  detailQueryError: unknown;
  teamRows: EnrollmentCareTeamRow[];
  setTeamRows: React.Dispatch<React.SetStateAction<EnrollmentCareTeamRow[]>>;
  careErrors: Record<string, string>;
  setCareErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  teamLoading: boolean;
  optionsForTeamRow: (rowIndex: number) => ComboboxOption[];
  updateTeamRow: (
    index: number,
    patch: Partial<Pick<EnrollmentCareTeamRow, 'userId' | 'position'>>,
  ) => void;
  carePending: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onAddMember: () => void;
};

const CARE_FORM_ID = 'enrollment-care-team-editor';

export default function EnrollmentCareTeamEditorDialog({
  open,
  onOpenChange,
  detailLoading,
  detailError,
  detailQueryError,
  teamRows,
  setTeamRows,
  careErrors,
  setCareErrors,
  teamLoading,
  optionsForTeamRow,
  updateTeamRow,
  carePending,
  onSubmit,
  onAddMember,
}: CareTeamEditorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={!carePending}
        className={enrollmentWizardDialogContentClass}
      >
        <div className='border-border flex min-h-0 flex-1 flex-col overflow-hidden'>
          <DialogHeader className={enrollmentWizardDialogHeaderClass}>
            <DialogTitle className={enrollmentWizardDialogTitleClass}>
              Edit Care Team Members
            </DialogTitle>
            <DialogDescription className='text-muted-foreground text-[13px] leading-relaxed font-medium'>
              Update the list of care team members assigned to this participant.
              At least one staff member with a designated position is required.
              Please note: The enrolled client cannot be included as a staff
              member.
            </DialogDescription>
          </DialogHeader>

          <div className={enrollmentWizardDialogBodyClass}>
            {detailLoading ? (
              <p className='text-muted-foreground py-8 text-center text-sm font-medium'>
                Loading roster…
              </p>
            ) : detailError ? (
              <div className='space-y-4 py-4'>
                <p className='text-destructive text-sm font-medium'>
                  {detailQueryError instanceof Error
                    ? detailQueryError.message
                    : 'Could not load roster.'}
                </p>
              </div>
            ) : (
              <form
                id={CARE_FORM_ID}
                onSubmit={onSubmit}
                className='flex min-h-0 flex-1 flex-col gap-4 overflow-hidden'
              >
                <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
                  <div className='flex min-h-0 flex-1 flex-col gap-2'>
                    <div className='flex shrink-0 flex-wrap items-center justify-between gap-2'>
                      <Label
                        id='enrollment-care-team-heading'
                        className='text-foreground text-[13px] font-semibold'
                      >
                        Care Team <span className='text-destructive'>*</span>
                      </Label>
                      <Button
                        type='button'
                        variant='outline'
                        className={cn(
                          wizardOutlineButtonClass,
                          'h-9 px-2.5 text-xs sm:h-10 sm:px-3 sm:text-[13px]',
                        )}
                        onClick={onAddMember}
                      >
                        <PlusIcon className='size-3.5 shrink-0' />
                        Add member
                      </Button>
                    </div>
                    {careErrors.team_members ? (
                      <p className='text-destructive shrink-0 text-xs font-medium'>
                        {careErrors.team_members}
                      </p>
                    ) : null}
                    <div
                      className='border-border bg-background min-h-0 flex-1 overflow-x-hidden overflow-y-auto rounded-md border'
                      role='group'
                      aria-labelledby='enrollment-care-team-heading'
                    >
                      <div
                        className='text-muted-foreground border-border bg-muted/25 hidden grid-cols-[minmax(0,1fr)_minmax(8rem,11rem)_2.5rem] gap-x-2 border-b px-2 py-1.5 text-[10px] font-bold tracking-wide uppercase sm:grid'
                        aria-hidden
                      >
                        <span>Staff</span>
                        <span>Position</span>
                        <span className='text-center'> </span>
                      </div>
                      <ul className='divide-border max-h-full divide-y'>
                        {teamRows.map((row, index) => {
                          const staffError =
                            careErrors[`team_members.${index}.user_id`];
                          const posError =
                            careErrors[`team_members.${index}.position`];
                          return (
                            <li key={row.key}>
                              <div className='grid grid-cols-1 gap-2 p-2 sm:grid-cols-[minmax(0,1fr)_minmax(8rem,11rem)_2.5rem] sm:items-center sm:gap-x-2 sm:gap-y-0 sm:p-2'>
                                <div className='min-w-0'>
                                  <span className='text-muted-foreground mb-1 block text-[10px] font-semibold uppercase sm:sr-only'>
                                    Staff · {index + 1}
                                  </span>
                                  <ComboboxField
                                    placeholder={
                                      teamLoading ? 'Loading…' : 'Select member'
                                    }
                                    disabled={teamLoading}
                                    options={optionsForTeamRow(index)}
                                    value={row.userId || null}
                                    onChange={(val) =>
                                      updateTeamRow(index, {
                                        userId: val != null ? val : '',
                                      })
                                    }
                                    emptyMessage='No team members found.'
                                    searchPlaceholder='Name or email'
                                    error={staffError}
                                    className='**:[[role=combobox]]:text-[13px] md:**:[[role=combobox]]:text-[13px]'
                                  />
                                </div>
                                <div className='min-w-0'>
                                  <span className='text-muted-foreground mb-1 block text-[10px] font-semibold uppercase sm:sr-only'>
                                    Position
                                  </span>
                                  <TextField
                                    placeholder='e.g. Lead coach'
                                    maxLength={50}
                                    value={row.position}
                                    onChange={(e) =>
                                      updateTeamRow(index, {
                                        position: e.target.value,
                                      })
                                    }
                                    error={posError}
                                    className='text-[13px] md:text-[13px]'
                                    aria-label={`Position for member ${index + 1}`}
                                  />
                                </div>
                                <div className='flex justify-end sm:items-center sm:justify-center'>
                                  {teamRows.length > 1 ? (
                                    <Button
                                      type='button'
                                      variant='ghost'
                                      size='icon'
                                      className='text-muted-foreground hover:bg-muted hover:text-destructive size-8 shrink-0 rounded-md'
                                      aria-label={`Remove member ${index + 1}`}
                                      onClick={() => {
                                        setTeamRows((prev) =>
                                          prev.filter((_, i) => i !== index),
                                        );
                                        setCareErrors((p) =>
                                          clearCareTeamFieldErrors(p),
                                        );
                                      }}
                                    >
                                      <Trash2Icon className='size-4' />
                                    </Button>
                                  ) : (
                                    <span
                                      className='inline-block size-8 shrink-0'
                                      aria-hidden
                                    />
                                  )}
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {!detailLoading && !detailError ? (
          <DialogFooter className={enrollmentWizardDialogFooterClass}>
            <Button
              type='button'
              variant='outline'
              disabled={carePending}
              className={wizardOutlineButtonClass}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              form={CARE_FORM_ID}
              variant='default'
              disabled={carePending}
              className={wizardPrimaryButtonClass}
            >
              <SaveIcon className='size-3.5 shrink-0' />
              {carePending ? 'Saving…' : 'Save care team'}
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
