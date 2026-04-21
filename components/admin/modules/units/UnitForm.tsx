'use client';

import { useQueryClient } from '@tanstack/react-query';
import { SaveIcon, Scale } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';

import SelectField, {
  type SelectFieldOption,
} from '@/components/shared/form/SelectField';
import TextField from '@/components/shared/form/TextField';
import { Button } from '@/components/ui/button';
import { ENDPOINTS } from '@/config/api/endpoints';
import { ROUTES } from '@/config/routes';
import { getUnitTypeFromRecord } from '@/domains/units/coerce-unit-type';
import { UNIT_TYPE } from '@/domains/units/constants';
import {
  type UnitCreateInput,
  UnitCreateSchema,
  UnitUpdateSchema,
} from '@/domains/units/schemas';
import type { Unit } from '@/domains/units/types';
import { useForm } from '@/lib/form';

const UNIT_TYPE_VALUES = Object.values(UNIT_TYPE) as string[];

const UNIT_TYPE_OPTIONS: SelectFieldOption[] = [
  { value: UNIT_TYPE.VOLUME, label: 'Volume' },
  { value: UNIT_TYPE.MASS, label: 'Mass' },
  { value: UNIT_TYPE.COUNT, label: 'Count' },
  { value: UNIT_TYPE.LENGTH, label: 'Length' },
  { value: UNIT_TYPE.TIME, label: 'Time' },
  { value: UNIT_TYPE.ENERGY, label: 'Energy' },
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

  const initialFields = useMemo(() => {
    if (mode === 'edit' && unit) {
      return {
        name: unit.name ?? '',
        abbreviation: unit.abbreviation ?? '',
        type: getUnitTypeFromRecord(unit),
        is_active: unit.is_active ?? true,
      };
    }
    return {
      name: '',
      abbreviation: '',
      type: undefined as string | undefined,
      is_active: true,
    };
  }, [mode, unit]);

  const form = useForm(initialFields, {
    schema: isEdit ? UnitUpdateSchema : UnitCreateSchema,
  });

  useEffect(() => {
    if (mode !== 'edit' || !unit) return;
    form.setDataAndDefaults({
      name: unit.name ?? '',
      abbreviation: unit.abbreviation ?? '',
      type: getUnitTypeFromRecord(unit),
      is_active: unit.is_active ?? true,
    });
    // Intentionally omit `form` to avoid re-snapshotting defaults.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, unit]);

  const submit = async () => {
    if (isEdit) {
      await form.patch(ENDPOINTS.ADMIN.MODULES.UNITS.DETAIL(String(unit.id)), {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ['table', ENDPOINTS.ADMIN.MODULES.UNITS.LIST],
          });
          toast.success('Measurement has been updated successfully.');
          if (onSuccess) onSuccess();
          else router.push(ROUTES.ADMIN.MODULES.UNITS.LIST);
        },
        onFailure: (error) => {
          toast.error(error.message ?? 'Failed to save changes.');
        },
      });
      return;
    }

    await form.post(ENDPOINTS.ADMIN.MODULES.UNITS.CREATE, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['table', ENDPOINTS.ADMIN.MODULES.UNITS.LIST],
        });
        toast.success('Measurement has been created successfully.');
        if (onSuccess) onSuccess();
        else router.push(ROUTES.ADMIN.MODULES.UNITS.LIST);
      },
      onFailure: (error) => {
        toast.error(error.message ?? 'Failed to add measurement.');
      },
    });
  };

  const loading = form.isSubmitting;

  const typeFieldValue = form.fields.type;
  const typeSelectValue =
    typeof typeFieldValue === 'string' &&
    UNIT_TYPE_VALUES.includes(typeFieldValue.toLowerCase())
      ? typeFieldValue.toLowerCase()
      : undefined;

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
          label='Measurement Name'
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
          key={
            mode === 'edit'
              ? `edit-type-${unit.id}-${typeSelectValue ?? 'none'}`
              : 'create-type'
          }
          label='Measurement Type'
          name='type'
          required
          placeholder='Select a type…'
          options={UNIT_TYPE_OPTIONS}
          value={typeSelectValue}
          onChange={(val) =>
            form.setData('type', val as UnitCreateInput['type'])
          }
          error={form.errors.type}
        />

        <div className='flex flex-nowrap items-center justify-end gap-2'>
          <Button
            type='button'
            variant='outline'
            disabled={loading}
            className='text-foreground bg-background hover:bg-muted h-10 shrink-0 cursor-pointer gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
            onClick={() =>
              onSuccess
                ? onSuccess()
                : router.push(ROUTES.ADMIN.MODULES.UNITS.LIST)
            }
          >
            Cancel
          </Button>
          <Button
            type='submit'
            disabled={loading}
            className='h-10 shrink-0 gap-1.5 rounded-md px-3 text-[13px]! font-semibold'
          >
            {isEdit ? (
              <SaveIcon className='size-3.5' />
            ) : (
              <Scale className='size-3.5' />
            )}
            {loading
              ? isEdit
                ? 'Saving Changes…'
                : 'Creating Measurement…'
              : isEdit
                ? 'Save Changes'
                : 'Create Measurement'}
          </Button>
        </div>
      </div>
    </form>
  );
}
