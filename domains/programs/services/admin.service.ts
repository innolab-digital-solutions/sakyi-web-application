import { base } from '@/config/api/base';
import { ENDPOINTS } from '@/config/api/endpoints';
import type { ApiResponse } from '@/lib/api/client';
import { http } from '@/lib/api/client';

import type { Program, ProgramStructureItem } from '../types/admin';

export type ProgramTranslationPayload = {
  locale: 'en' | 'my';
  title: string;
  tagline: string;
  excerpt: string;
  about: string;
  features: string[];
  ideals: string[];
  expectations: string[];
  structures: ProgramStructureItem[];
};

/**
 * Program save fields (JSON or multipart). Thumbnail is sent as a **file** when uploading
 * (Laravel `image` rule), not as a JSON string.
 */
export type ProgramSavePayload = {
  id?: number;
  duration: string;
  price: number;
  goal_ids: number[];
  translations: ProgramTranslationPayload[];
  status: 'draft' | 'published' | 'hidden';
};

type ProgramSaveFormFields = Omit<ProgramSavePayload, 'id'>;

function stripId(body: ProgramSavePayload): ProgramSaveFormFields {
  const { id: _omit, ...fields } = body;
  return fields;
}

/**
 * Laravel-friendly multipart shape (matches typical PHP array parsing).
 */
function appendProgramSaveToFormData(
  form: FormData,
  body: ProgramSaveFormFields,
): void {
  form.append('duration', body.duration);
  form.append('price', String(body.price));
  form.append('status', body.status);
  for (const gid of body.goal_ids) {
    form.append('goal_ids[]', String(gid));
  }
  body.translations.forEach((t, i) => {
    form.append(`translations[${i}][locale]`, t.locale);
    form.append(`translations[${i}][title]`, t.title);
    form.append(`translations[${i}][tagline]`, t.tagline);
    form.append(`translations[${i}][excerpt]`, t.excerpt);
    form.append(`translations[${i}][about]`, t.about);
    t.features.forEach((f, j) => {
      form.append(`translations[${i}][features][${j}]`, f);
    });
    t.ideals.forEach((f, j) => {
      form.append(`translations[${i}][ideals][${j}]`, f);
    });
    t.expectations.forEach((f, j) => {
      form.append(`translations[${i}][expectations][${j}]`, f);
    });
    t.structures.forEach((s, k) => {
      form.append(`translations[${i}][structures][${k}][period]`, s.period);
      form.append(`translations[${i}][structures][${k}][title]`, s.title);
      form.append(
        `translations[${i}][structures][${k}][description]`,
        s.description,
      );
    });
  });
}

/**
 * - **Create:** `POST` multipart with `thumbnail` file + form fields (Laravel `required|image`).
 * - **Update + new image:** `PUT` multipart with file + fields.
 * - **Update, keep image:** `PUT` JSON (no `thumbnail` part).
 */
export async function saveProgram(
  body: ProgramSavePayload,
  thumbnailFile: File | null,
): Promise<ApiResponse<Program>> {
  const programId = body.id;

  if (programId != null) {
    const fields = stripId(body);
    if (thumbnailFile) {
      const form = new FormData();
      form.append('thumbnail', thumbnailFile);
      appendProgramSaveToFormData(form, fields);
      return http.put<Program>(
        ENDPOINTS.ADMIN.MODULES.PROGRAMS.UPDATE(String(programId)),
        form,
      );
    }
    return http.put<Program>(
      ENDPOINTS.ADMIN.MODULES.PROGRAMS.UPDATE(String(programId)),
      fields,
    );
  }

  if (!thumbnailFile) {
    return {
      status: 'error',
      message: 'Thumbnail is required.',
      errors: { thumbnail: 'Thumbnail is required.' },
      meta: { version: base.apiVersion },
    };
  }

  const form = new FormData();
  form.append('thumbnail', thumbnailFile);
  appendProgramSaveToFormData(form, stripId(body));
  return http.post<Program>(ENDPOINTS.ADMIN.MODULES.PROGRAMS.CREATE, form);
}

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
