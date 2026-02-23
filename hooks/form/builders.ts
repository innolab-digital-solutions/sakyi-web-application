import { HttpMethod } from "@/lib/api/client/types";
import { ZodType } from "zod";
import { InternalSubmitOptions, SubmitOptions, TransformFn, TransformMethods } from "./types";

/**
 * Internal submit function type that accepts transform.
 * Used by method builders internally.
 */
type InternalSubmitFn<TSchema extends ZodType> = <TResponse = unknown>(
  method: HttpMethod,
  url: string,
  options?: InternalSubmitOptions<TResponse, TSchema>,
) => Promise<void>;

/**
 * Build HTTP method shortcuts from the core submit function.
 * Returns get, post, put, patch, destroy methods.
 *
 * @template TSchema - Zod schema type
 * @param submit - Core submit function
 * @returns Object with HTTP method shortcuts
 */
export const buildSubmitShortcuts = <TSchema extends ZodType>(submit: InternalSubmitFn<TSchema>) => {
  const get = <TResponse = unknown>(
    url: string,
    options?: SubmitOptions<TResponse>,
  ) => submit<TResponse>("GET", url, options);

  const post = <TResponse = unknown>(
    url: string,
    options?: SubmitOptions<TResponse>,
  ) => submit<TResponse>("POST", url, options);

  const put = <TResponse = unknown>(
    url: string,
    options?: SubmitOptions<TResponse>,
  ) => submit<TResponse>("PUT", url, options);

  const patch = <TResponse = unknown>(
    url: string,
    options?: SubmitOptions<TResponse>,
  ) => submit<TResponse>("PATCH", url, options);

  const destroy = <TResponse = unknown>(
    url: string,
    options?: SubmitOptions<TResponse>,
  ) => submit<TResponse>("DELETE", url, options);

  return { get, post, put, patch, destroy };
};

/**
 * Build chainable transform methods for form.transform().post() pattern.
 * Returns HTTP methods that apply the transform before submission.
 *
 * @template TSchema - Zod schema type
 * @param submit - Core submit function
 * @param transformFn - Data transformation function
 * @returns Chainable HTTP methods with transform applied
 */
export const buildTransformChain = <TSchema extends ZodType>(
  submit: InternalSubmitFn<TSchema>,
  transformFn: TransformFn<TSchema>,
): TransformMethods => {
  const withMethod =
    <TResponse = unknown>(method: HttpMethod) =>
    (url: string, options?: SubmitOptions<TResponse>) =>
      submit<TResponse>(method, url, { ...options, transform: transformFn });

  return {
    get: withMethod("GET"),
    post: withMethod("POST"),
    put: withMethod("PUT"),
    patch: withMethod("PATCH"),
    destroy: withMethod("DELETE"),
  };
};
