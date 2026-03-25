'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { type Resolver, useForm } from 'react-hook-form';

import SelectField, {
  type SelectFieldOption,
} from '@/components/shared/form/SelectField';
import TextField from '@/components/shared/form/TextField';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import { UNIT_TYPE } from '@/domains/units/constants';
import { useCreateUnit } from '@/domains/units/hooks/useCreateUnit';
import { useUpdateUnit } from '@/domains/units/hooks/useUpdateUnit';
import {
  type UnitCreateInput,
  UnitCreateSchema,
  type UnitUpdateInput,
  UnitUpdateSchema,
} from '@/domains/units/schemas';
import type { Unit } from '@/domains/units/types/admin';

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
  const isEdit = mode === 'edit';

  const { mutateAsync: createUnit, isPending: isCreating } = useCreateUnit();
  const { mutateAsync: updateUnit, isPending: isUpdating } = useUpdateUnit();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UnitCreateInput | UnitUpdateInput>({
    resolver: zodResolver(
      isEdit ? UnitUpdateSchema : UnitCreateSchema,
    ) as Resolver<UnitCreateInput | UnitUpdateInput>,
    defaultValues: {
      name: unit?.name ?? '',
      abbreviation: unit?.abbreviation ?? '',
      type: unit?.type,
      is_active: unit?.is_active ?? true,
    },
  });

  const onSubmit = async (data: UnitCreateInput | UnitUpdateInput) => {
    if (isEdit) {
      await updateUnit({ id: unit.id, data: data as UnitUpdateInput });
    } else {
      await createUnit(data as UnitCreateInput);
    }

    if (onSuccess) {
      onSuccess();
    } else {
      router.push(ROUTES.ADMIN.MODULES.MEASUREMENT_UNITS.LIST);
    }
  };

  const loading = isSubmitting || isCreating || isUpdating;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className='space-y-6'>
        <TextField
          label='Name'
          required
          placeholder='e.g. Kilogram'
          error={errors.name?.message}
          {...register('name')}
        />
        <TextField
          label='Abbreviation'
          required
          placeholder='e.g. kg'
          error={errors.abbreviation?.message}
          {...register('abbreviation')}
        />
        <SelectField
          label='Type'
          name='type'
          required
          placeholder='Select a type…'
          options={UNIT_TYPE_OPTIONS}
          value={watch('type')}
          onChange={(val) =>
            setValue('type', val as UnitCreateInput['type'], {
              shouldValidate: true,
            })
          }
          error={errors.type?.message}
        />
        <SelectField
          label='Status'
          name='is_active'
          required
          placeholder='Select status…'
          options={STATUS_OPTIONS}
          value={String(watch('is_active'))}
          onChange={(val) =>
            setValue('is_active', val === 'true', {
              shouldValidate: true,
            })
          }
          error={errors.is_active?.message}
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
