import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { ENDPOINTS } from '@/config/api/endpoints';
import { http } from '@/lib/api/client';

async function deleteUnit(id: number): Promise<void> {
  const response = await http.delete(
    ENDPOINTS.ADMIN.MODULES.MEASUREMENT_UNITS.DETAIL(String(id)),
  );

  if (response.status !== 'success') {
    throw new Error('Failed to delete unit.');
  }
}

export function useDeleteUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUnit,
    onSuccess: () => {
      toast.success('Unit deleted successfully.');
      queryClient.invalidateQueries({
        queryKey: ['table', ENDPOINTS.ADMIN.MODULES.MEASUREMENT_UNITS.LIST],
      });
    },
    onError: (error) => {
      toast.error(error.message ?? 'Failed to delete unit.');
    },
  });
}
