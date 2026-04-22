'use client';

type GlobalErrorProps = {
  reset: () => void;
};

/**
 * Catches errors in the root layout. Must include `html` and `body`.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/error
 */
export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang='en'>
      <body className='font-sans antialiased'>
        <div className='flex min-h-screen flex-col items-center justify-center gap-4 px-4'>
          <h1 className='text-xl font-semibold'>Something went wrong</h1>
          <button
            type='button'
            className='rounded-md border px-4 py-2 text-sm'
            onClick={() => reset()}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
