import { redirect } from 'next/navigation';

import { ROUTES } from '@/config/routes';

export default function CarePlanCreatePage() {
  redirect(ROUTES.ADMIN.MODULES.CARE_PLANS.LIST);
}
