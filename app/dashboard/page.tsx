'use client';

import React, { useState, useEffect } from 'react';
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
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  DollarSign,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import {
  calculatePercentage,
  formatCurrency,
  formatDate,
  getSafeSelectValue,
} from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { TransactionForm } from '@/components/transaction-form';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

interface BudgetCategory {
  id: string;
  name: string;
  budget: number;
  spent: number;
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    []
  );
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [remainingBudget, setRemainingBudget] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session) {
          console.error('No active session found');
          window.location.href = '/login';
          return;
        }

        // Initialize with empty data
        let formattedCategories: BudgetCategory[] = [];
        let transactionsList: Transaction[] = [];

        // Try to fetch budget categories
        try {
          const { data: budgetData, error: budgetError } = await supabase
            .from('budget_categories')
            .select('*')
            .eq('user_id', session.user.id);

          // Only process if we successfully get data
          if (!budgetError && budgetData) {
            formattedCategories = budgetData.map((item) => ({
              id: item.category_id,
              name: item.category_name,
              budget: item.budget_amount || 0,
              spent: item.spent_amount || 0,
            }));
          }
        } catch (error) {
          console.log('Budget categories table may not exist yet');
          // Just continue with empty array
        }

        // Try to fetch transactions
        try {
          const { data: transactionsData, error: transactionsError } =
            await supabase
              .from('transactions')
              .select('*')
              .eq('user_id', session.user.id)
              .order('date', { ascending: false })
              .limit(5);

          // Only process if we successfully get data
          if (!transactionsError && transactionsData) {
            transactionsList = transactionsData.map((item) => ({
              id: item.id,
              description: item.description,
              amount: item.amount,
              category: item.category,
              date: item.date,
            }));
          }
        } catch (error) {
          console.log('Transactions table may not exist yet');
          // Just continue with empty array
        }

        // Set the state with whatever data we have
        setCategories(formattedCategories);

        // Calculate totals based on the fetched data
        const calculatedTotalBudget = formattedCategories.reduce(
          (sum, cat) => sum + cat.budget,
          0
        );
        const calculatedTotalSpent = formattedCategories.reduce(
          (sum, cat) => sum + cat.spent,
          0
        );

        setTotalBudget(calculatedTotalBudget);
        setTotalSpent(calculatedTotalSpent);
        setRemainingBudget(calculatedTotalBudget - calculatedTotalSpent);
        setRecentTransactions(transactionsList);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Don't show an error toast for new users
        // Initialize with empty data
        setCategories([]);
        setTotalBudget(0);
        setTotalSpent(0);
        setRemainingBudget(0);
        setRecentTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate other derived values
  const percentSpent = calculatePercentage(totalSpent, totalBudget);
  const isOverBudget = totalSpent > totalBudget;
  const overBudgetCategories = categories.filter(
    (cat) => cat.spent > cat.budget
  );

  const handleAddTransaction = async (newTransaction) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast({
          title: 'Error',
          description: 'You must be logged in to add transactions.',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase
        .from('transactions')
        .insert([
          {
            ...newTransaction,
            user_id: session.user.id,
            date: new Date().toISOString().split('T')[0], // Use current date if not specified
          },
        ])
        .select();

      if (error) {
        console.error('Error adding transaction:', error);
        toast({
          title: 'Error',
          description: `Failed to add transaction: ${error.message}`,
          variant: 'destructive',
        });
        return;
      }

      // Add the new transaction to the recent transactions list
      if (data && data[0]) {
        const newTransactionWithId = {
          id: data[0].id,
          description: data[0].description,
          amount: data[0].amount,
          category: data[0].category,
          date: data[0].date,
        };

        setRecentTransactions([
          newTransactionWithId,
          ...recentTransactions.slice(0, 4),
        ]);
      }

      // Update category spent amount if the transaction has a category
      if (newTransaction.category) {
        const category = categories.find(
          (cat) => cat.name === newTransaction.category
        );
        if (category) {
          // Update the spent amount in the database
          await supabase
            .from('budget_categories')
            .update({
              spent_amount: category.spent + newTransaction.amount,
            })
            .eq('category_id', category.id);

          // Update local state
          setCategories(
            categories.map((cat) =>
              cat.id === category.id
                ? { ...cat, spent: cat.spent + newTransaction.amount }
                : cat
            )
          );
        }
      }

      // Update total spent and remaining budget
      const newAmount = newTransaction.amount || 0;
      setTotalSpent((prevTotal) => prevTotal + newAmount);
      setRemainingBudget((prevRemaining) => prevRemaining - newAmount);

      toast({
        title: 'Transaction Added',
        description: 'Your transaction has been added successfully.',
      });
    } catch (error: any) {
      console.error('Error in add transaction:', error);
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold'>Dashboard</h1>
          <p className='text-muted-foreground'>
            Track your spending and budget at a glance
          </p>
        </div>
        <Button asChild>
          <Link href='/dashboard/transactions'>Add Transaction</Link>
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

      {isLoading ? (
        <div className='flex justify-center py-8'>
          <p>Loading your dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Budget Overview Cards */}
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Budget
                </CardTitle>
                <DollarSign className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {formatCurrency(totalBudget)}
                </div>
                <p className='text-xs text-muted-foreground'>
                  Your total budget for this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Spent
                </CardTitle>
                {isOverBudget ? (
                  <TrendingUp className='h-4 w-4 text-destructive' />
                ) : (
                  <TrendingDown className='h-4 w-4 text-primary' />
                )}
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {formatCurrency(totalSpent)}
                </div>
                <p className='text-xs text-muted-foreground'>
                  {percentSpent.toFixed(0)}% of monthly budget used
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Remaining Budget
                </CardTitle>
                <DollarSign className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {formatCurrency(remainingBudget)}
                </div>
                <Progress
                  value={Math.min(100, percentSpent)}
                  className='h-2 mt-2'
                  indicatorClassName={
                    isOverBudget ? 'bg-destructive' : undefined
                  }
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Categories
                </CardTitle>
                <span className='text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full'>
                  {categories.length} Total
                </span>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {overBudgetCategories.length}
                </div>
                <p className='text-xs text-muted-foreground'>
                  {overBudgetCategories.length > 0
                    ? `${overBudgetCategories.length} categories are over budget`
                    : 'All categories within budget'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest spending activity</CardDescription>
              </div>
              <Button variant='outline' size='sm' asChild>
                <Link
                  href='/dashboard/transactions'
                  className='flex items-center gap-1'
                >
                  View All
                  <ArrowRight className='h-4 w-4' />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <div className='text-center py-6'>
                  <p className='text-muted-foreground'>No transactions yet</p>
                  <Button variant='outline' className='mt-2' asChild>
                    <Link href='/dashboard/transactions'>
                      Add Your First Transaction
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className='space-y-4'>
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className='flex items-center justify-between border-b pb-3'
                    >
                      <div>
                        <p className='font-medium'>{transaction.description}</p>
                        <p className='text-sm text-muted-foreground'>
                          {formatDate(transaction.date)} ·{' '}
                          {transaction.category}
                        </p>
                      </div>
                      <div
                        className={
                          transaction.amount < 0
                            ? 'text-destructive font-medium'
                            : 'text-green-600 font-medium'
                        }
                      >
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <TransactionForm onAddTransaction={handleAddTransaction} />
        </>
      )}
    </div>
  );
}
