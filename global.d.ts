/**
 * Global type declarations for importing CSS files.
 *
 * This allows TypeScript to understand imports of `.css` files,
 * including side-effect-only imports like `import './globals.css';`.
 */
declare module '*.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
