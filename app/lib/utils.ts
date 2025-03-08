import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency with $ and commas
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

// Format date to readable format
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

// Calculate percentage
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

// Improved safe select value function
export function getSafeSelectValue(value: any): string {
  if (value === null || value === undefined || value === '') {
    return `default-${Math.random().toString(36).substring(2, 10)}`;
  }
  return String(value);
}

// Get a safe category ID with multiple fallbacks
export function getSafeCategoryId(category: any): string {
  if (!category) return `category-${Date.now()}`;

  if (category.category_id) return category.category_id;
  if (category.id) return category.id;
  if (typeof category.name === 'string' && category.name.trim() !== '')
    return category.name;

  return `category-${Date.now()}`;
}

// Ensure an array is never null or undefined
export function ensureArray<T>(input: T[] | null | undefined): T[] {
  return input || [];
}

// Generate a unique ID for use in select items
export function generateUniqueId(prefix = 'id'): string {
  return `${prefix}-${Math.random()
    .toString(36)
    .substring(2, 10)}-${Date.now().toString(36)}`;
}

// Safely handle empty or null category objects
export function getSafeCategoryName(category: any): string {
  if (!category) return 'Uncategorized';

  if (
    typeof category.category_name === 'string' &&
    category.category_name.trim() !== ''
  )
    return category.category_name;
  if (typeof category.name === 'string' && category.name.trim() !== '')
    return category.name;

  return 'Uncategorized';
}
