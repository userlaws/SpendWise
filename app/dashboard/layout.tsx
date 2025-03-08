'use client';

import React from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { AdminPrompt } from '@/components/admin-prompt';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminPrompt />
      <DashboardShell>{children}</DashboardShell>
    </>
  );
}
