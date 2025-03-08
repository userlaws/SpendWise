'use client';

import React from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';

// The demo layout simply uses the DashboardLayout component
// The banner for demo mode is already handled inside DashboardLayout
export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Using the parent dashboard layout which handles both regular and demo mode
  return children;
}
