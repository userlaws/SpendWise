'use client'; // Ensure this is at the top to declare the component as a client component

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  ArrowRight,
  DollarSign,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { getTotalBudget, getTotalSpent, mockCategories } from '@/lib/data';
import { calculatePercentage, formatCurrency, formatDate } from '@/lib/utils';
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

  const totalBudget = getTotalBudget();
  const totalSpent = getTotalSpent();
  const percentSpent = calculatePercentage(totalSpent, totalBudget);

  // Find categories that are over budget
  const overBudgetCategories = mockCategories.filter(
    (cat) => cat.spent > cat.budget
  );
  const isOverBudget = totalSpent > totalBudget;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='flex flex-col p-4 md:p-8 gap-6'>
      <div className='flex flex-col md:flex-row items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl md:text-3xl font-bold'>Dashboard</h1>
          <p className='text-muted-foreground'>
            Track your spending and budget at a glance
          </p>
        </div>
        <Button asChild>
          <Link href='/transactions'>Add Transaction</Link>
        </Button>
      </div>

      {isOverBudget && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Budget Alert</AlertTitle>
          <AlertDescription>
            You've exceeded your total monthly budget by{' '}
            {formatCurrency(totalSpent - totalBudget)}.
          </AlertDescription>
        </Alert>
      )}

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Total Budget</CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(totalBudget)}
            </div>
            <p className='text-xs text-muted-foreground'>Monthly allocation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Total Spent</CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(totalSpent)}
            </div>
            <p className='text-xs text-muted-foreground'>This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Remaining</CardTitle>
            <TrendingDown className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(totalBudget - totalSpent)}
            </div>
            <p className='text-xs text-muted-foreground'>Available to spend</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
