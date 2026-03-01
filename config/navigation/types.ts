/**
 * A child navigation link rendered within a collapsible parent menu item.
 *
 * @property {string} name - Display label for the sub-navigation link.
 * @property {string} path - Route path the link navigates to.
 */
export interface SubNavItem {
  name: string;
  path: string;
}

/**
 * Top-level navigation entry used in headers, sidebars, and footers.
 *
 * @property {string} name - Display label for the navigation link.
 * @property {string} path - Route path the link navigates to.
 * @property {React.ComponentType} [icon] - Optional icon component rendered alongside the label.
 * @property {SubNavItem[]} [subitems] - Optional nested links shown in a collapsible submenu.
 */
export interface NavItem {
  name: string;
  path: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  subitems?: SubNavItem[];
}
