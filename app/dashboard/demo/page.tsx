'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

// Demo data - static information that doesn't require authentication
const DEMO_DATA = {
  recentTransactions: [
    {
      id: 1,
      description: 'Grocery Shopping',
      amount: -120.5,
      date: '2023-03-01',
      category: 'Food',
    },
    {
      id: 2,
      description: 'Salary Deposit',
      amount: 2500.0,
      date: '2023-02-28',
      category: 'Income',
    },
    {
      id: 3,
      description: 'Electric Bill',
      amount: -85.2,
      date: '2023-02-25',
      category: 'Utilities',
    },
    {
      id: 4,
      description: 'Restaurant Dinner',
      amount: -45.8,
      date: '2023-02-22',
      category: 'Food',
    },
    {
      id: 5,
      description: 'Subscription Service',
      amount: -12.99,
      date: '2023-02-20',
      category: 'Entertainment',
    },
  ],
  spendingByCategory: [
    { category: 'Food', amount: 450.3 },
    { category: 'Housing', amount: 1200.0 },
    { category: 'Transportation', amount: 250.75 },
    { category: 'Entertainment', amount: 180.5 },
    { category: 'Utilities', amount: 320.4 },
  ],
  monthlyBudget: 3500,
  totalSpent: 2401.95,
  savingsGoal: 10000,
  currentSavings: 5750,
};

export default function DemoPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Show demo mode toast when page loads
  useEffect(() => {
    toast({
      title: 'Demo Mode Active',
      description:
        "You're viewing SpendWise in demo mode. No real data is being displayed.",
      duration: 5000,
    });
  }, [toast]);

  useEffect(() => {
    const fetchDemoData = async () => {
      try {
        const { data, error } = await supabase.from('demo_data').select('*');
        if (error) throw error;
        // Handle demo data...
      } catch (error) {
        console.error('Error fetching demo data:', error);
      }
    };
    fetchDemoData();
  }, []);

  return (
    <div className='p-4 md:p-6 space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold tracking-tight'>Demo Dashboard</h1>
        <Button
          onClick={() => {
            toast({
              title: 'Demo Feature',
              description:
                'This action would require a real account. Sign up to access all features!',
              duration: 3000,
            });
          }}
        >
          Try an Action
        </Button>
      </div>

      {/* Overview Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              <Link href='/dashboard/demo/budget'>Monthly Budget</Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(DEMO_DATA.monthlyBudget)}
            </div>
            <p className='text-xs text-muted-foreground'>
              Total budget for this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              <Link href='/dashboard/demo/transactions'>Spent So Far</Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(DEMO_DATA.totalSpent)}
            </div>
            <p className='text-xs text-muted-foreground'>
              {((DEMO_DATA.totalSpent / DEMO_DATA.monthlyBudget) * 100).toFixed(
                1
              )}
              % of monthly budget
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(DEMO_DATA.monthlyBudget - DEMO_DATA.totalSpent)}
            </div>
            <p className='text-xs text-muted-foreground'>
              Remaining budget this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(DEMO_DATA.currentSavings)}
            </div>
            <p className='text-xs text-muted-foreground'>
              {(
                (DEMO_DATA.currentSavings / DEMO_DATA.savingsGoal) *
                100
              ).toFixed(1)}
              % of goal ({formatCurrency(DEMO_DATA.savingsGoal)})
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className='col-span-4'>
        <CardHeader>
          <CardTitle>
            <Link href='/dashboard/demo/transactions'>Recent Transactions</Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {DEMO_DATA.recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className='flex items-center justify-between p-2 border-b'
              >
                <div>
                  <p className='font-medium'>{transaction.description}</p>
                  <p className='text-sm text-muted-foreground'>
                    {transaction.date} • {transaction.category}
                  </p>
                </div>
                <div
                  className={`font-bold ${
                    transaction.amount < 0 ? 'text-red-500' : 'text-green-500'
                  }`}
                >
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            ))}
          </div>
          <Button
            variant='outline'
            className='w-full mt-4'
            onClick={() => {
              toast({
                title: 'Demo Feature',
                description:
                  'In a real account, you would see all your transactions here.',
                duration: 3000,
              });
            }}
          >
            View All Transactions
          </Button>
        </CardContent>
      </Card>

      {/* Spending by Category */}
      <Card className='col-span-4'>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {DEMO_DATA.spendingByCategory.map((category, index) => (
              <div key={index} className='flex items-center justify-between'>
                <div>{category.category}</div>
                <div className='font-bold'>
                  {formatCurrency(category.amount)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className='pt-6 text-center'>
        <p className='text-sm text-muted-foreground'>
          This is a demo dashboard with sample data.
          <Button
            variant='link'
            size='sm'
            onClick={() => (window.location.href = '/signup')}
          >
            Sign up
          </Button>
          for a real account to track your actual finances.
        </p>
      </div>
    </div>
  );
}
