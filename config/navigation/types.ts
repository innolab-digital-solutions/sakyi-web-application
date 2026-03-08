/**
 * Represents a navigation item for use in navigation menus.
 *
 * - For Admin navigation: Represents primary and (optionally) nested sidebar links.
 * - For Marketing/Site navigation: Represents header or footer nav links.
 */
export type NavItem = {
  name: string;
  path: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  subitems?: NavItem[];
};
