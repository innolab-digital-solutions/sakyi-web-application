import { ENDPOINTS } from '@/config/api/endpoints';
import type { ApiResponse } from '@/lib/api/client';
import { http } from '@/lib/api/client';

import type { Program } from '../types/admin';

export type ProgramTranslationPayload = {
  locale: 'en' | 'my';
  title: string;
  tagline: string;
  excerpt: string;
  about: string;
  features: string[];
  ideals: string[];
  expectations: string[];
  structures: string[];
};

/**
 * Create an empty program draft.
 * The backend ignores any payload — it returns the bare draft record.
 */
export async function createProgramDraft(): Promise<ApiResponse<Program>> {
  return http.post<Program>(ENDPOINTS.ADMIN.MODULES.PROGRAMS.CREATE, {});
}

/**
 * Save the overview step (thumbnail, duration, price, goal_ids).
 * `price` is a flat integer (no currency).
 * When `thumbnail` is provided it is sent as multipart/form-data automatically.
 */
export async function saveProgramOverview(
  id: number,
  data: { duration?: string; price?: number; goal_ids?: number[] },
  thumbnail?: File | null,
): Promise<ApiResponse<Program>> {
  if (thumbnail) {
    const form = new FormData();
    form.append('thumbnail', thumbnail);
    if (data.duration) form.append('duration', data.duration);
    if (data.price != null) form.append('price', String(data.price));
    if (data.goal_ids?.length) {
      data.goal_ids.forEach((id) => form.append('goal_ids[]', String(id)));
    }
    return http.put<Program>(
      ENDPOINTS.ADMIN.MODULES.PROGRAMS.STEPS.OVERVIEW(String(id)),
      form,
    );
  }

  return http.put<Program>(
    ENDPOINTS.ADMIN.MODULES.PROGRAMS.STEPS.OVERVIEW(String(id)),
    {
      ...(data.duration ? { duration: data.duration } : {}),
      ...(data.price != null ? { price: data.price } : {}),
      ...(data.goal_ids?.length ? { goal_ids: data.goal_ids } : {}),
    },
  );
}

/**
 * Save the translations step.
 * Only locales with a non-empty title are included; all included locales must
 * have every field filled (backend validates as required).
 */
export async function saveProgramTranslations(
  id: number,
  translations: ProgramTranslationPayload[],
): Promise<ApiResponse<Program>> {
  return http.put<Program>(
    ENDPOINTS.ADMIN.MODULES.PROGRAMS.STEPS.TRANSLATIONS(String(id)),
    { translations },
  );
}

/**
 * Publish the program (requires overview + translations steps to be complete).
 */
export async function publishProgram(
  id: number,
): Promise<ApiResponse<Program>> {
  return http.post<Program>(
    ENDPOINTS.ADMIN.MODULES.PROGRAMS.PUBLISH(String(id)),
    {},
  );
}

/**
 * Fetches a single program for admin edit/detail views.
 * Pass `locale` to get translated fields for that locale (`en` | `my`).
 */
export async function getProgramById(
  id: number,
  options?: { locale?: 'en' | 'my' },
): Promise<ApiResponse<Program>> {
  const qs =
    options?.locale != null
      ? `?locale=${encodeURIComponent(options.locale)}`
      : '';
  return http.get<Program>(
    `${ENDPOINTS.ADMIN.MODULES.PROGRAMS.DETAIL(String(id))}${qs}`,
  );
}

export async function getPrograms(): Promise<ApiResponse<Program[]>> {
  return http.get<Program[]>(ENDPOINTS.ADMIN.MODULES.PROGRAMS.LIST);
}

export async function deleteProgram(id: number): Promise<ApiResponse<null>> {
  return http.delete<null>(ENDPOINTS.ADMIN.MODULES.PROGRAMS.DELETE(String(id)));
}
