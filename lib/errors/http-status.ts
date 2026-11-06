export type SupportedErrorStatus = 400 | 403 | 404 | 429 | 500 | 503;

export type ErrorPresentation = {
  code: SupportedErrorStatus;
  title: string;
  description: string;
  imageSrc: string;
};

const SUPPORTED_STATUS_CODES: SupportedErrorStatus[] = [
  400, 403, 404, 429, 500, 503,
];

const ERROR_PRESENTATIONS: Record<SupportedErrorStatus, ErrorPresentation> = {
  400: {
    code: 400,
    title: 'Bad Request',
    description:
      'The request could not be processed. Please verify your input and try again.',
    imageSrc: '/images/400.png',
  },
  403: {
    code: 403,
    title: 'Forbidden',
    description:
      'You do not have permission to access this resource. Contact support if this seems incorrect.',
    imageSrc: '/images/403.png',
  },
  404: {
    code: 404,
    title: 'Page Not Found',
    description:
      'The page you are looking for does not exist or may have been moved.',
    imageSrc: '/images/404.png',
  },
  429: {
    code: 429,
    title: 'Too Many Requests',
    description:
      'Too many requests were sent in a short time. Please wait a moment and try again.',
    imageSrc: '/images/429.png',
  },
  500: {
    code: 500,
    title: 'Internal Server Error',
    description:
      'Something unexpected happened on the server. Please try again shortly.',
    imageSrc: '/images/500.png',
  },
  503: {
    code: 503,
    title: 'Service Unavailable',
    description:
      'The service is temporarily unavailable. Please try again in a few moments.',
    imageSrc: '/images/503.png',
  },
};

const FALLBACK_STATUS: SupportedErrorStatus = 500;

export const isSupportedErrorStatus = (
  value: number,
): value is SupportedErrorStatus => {
  return SUPPORTED_STATUS_CODES.includes(value as SupportedErrorStatus);
};

export const getErrorPresentation = (status: number): ErrorPresentation => {
  if (!isSupportedErrorStatus(status)) {
    return ERROR_PRESENTATIONS[FALLBACK_STATUS];
  }

  return ERROR_PRESENTATIONS[status];
};

export const resolveStatusFromUnknownError = (
  error: unknown,
  fallback: SupportedErrorStatus = FALLBACK_STATUS,
): SupportedErrorStatus => {
  if (!error || typeof error !== 'object') return fallback;

  const maybeStatus = (error as { status?: unknown }).status;
  if (typeof maybeStatus === 'number' && isSupportedErrorStatus(maybeStatus)) {
    return maybeStatus;
  }

  return fallback;
};
