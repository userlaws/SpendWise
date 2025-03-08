'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

export default function DemoPage() {
  // Sample demo data
  const totalBudget = 1500.0;
  const spentAmount = 1117.95;
  const remainingBudget = 382.05;

  const spendingCategories = [
    { name: 'Housing', amount: 650, percent: 43 },
    { name: 'Food', amount: 250, percent: 17 },
    { name: 'Transportation', amount: 120, percent: 8 },
    { name: 'Entertainment', amount: 97.95, percent: 7 },
  ];

  const recentTransactions = [
    {
      id: 1,
      description: 'Grocery Store',
      category: 'Food',
      amount: 45.32,
      date: new Date(),
    },
    {
      id: 2,
      description: 'Gas Station',
      category: 'Transportation',
      amount: 38.65,
      date: new Date(Date.now() - 86400000),
    },
    {
      id: 3,
      description: 'Movie Tickets',
      category: 'Entertainment',
      amount: 24.0,
      date: new Date(Date.now() - 86400000 * 3),
    },
    {
      id: 4,
      description: 'Coffee Shop',
      category: 'Food',
      amount: 5.75,
      date: new Date(Date.now() - 86400000 * 2),
    },
  ];

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold mb-2'>Dashboard</h1>
        <p className='text-muted-foreground'>
          Track your spending and budget at a glance
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        <Card className='p-4'>
          <h2 className='text-sm font-medium text-muted-foreground mb-2'>
            Total Budget
          </h2>
          <p className='text-2xl font-bold'>${totalBudget.toFixed(2)}</p>
          <p className='text-xs text-muted-foreground'>Monthly allocation</p>
        </Card>

        <Card className='p-4'>
          <h2 className='text-sm font-medium text-muted-foreground mb-2'>
            Total Spent
          </h2>
          <p className='text-2xl font-bold'>${spentAmount.toFixed(2)}</p>
          <div className='w-full h-2 bg-gray-200 rounded-full mt-2'>
            <div
              className='h-full bg-purple-600 rounded-full'
              style={{ width: '75%' }}
            ></div>
          </div>
          <p className='text-xs text-muted-foreground mt-1'>
            75% of budget used
          </p>
        </Card>

        <Card className='p-4'>
          <h2 className='text-sm font-medium text-muted-foreground mb-2'>
            Remaining
          </h2>
          <p className='text-2xl font-bold'>${remainingBudget.toFixed(2)}</p>
          <p className='text-xs text-muted-foreground'>Available to spend</p>
          <p className='text-xs text-green-500 flex items-center mt-1'>
            <span className='inline-block w-2 h-2 rounded-full bg-green-500 mr-1'></span>
            Budget on track
          </p>
        </Card>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <h2 className='text-xl font-semibold mb-4'>
            Monthly Spending Breakdown
          </h2>
          <Card className='p-4'>
            {spendingCategories.map((category, index) => (
              <div key={index} className='mb-4 last:mb-0'>
                <div className='flex justify-between mb-1'>
                  <span>{category.name}</span>
                  <span>${category.amount.toFixed(2)}</span>
                </div>
                <div className='w-full h-2 bg-gray-200 rounded-full'>
                  <div
                    className='h-full bg-purple-600 rounded-full'
                    style={{ width: `${category.percent}%` }}
                  ></div>
                </div>
                <p className='text-xs text-gray-500 mt-1'>
                  {category.percent}% of total spent
                </p>
              </div>
            ))}
          </Card>
        </div>

        <div>
          <h2 className='text-xl font-semibold mb-4'>Recent Transactions</h2>
          <div className='space-y-3'>
            {recentTransactions.map((transaction) => (
              <Card key={transaction.id} className='p-3'>
                <div className='flex justify-between'>
                  <div>
                    <p className='font-medium'>{transaction.description}</p>
                    <p className='text-sm text-gray-500'>
                      {transaction.date.getTime() ===
                      new Date().setHours(0, 0, 0, 0)
                        ? 'Today'
                        : transaction.date.toLocaleDateString() ===
                          new Date(Date.now() - 86400000).toLocaleDateString()
                        ? 'Yesterday'
                        : `${new Date(
                            transaction.date
                          ).toLocaleDateString()}`}{' '}
                      · {transaction.category}
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='font-medium text-red-500'>
                      -${transaction.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className='text-center mt-6'>
        <Link href='/login'>
          <Button variant='outline'>Exit Demo</Button>
        </Link>
      </div>
    </div>
  );
}
