import { FormSubmitFunction, FormSubmitOptions } from './types';

/**
 * Builds HTTP method shortcut functions (get, post, put, patch, destroy)
 * from a provided core form submit function.
 *
 * Each shortcut returns a Promise that resolves when the form submission completes,
 * and delegates to the provided core submit function using the specified HTTP method.
 *
 * @param {FormSubmitFunction} submit - Core form submit function that executes a request according to method, URL, and options.
 * @returns {Object} An object containing shortcut methods for 'GET', 'POST', 'PUT', 'PATCH', and 'DELETE' (as 'destroy').
 *
 * @example
 * const submitShortcuts = buildSubmitShortcuts(submit);
 * submitShortcuts.post('/api/login', { onSuccess: ... });
 */
export const buildSubmitShortcuts = (submit: FormSubmitFunction) => {
  return {
    /**
     * Sends a 'GET' HTTP request via the core form submit function.
     *
     * @param {string} url - The target URL or API endpoint for the GET request.
     * @param {FormSubmitOptions} [options={}] - Optional form submission options, including callbacks (onSuccess, onError, etc.) or params.
     * @returns {Promise<void>} Promise that resolves when the submission is complete.
     */
    get: (url: string, options: FormSubmitOptions = {}): Promise<void> => {
      return submit('GET', url, options);
    },

    /**
     * Sends a 'POST' HTTP request via the core form submit function.
     *
     * @param {string} url - The target URL or API endpoint for the POST request.
     * @param {FormSubmitOptions} [options={}] - Optional form submission options, including callbacks (onSuccess, onError, etc.) or params.
     * @returns {Promise<void>} Promise that resolves when the submission is complete.
     */
    post: (url: string, options: FormSubmitOptions = {}): Promise<void> => {
      return submit('POST', url, options);
    },

    /**
     * Sends a 'PUT' HTTP request via the core form submit function.
     *
     * @param {string} url - The target URL or API endpoint for the PUT request.
     * @param {FormSubmitOptions} [options={}] - Optional form submission options, including callbacks (onSuccess, onError, etc.) or params.
     * @returns {Promise<void>} Promise that resolves when the submission is complete.
     */
    put: (url: string, options: FormSubmitOptions = {}): Promise<void> => {
      return submit('PUT', url, options);
    },

    /**
     * Sends a 'PATCH' HTTP request via the core form submit function.
     *
     * @param {string} url - The target URL or API endpoint for the PATCH request.
     * @param {FormSubmitOptions} [options={}] - Optional form submission options, including callbacks (onSuccess, onError, etc.) or params.
     * @returns {Promise<void>} Promise that resolves when the submission is complete.
     */
    patch: (url: string, options: FormSubmitOptions = {}): Promise<void> => {
      return submit('PATCH', url, options);
    },

    /**
     * Sends a 'DELETE' HTTP request via the core form submit function.
     *
     * @param {string} url - The target URL or API endpoint for the DELETE request.
     * @param {FormSubmitOptions} [options={}] - Optional form submission options, including callbacks (onSuccess, onError, etc.) or params.
     * @returns {Promise<void>} Promise that resolves when the submission is complete.
     */
    destroy: (url: string, options: FormSubmitOptions = {}): Promise<void> => {
      return submit('DELETE', url, options);
    },
  };
};
