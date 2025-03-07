'use client';

import React from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Remove the sidebar from here since it's already in the page components
  return <>{children}</>;
}
