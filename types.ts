/**
 * Navigation item interface for dashboard routes
 */
export interface NavigationItem {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  active?: boolean;
}
