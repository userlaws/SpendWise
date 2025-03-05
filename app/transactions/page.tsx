'use client';

import { useState, useEffect } from 'react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Edit, Plus, Search, Trash } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

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

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
  });

  const { toast } = useToast();

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

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*');

        if (categoriesError) throw categoriesError;

        if (categoriesData) {
          setCategories(categoriesData);
        }

        // Fetch transactions
        const { data: transactionsData, error: transactionsError } =
          await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', session.user.id)
            .order('date', { ascending: false });

        if (transactionsError) throw transactionsError;

        if (transactionsData) {
          setTransactions(transactionsData);
        }
      } catch (error) {
        console.error('Error fetching transactions data:', error);
        toast({
          title: 'Error loading transactions',
          description:
            'Failed to load your transactions. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactionsData();
  }, [toast]);

  // Filter transactions based on search and category
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
          title: 'Not authenticated',
          description: 'Please log in to add transactions',
          variant: 'destructive',
        });
        return;
      }

      const amount = parseFloat(newTransaction.amount);

      if (isNaN(amount)) {
        toast({
          title: 'Invalid amount',
          description: 'Please enter a valid number for the amount',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: session.user.id,
            description: newTransaction.description,
            amount,
            date: newTransaction.date,
            category: newTransaction.category,
          },
        ])
        .select();

      if (error) throw error;

      if (data) {
        // Update local state with the new transaction
        setTransactions([data[0], ...transactions]);

        // Reset form
        setNewTransaction({
          description: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          category: '',
        });

        setIsAddDialogOpen(false);

        toast({
          title: 'Transaction added',
          description: 'Your transaction has been added successfully.',
        });
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: 'Error adding transaction',
        description: 'Failed to add your transaction. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className='flex flex-col p-4 md:p-8 gap-6'>
      <div className='flex flex-col md:flex-row items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl md:text-3xl font-bold'>Transactions</h1>
          <p className='text-muted-foreground'>
            View and manage your spending history
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Transaction</DialogTitle>
              <DialogDescription>
                Enter the details of your new transaction.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddTransaction}>
              <div className='grid gap-4 py-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='description'>Description</Label>
                  <Input
                    id='description'
                    placeholder='Grocery shopping'
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
                    placeholder='50.00'
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
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select a category' />
                    </SelectTrigger>
                    <SelectContent>
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
                <Button type='submit'>Save Transaction</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            Browse and filter your past transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col md:flex-row gap-4 mb-6'>
            <div className='relative flex-1'>
              <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search transactions...'
                className='pl-8'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className='w-full md:w-[180px]'>
                <SelectValue placeholder='All Categories' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className='text-center py-8'>
              <p>Loading your transactions...</p>
            </div>
          ) : (
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className='text-right'>Amount</TableHead>
                    <TableHead className='w-[100px]'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className='text-center py-6 text-muted-foreground'
                      >
                        No transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell className='font-medium'>
                          {transaction.description}
                        </TableCell>
                        <TableCell>
                          <span className='inline-flex items-center rounded-full px-2.5 py-0.5 text-xs bg-muted'>
                            {transaction.category}
                          </span>
                        </TableCell>
                        <TableCell className='text-right font-medium'>
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell>
                          <div className='flex space-x-1'>
                            <Button variant='ghost' size='icon'>
                              <Edit className='h-4 w-4' />
                              <span className='sr-only'>Edit</span>
                            </Button>
                            <Button variant='ghost' size='icon'>
                              <Trash className='h-4 w-4' />
                              <span className='sr-only'>Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
