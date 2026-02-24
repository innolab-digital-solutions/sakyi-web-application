export const ENDPOINTS = {
  ADMIN: {
    OVERVIEW: '/admin/overview',
    AUTH: {
      LOGIN: '/web/admin/auth/login',
      LOGOUT: '/web/admin/auth/logout',
      ME: '/web/admin/auth/me',
    },
  },
} as const;
