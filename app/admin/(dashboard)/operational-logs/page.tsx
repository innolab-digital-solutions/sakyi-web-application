import { redirect } from 'next/navigation';

import { ROUTES } from '@/config/routes';

export default function OperationalLogsListPage() {
  redirect(ROUTES.ADMIN.MODULES.CARE_PLAN_LOGS.LIST);
}
