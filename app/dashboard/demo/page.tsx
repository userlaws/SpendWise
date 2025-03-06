'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp, DollarSign, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    []
  );
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecentTransactions = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          console.error('No active session found.');
          return; // Exit if no session
        }

        const { data, error } = await supabase
          .from('orders')
          .select(
            `
            order_id,
            products(name, price),
            quantity,
            order_date
          `
          )
          .eq('user_id', session.user.id)
          .order('order_date', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Error fetching orders:', error);
          throw error; // Throw error for further handling
        }

        const formattedTransactions: Transaction[] = data.map((item) => ({
          id: item.order_id,
          description: item.products[0].name, // Accessing the first product's name
          amount: item.products[0].price * item.quantity, // Accessing the first product's price
          category: 'Purchase',
          date: item.order_date,
        }));

        setRecentTransactions(formattedTransactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoading(false); // Ensure loading state is updated
      }
    };

    fetchRecentTransactions();
  }, []);

  // Calculate percentage spent
  const totalBudget = 1500.0;
  const totalSpent = 1117.95;
  const remaining = 382.05;
  const percentSpent = Math.round((totalSpent / totalBudget) * 100);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='mx-auto max-w-6xl space-y-8 p-6'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
          <p className='text-muted-foreground'>
            Track your spending and budget at a glance
          </p>
        </div>
        <Button className='bg-primary hover:bg-primary/90'>
          <Plus className='mr-2 h-4 w-4' />
          Add Transaction
        </Button>
      </div>

      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        <Card className='shadow-sm hover:shadow transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Total Budget
            </CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>${totalBudget.toFixed(2)}</div>
            <p className='text-xs text-muted-foreground mt-1'>
              Monthly allocation
            </p>
          </CardContent>
        </Card>

        <Card className='shadow-sm hover:shadow transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Total Spent
            </CardTitle>
            <ArrowUp className='h-4 w-4 text-destructive' />
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>${totalSpent.toFixed(2)}</div>
            <p className='text-xs text-muted-foreground mt-1'>This month</p>
            <Progress value={percentSpent} className='h-2 mt-4' />
            <p className='text-xs text-muted-foreground mt-1'>
              {percentSpent}% of budget used
            </p>
          </CardContent>
        </Card>

        <Card className='shadow-sm hover:shadow transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Remaining
            </CardTitle>
            <ArrowDown className='h-4 w-4 text-emerald-500' />
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>${remaining.toFixed(2)}</div>
            <p className='text-xs text-muted-foreground mt-1'>
              Available to spend
            </p>
            <div className='mt-4 flex items-center gap-2'>
              <div
                className={`h-2 w-2 rounded-full ${
                  remaining < 200 ? 'bg-destructive' : 'bg-emerald-500'
                }`}
              ></div>
              <p className='text-xs'>
                {remaining < 200 ? 'Low balance warning' : 'Budget on track'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        <Card className='shadow-sm'>
          <CardHeader>
            <CardTitle>Monthly Spending Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {[
                { category: 'Housing', amount: 650, percentage: 43 },
                { category: 'Food', amount: 250, percentage: 17 },
                {
                  category: 'Transportation',
                  amount: 120,
                  percentage: 8,
                },
                {
                  category: 'Entertainment',
                  amount: 97.95,
                  percentage: 7,
                },
              ].map((item) => (
                <div key={item.category} className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <div className='text-sm font-medium'>{item.category}</div>
                    <div className='text-sm font-medium'>
                      ${item.amount.toFixed(2)}
                    </div>
                  </div>
                  <Progress value={item.percentage} className='h-2' />
                  <p className='text-xs text-muted-foreground'>
                    {item.percentage}% of total spent
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className='shadow-sm'>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {[
                {
                  name: 'Grocery Store',
                  date: 'Today',
                  amount: 45.32,
                  category: 'Food',
                },
                {
                  name: 'Gas Station',
                  date: 'Yesterday',
                  amount: 38.65,
                  category: 'Transportation',
                },
                {
                  name: 'Movie Tickets',
                  date: 'Mar 3',
                  amount: 24.0,
                  category: 'Entertainment',
                },
                {
                  name: 'Coffee Shop',
                  date: 'Mar 2',
                  amount: 5.75,
                  category: 'Food',
                },
              ].map((transaction, index) => (
                <div
                  key={index}
                  className='flex items-center justify-between border-b pb-3 last:border-0 last:pb-0'
                >
                  <div className='space-y-1'>
                    <p className='text-sm font-medium'>{transaction.name}</p>
                    <p className='text-xs text-muted-foreground'>
                      {transaction.date} · {transaction.category}
                    </p>
                  </div>
                  <div className='text-sm font-medium'>
                    -${transaction.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
