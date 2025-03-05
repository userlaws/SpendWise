'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, CreditCard, BarChart3, User } from 'lucide-react';

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Define demo routes for navigation
  const demoRoutes = [
    {
      href: '/dashboard/demo/dashboard',
      label: 'Dashboard',
      icon: Home,
      active: pathname === '/dashboard/demo/dashboard',
    },
    {
      href: '/dashboard/demo/transactions',
      label: 'Transactions',
      icon: CreditCard,
      active: pathname === '/dashboard/demo/transactions',
    },
    {
      href: '/dashboard/demo/budget',
      label: 'Budget',
      icon: BarChart3,
      active: pathname === '/dashboard/demo/budget',
    },
    {
      href: '/dashboard/demo/profile',
      label: 'Profile',
      icon: User,
      active: pathname === '/dashboard/demo/profile',
    },
  ];

  return (
    <>
      <div className='bg-yellow-500 text-black py-1 px-4 text-center text-sm font-medium'>
        Demo Mode - Sample data only. No account required.
      </div>
      {children}
    </>
  );
}
