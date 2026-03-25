import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { ENDPOINTS } from '@/config/api/endpoints';
import { http } from '@/lib/api/client';

import type { UnitCreateInput } from '../schemas';
import type { Unit } from '../types/admin';

async function createUnit(data: UnitCreateInput): Promise<Unit> {
  const response = await http.post<Unit>(
    ENDPOINTS.ADMIN.MODULES.MEASUREMENT_UNITS.LIST,
    data,
  );

  if (response.status !== 'success') {
    throw new Error('Failed to create unit.');
  }

  return response.data;
}

export function useCreateUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['table', ENDPOINTS.ADMIN.MODULES.MEASUREMENT_UNITS.LIST],
      });
      toast.success('Unit created successfully.');
    },
    onError: (error) => {
      toast.error(error.message ?? 'Failed to create unit.');
    },
  });
}
