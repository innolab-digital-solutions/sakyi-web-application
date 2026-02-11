export interface SubNavItem {
  name: string;
  path: string;
}

export interface NavItem {
  name: string;
  path: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  subitems?: SubNavItem[];
}
