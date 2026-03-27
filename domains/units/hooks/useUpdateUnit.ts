import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { ENDPOINTS } from '@/config/api/endpoints';
import { http } from '@/lib/api/client';

import type { UnitUpdateInput } from '../schemas';
import type { Unit } from '../types/admin';

async function updateUnit({
  id,
  data,
}: {
  id: number;
  data: UnitUpdateInput;
}): Promise<Unit> {
  const response = await http.patch<Unit>(
    ENDPOINTS.ADMIN.MODULES.UNITS.DETAIL(String(id)),
    data,
  );

  if (response.status !== 'success') {
    throw new Error('Failed to update unit.');
  }

  return response.data;
}

export function useUpdateUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['table', ENDPOINTS.ADMIN.MODULES.UNITS.LIST],
      });
      toast.success('Unit updated successfully.');
    },
  });
}
