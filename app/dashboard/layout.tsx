'use client';

import { LayoutGrid, LineChart, BarChart3, User } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { NavigationItem } from '@/types';

const dashboardRoutes: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutGrid,
  },
  {
    name: 'Transactions',
    href: '/transactions',
    icon: LineChart,
  },
  {
    name: 'Budget',
    href: '/budget',
    icon: BarChart3,
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: User,
  },
];

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout routes={dashboardRoutes}>{children}</DashboardLayout>;
}
