export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ApiSuccess<T> = {
  status: 'success';
  message: string;
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiError = {
  status: 'error';
  message: string;
  errors?: Record<string, unknown>;
  data?: unknown;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
