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
  Home,
  CreditCard,
  BarChart3,
  User,
  LogOut,
} from 'lucide-react';
import { calculatePercentage, formatCurrency, formatDate } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { usePathname, useRouter } from 'next/navigation';

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
  const { toast } = useToast();
  const pathname = usePathname();
  const router = useRouter();

  // Define routes for navigation
  const routes = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: <Home className='h-5 w-5 mr-2' />,
      active: pathname === '/dashboard',
    },
    {
      href: '/transactions',
      label: 'Transactions',
      icon: <CreditCard className='h-5 w-5 mr-2' />,
      active: pathname === '/transactions',
    },
    {
      href: '/budget',
      label: 'Budget',
      icon: <BarChart3 className='h-5 w-5 mr-2' />,
      active: pathname === '/budget',
    },
    {
      href: '/profile',
      label: 'Profile',
      icon: <User className='h-5 w-5 mr-2' />,
      active: pathname === '/profile',
    },
  ];

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: 'Logged out successfully',
      });
      router.push('/login');
    } catch (error: any) {
      toast({
        title: 'Error logging out',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    }
  };

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
        setTotalBudget(
          formattedCategories.reduce((sum, cat) => sum + cat.budget, 0)
        );
        setTotalSpent(
          formattedCategories.reduce((sum, cat) => sum + cat.spent, 0)
        );
        setRecentTransactions(transactionsList);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Don't show an error toast for new users
        // Initialize with empty data
        setCategories([]);
        setTotalBudget(0);
        setTotalSpent(0);
        setRecentTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  // Calculate other derived values
  const percentSpent = calculatePercentage(totalSpent, totalBudget);
  const isOverBudget = totalSpent > totalBudget;
  const overBudgetCategories = categories.filter(
    (cat) => cat.spent > cat.budget
  );

  return (
    <div className='flex min-h-screen'>
      <aside className='w-64 border-r bg-white dark:bg-gray-950'>
        {/* Logo */}
        <div className='flex items-center gap-2 p-6'>
          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-white font-bold'>
            SW
          </div>
          <span className='text-xl font-semibold text-purple-600'>
            SpendWise
          </span>
        </div>

        {/* Navigation */}
        <nav className='mt-6 px-4'>
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={`flex items-center rounded-md px-3 py-2 text-sm font-medium mb-1 ${
                route.active
                  ? 'bg-purple-100 text-purple-600'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {route.icon}
              {route.label}
            </Link>
          ))}

          {/* Logout Button */}
          <Button
            variant='ghost'
            className='w-full mt-6 flex items-center justify-start text-gray-500 hover:bg-gray-100 hover:text-gray-900'
            onClick={handleLogout}
          >
            <LogOut className='h-5 w-5 mr-2' />
            Logout
          </Button>
        </nav>
      </aside>

      {/* Main content */}
      <div className='flex-1 flex flex-col'>
        <main className='flex-1'>
          <div className='p-6 space-y-6'>
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
              <div>
                <h1 className='text-2xl font-bold'>Dashboard</h1>
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
                        {formatCurrency(Math.max(0, totalBudget - totalSpent))}
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
                      <CardDescription>
                        Your latest spending activity
                      </CardDescription>
                    </div>
                    <Button variant='outline' size='sm' asChild>
                      <Link
                        href='/transactions'
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
                        <p className='text-muted-foreground'>
                          No transactions yet
                        </p>
                        <Button variant='outline' className='mt-2' asChild>
                          <Link href='/transactions'>
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
                              <p className='font-medium'>
                                {transaction.description}
                              </p>
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
              </>
            )}
          </div>
        </main>

        <footer className='border-t py-4 text-center text-sm text-muted-foreground'>
          <p>
            &copy; {new Date().getFullYear()} SpendWise. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
