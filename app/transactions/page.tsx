'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Edit,
  Plus,
  Search,
  Home,
  CreditCard,
  BarChart3,
  User,
  LogOut,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  user_id: string;
}

interface Category {
  id: string;
  name: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const pathname = usePathname();
  const router = useRouter();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
  });

  const { toast } = useToast();

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

  // Fetch transactions and categories
  useEffect(() => {
    const fetchTransactionsData = async () => {
      try {
        setIsLoading(true);

        // Get user session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session) {
          console.error('No active session found');
          window.location.href = '/login';
          return;
        }

        // Default categories to use if we can't fetch from database
        const defaultCategories = [
          { id: 'groceries', name: 'Groceries' },
          { id: 'dining', name: 'Dining' },
          { id: 'transportation', name: 'Transportation' },
          { id: 'entertainment', name: 'Entertainment' },
          { id: 'health', name: 'Health' },
          { id: 'utilities', name: 'Utilities' },
          { id: 'shopping', name: 'Shopping' },
        ];

        // Try to fetch categories, use defaults if table doesn't exist
        try {
          const { data: categoriesData, error: categoriesError } =
            await supabase.from('categories').select('*');

          // If there's an error or no data, use the defaults
          if (
            categoriesError ||
            !categoriesData ||
            categoriesData.length === 0
          ) {
            setCategories(defaultCategories);
          } else {
            setCategories(categoriesData);
          }
        } catch (error) {
          console.log('Using default categories');
          setCategories(defaultCategories);
        }

        // Try to fetch transactions
        try {
          const { data: transactionsData, error: transactionsError } =
            await supabase
              .from('transactions')
              .select('*')
              .eq('user_id', session.user.id)
              .order('date', { ascending: false });

          if (transactionsError) {
            // If the transactions table doesn't exist yet, just set empty array
            setTransactions([]);
          } else if (transactionsData) {
            setTransactions(transactionsData);
          }
        } catch (error) {
          // Just use empty array for transactions
          setTransactions([]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Don't show error toast for new users, just set defaults
        setCategories([
          { id: 'groceries', name: 'Groceries' },
          { id: 'dining', name: 'Dining' },
          { id: 'transportation', name: 'Transportation' },
          { id: 'entertainment', name: 'Entertainment' },
          { id: 'health', name: 'Health' },
          { id: 'utilities', name: 'Utilities' },
          { id: 'shopping', name: 'Shopping' },
        ]);
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactionsData();
  }, [toast]);

  // Filter transactions based on search term and category
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || transaction.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Handle adding a new transaction
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast({
          title: 'Authentication Error',
          description: 'You must be logged in to add a transaction.',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase.from('transactions').insert([
        {
          description: newTransaction.description,
          amount: parseFloat(newTransaction.amount),
          date: newTransaction.date,
          category: newTransaction.category,
          user_id: session.user.id,
        },
      ]);

      if (error) throw error;

      toast({
        title: 'Transaction Added',
        description: 'Your transaction has been added successfully.',
      });

      // Refresh transactions
      const { data: updatedData, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;
      if (updatedData) setTransactions(updatedData);

      // Reset form and close dialog
      setNewTransaction({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: '',
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to add transaction. Please try again.',
        variant: 'destructive',
      });
    }
  };

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
                <h1 className='text-2xl font-bold'>Transactions</h1>
                <p className='text-muted-foreground'>
                  Manage and track your financial transactions
                </p>
              </div>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className='h-4 w-4 mr-2' />
                Add Transaction
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  View and filter your transaction history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='flex flex-col md:flex-row gap-4 mb-6'>
                  <div className='relative flex-1'>
                    <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                    <Input
                      type='search'
                      placeholder='Search transactions...'
                      className='pl-8'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className='w-full md:w-[200px]'>
                      <SelectValue placeholder='All Categories' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Categories</SelectItem>
                      <SelectItem value='Groceries'>Groceries</SelectItem>
                      <SelectItem value='Dining'>Dining</SelectItem>
                      <SelectItem value='Transportation'>
                        Transportation
                      </SelectItem>
                      <SelectItem value='Entertainment'>
                        Entertainment
                      </SelectItem>
                      <SelectItem value='Health'>Health</SelectItem>
                      <SelectItem value='Utilities'>Utilities</SelectItem>
                      <SelectItem value='Shopping'>Shopping</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {isLoading ? (
                  <div className='text-center py-10'>
                    Loading transactions...
                  </div>
                ) : filteredTransactions.length === 0 ? (
                  <div className='text-center py-10'>
                    <p className='text-muted-foreground mb-4'>
                      No transactions found
                    </p>
                    <Button
                      variant='outline'
                      onClick={() => setIsAddDialogOpen(true)}
                    >
                      Add Your First Transaction
                    </Button>
                  </div>
                ) : (
                  <div className='rounded-md border'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className='text-right'>Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTransactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell className='font-medium'>
                              {transaction.description}
                            </TableCell>
                            <TableCell>{transaction.category}</TableCell>
                            <TableCell>
                              {formatDate(transaction.date)}
                            </TableCell>
                            <TableCell
                              className={
                                transaction.amount < 0
                                  ? 'text-destructive text-right'
                                  : 'text-green-600 text-right'
                              }
                            >
                              {formatCurrency(transaction.amount)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader>
                  <DialogTitle>Add Transaction</DialogTitle>
                  <DialogDescription>
                    Enter the details of your transaction below.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddTransaction}>
                  <div className='grid gap-4 py-4'>
                    <div className='grid gap-2'>
                      <Label htmlFor='description'>Description</Label>
                      <Input
                        id='description'
                        value={newTransaction.description}
                        onChange={(e) =>
                          setNewTransaction({
                            ...newTransaction,
                            description: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className='grid gap-2'>
                      <Label htmlFor='amount'>Amount</Label>
                      <Input
                        id='amount'
                        type='number'
                        step='0.01'
                        value={newTransaction.amount}
                        onChange={(e) =>
                          setNewTransaction({
                            ...newTransaction,
                            amount: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className='grid gap-2'>
                      <Label htmlFor='date'>Date</Label>
                      <Input
                        id='date'
                        type='date'
                        value={newTransaction.date}
                        onChange={(e) =>
                          setNewTransaction({
                            ...newTransaction,
                            date: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className='grid gap-2'>
                      <Label htmlFor='category'>Category</Label>
                      <Select
                        value={newTransaction.category}
                        onValueChange={(value) =>
                          setNewTransaction({
                            ...newTransaction,
                            category: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select a category' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='Groceries'>Groceries</SelectItem>
                          <SelectItem value='Dining'>Dining</SelectItem>
                          <SelectItem value='Transportation'>
                            Transportation
                          </SelectItem>
                          <SelectItem value='Entertainment'>
                            Entertainment
                          </SelectItem>
                          <SelectItem value='Health'>Health</SelectItem>
                          <SelectItem value='Utilities'>Utilities</SelectItem>
                          <SelectItem value='Shopping'>Shopping</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type='submit'>Add Transaction</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
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
