'use client';

import { useQueryClient } from '@tanstack/react-query';
import { AxeIcon, SaveIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';

import TextField from '@/components/shared/form/TextField';
import { Button } from '@/components/ui/button';
import { ENDPOINTS } from '@/config/api/endpoints';
import { LOOKUP_ENDPOINTS } from '@/config/api/endpoints/lookup';
import { ROUTES } from '@/config/routes';
import {
  MovementEquipmentCreateSchema,
  MovementEquipmentUpdateSchema,
} from '@/domains/movement-equipment/schemas';
import type { MovementEquipment } from '@/domains/movement-equipment/types';
import { useForm } from '@/lib/form';

type CreateProps = {
  mode: 'create';
  equipment?: never;
  onSuccess?: () => void;
};

type EditProps = {
  mode: 'edit';
  equipment: MovementEquipment;
  onSuccess?: () => void;
};

type Props = CreateProps | EditProps;

export default function MovementEquipmentForm({
  mode,
  equipment,
  onSuccess,
}: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = mode === 'edit';

  const initialFields = useMemo(() => {
    if (mode === 'edit' && equipment) {
      return {
        name: equipment.name ?? '',
        is_active: equipment.is_active ?? true,
      };
    }
    return {
      name: '',
      is_active: true,
    };
  }, [mode, equipment]);

  const form = useForm(initialFields, {
    schema: isEdit
      ? MovementEquipmentUpdateSchema
      : MovementEquipmentCreateSchema,
  });

  useEffect(() => {
    if (mode !== 'edit' || !equipment) return;
    form.setDataAndDefaults({
      name: equipment.name ?? '',
      is_active: equipment.is_active ?? true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, equipment]);

  const submit = async () => {
    if (isEdit) {
      await form.patch(
        ENDPOINTS.ADMIN.MODULES.MOVEMENT_EQUIPMENT.DETAIL(String(equipment.id)),
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: [
                'table',
                ENDPOINTS.ADMIN.MODULES.MOVEMENT_EQUIPMENT.LIST,
              ],
            });
            queryClient.invalidateQueries({
              queryKey: ['lookup', LOOKUP_ENDPOINTS.MOVEMENT_EQUIPMENT],
            });
            toast.success('Equipment has been updated successfully.');
            if (onSuccess) onSuccess();
            else router.push(ROUTES.ADMIN.MODULES.MOVEMENT_EQUIPMENT.LIST);
          },
          onFailure: (error) => {
            toast.error(error.message ?? 'Failed to update equipment.');
          },
        },
      );
      return;
    }

    await form.post(ENDPOINTS.ADMIN.MODULES.MOVEMENT_EQUIPMENT.CREATE, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['table', ENDPOINTS.ADMIN.MODULES.MOVEMENT_EQUIPMENT.LIST],
        });
        queryClient.invalidateQueries({
          queryKey: ['lookup', LOOKUP_ENDPOINTS.MOVEMENT_EQUIPMENT],
        });
        toast.success('Equipment has been created successfully.');
        if (onSuccess) onSuccess();
        else router.push(ROUTES.ADMIN.MODULES.MOVEMENT_EQUIPMENT.LIST);
      },
      onFailure: (error) => {
        toast.error(error.message ?? 'Failed to create equipment.');
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
          label='Equipment Name'
          required
          placeholder='e.g. Resistance Band'
          value={String(form.fields.name ?? '')}
          onChange={(e) => form.setData('name', e.target.value)}
          error={form.errors.name}
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
                : router.push(ROUTES.ADMIN.MODULES.MOVEMENT_EQUIPMENT.LIST)
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
              <AxeIcon className='size-3.5' />
            )}
            {loading
              ? isEdit
                ? 'Saving Changes…'
                : 'Creating…'
              : isEdit
                ? 'Save Changes'
                : 'Create equipment'}
          </Button>
        </div>
      </div>
    </form>
  );
}
