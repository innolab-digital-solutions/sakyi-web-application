'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import SelectField, {
  type SelectFieldOption,
} from '@/components/shared/form/SelectField';
import TextField from '@/components/shared/form/TextField';
import { Button } from '@/components/ui/button';
import { ENDPOINTS } from '@/config/api/endpoints';
import { ROUTES } from '@/config/routes';
import { UNIT_TYPE } from '@/domains/units/constants';
import {
  type UnitCreateInput,
  UnitCreateSchema,
  type UnitUpdateInput,
  UnitUpdateSchema,
} from '@/domains/units/schemas';
import type { Unit } from '@/domains/units/types/admin';
import { useForm } from '@/lib/form';

const UNIT_TYPE_OPTIONS: SelectFieldOption[] = [
  { value: UNIT_TYPE.VOLUME, label: 'Volume' },
  { value: UNIT_TYPE.MASS, label: 'Mass' },
  { value: UNIT_TYPE.COUNT, label: 'Count' },
  { value: UNIT_TYPE.LENGTH, label: 'Length' },
  { value: UNIT_TYPE.TIME, label: 'Time' },
  { value: UNIT_TYPE.ENERGY, label: 'Energy' },
];

const STATUS_OPTIONS: SelectFieldOption[] = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

type CreateProps = {
  mode: 'create';
  unit?: never;
  onSuccess?: () => void;
};

type EditProps = {
  mode: 'edit';
  unit: Unit;
  onSuccess?: () => void;
};

type Props = CreateProps | EditProps;

export default function UnitForm({ mode, unit, onSuccess }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = mode === 'edit';

  const form = useForm(
    {
      name: '',
      abbreviation: '',
      type: UNIT_TYPE.MASS,
      is_active: true,
    },
    { schema: isEdit ? UnitUpdateSchema : UnitCreateSchema },
  );

  useEffect(() => {
    if (!isEdit) return;
    if (!unit) return;
    form.setDataAndDefaults({
      name: unit.name ?? '',
      abbreviation: unit.abbreviation ?? '',
      type: unit.type,
      is_active: unit.is_active ?? true,
    });
    // Intentionally omit `form` to avoid re-snapshotting defaults.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, unit]);

  const submit = async () => {
    if (isEdit) {
      await form.patch(
        ENDPOINTS.ADMIN.MODULES.MEASUREMENT_UNITS.DETAIL(String(unit.id)),
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: ['table', ENDPOINTS.ADMIN.MODULES.MEASUREMENT_UNITS.LIST],
            });
            toast.success('Unit updated successfully.');
            if (onSuccess) onSuccess();
            else router.push(ROUTES.ADMIN.MODULES.MEASUREMENT_UNITS.LIST);
          },
          onFailure: (error) => {
            toast.error(error.message ?? 'Failed to update unit.');
          },
        },
      );
      return;
    }

    await form.post(ENDPOINTS.ADMIN.MODULES.MEASUREMENT_UNITS.CREATE, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['table', ENDPOINTS.ADMIN.MODULES.MEASUREMENT_UNITS.LIST],
        });
        toast.success('Unit created successfully.');
        if (onSuccess) onSuccess();
        else router.push(ROUTES.ADMIN.MODULES.MEASUREMENT_UNITS.LIST);
      },
      onFailure: (error) => {
        toast.error(error.message ?? 'Failed to create unit.');
      },
    });
  };

  const loading = form.isSubmitting;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      noValidate
    >
      <div className='space-y-6'>
        <TextField
          label='Name'
          required
          placeholder='e.g. Kilogram'
          value={String(form.fields.name ?? '')}
          onChange={(e) => form.setData('name', e.target.value)}
          error={form.errors.name}
        />
        <TextField
          label='Abbreviation'
          required
          placeholder='e.g. kg'
          value={String(form.fields.abbreviation ?? '')}
          onChange={(e) => form.setData('abbreviation', e.target.value)}
          error={form.errors.abbreviation}
        />
        <SelectField
          label='Type'
          name='type'
          required
          placeholder='Select a type…'
          options={UNIT_TYPE_OPTIONS}
          value={String(form.fields.type ?? '')}
          onChange={(val) => form.setData('type', val as UnitCreateInput['type'])}
          error={form.errors.type}
        />
        <SelectField
          label='Status'
          name='is_active'
          required
          placeholder='Select status…'
          options={STATUS_OPTIONS}
          value={String(form.fields.is_active ?? true)}
          onChange={(val) => form.setData('is_active', val === 'true')}
          error={form.errors.is_active}
        />

        <div className='flex items-center justify-end gap-3'>
          <Button
            type='button'
            variant='outline'
            disabled={loading}
            onClick={() =>
              onSuccess
                ? onSuccess()
                : router.push(ROUTES.ADMIN.MODULES.MEASUREMENT_UNITS.LIST)
            }
          >
            Cancel
          </Button>
          <Button type='submit' disabled={loading}>
            {loading
              ? isEdit
                ? 'Saving…'
                : 'Creating…'
              : isEdit
                ? 'Save Changes'
                : 'Create Unit'}
          </Button>
        </div>
      </div>
    </form>
  );
}
