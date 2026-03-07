import { ADMIN_NAVIGATION } from './admin';
import { HEADER_NAVIGATION } from './site';

const NAVIGATION = {
  ADMIN: ADMIN_NAVIGATION,
  SITE: {
    HEADER: HEADER_NAVIGATION,
  },
} as const;

export { NAVIGATION as default };
