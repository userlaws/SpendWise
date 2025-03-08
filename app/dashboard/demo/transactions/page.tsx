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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Edit, Plus, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

// Demo transactions
const initialTransactions = [
  {
    id: '1',
    description: 'Grocery Store',
    amount: -45.32,
    category: 'Food',
    date: new Date().toISOString(),
  },
  {
    id: '2',
    description: 'Gas Station',
    amount: -38.65,
    category: 'Transportation',
    date: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    description: 'Movie Tickets',
    amount: -24.0,
    category: 'Entertainment',
    date: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: '4',
    description: 'Coffee Shop',
    amount: -5.75,
    category: 'Food',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: '5',
    description: 'Monthly Salary',
    amount: 2000.0,
    category: 'Income',
    date: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: '6',
    description: 'Restaurant',
    amount: -62.5,
    category: 'Food',
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: '7',
    description: 'Internet Bill',
    amount: -59.99,
    category: 'Utilities',
    date: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

// Demo categories
const demoCategories = [
  { id: '1', name: 'Food' },
  { id: '2', name: 'Transportation' },
  { id: '3', name: 'Entertainment' },
  { id: '4', name: 'Utilities' },
  { id: '5', name: 'Income' },
  { id: '6', name: 'Shopping' },
  { id: '7', name: 'Housing' },
];

export default function DemoTransactionsPage() {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const { toast } = useToast();

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || transaction.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddDialogOpen(false);
    toast({
      title: 'Transaction Added',
      description: 'Your new transaction has been added successfully (demo).',
    });
  };

  const handleEditTransaction = (transaction: any) => {
    setEditingTransaction(transaction);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditDialogOpen(false);
    toast({
      title: 'Transaction Updated',
      description: 'Your transaction has been updated successfully (demo).',
    });
    setEditingTransaction(null);
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // This is just for demonstration - in a real app, we would fetch actual data
        console.log('Demo mode: Simulating transaction fetch');
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };
    fetchTransactions();
  }, []);

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
                  <Input id='description' placeholder='Coffee Shop' required />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='amount'>Amount</Label>
                  <Input
                    id='amount'
                    type='number'
                    step='0.01'
                    placeholder='12.50'
                    required
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='date'>Date</Label>
                  <Input
                    id='date'
                    type='date'
                    defaultValue={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='category'>Category</Label>
                  <Select defaultValue={demoCategories[0].name}>
                    <SelectTrigger>
                      <SelectValue placeholder='Select a category' />
                    </SelectTrigger>
                    <SelectContent>
                      {demoCategories.map((category) => (
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

        {/* Edit Transaction Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
              <DialogDescription>
                Update the details of your transaction.
              </DialogDescription>
            </DialogHeader>
            {editingTransaction && (
              <form onSubmit={handleSaveEdit}>
                <div className='grid gap-4 py-4'>
                  <div className='grid gap-2'>
                    <Label htmlFor='edit-description'>Description</Label>
                    <Input
                      id='edit-description'
                      defaultValue={editingTransaction.description}
                      required
                    />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='edit-amount'>Amount</Label>
                    <Input
                      id='edit-amount'
                      type='number'
                      step='0.01'
                      defaultValue={Math.abs(editingTransaction.amount)}
                      required
                    />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='edit-date'>Date</Label>
                    <Input
                      id='edit-date'
                      type='date'
                      defaultValue={
                        new Date(editingTransaction.date)
                          .toISOString()
                          .split('T')[0]
                      }
                      required
                    />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='edit-category'>Category</Label>
                    <Select defaultValue={editingTransaction.category}>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a category' />
                      </SelectTrigger>
                      <SelectContent>
                        {demoCategories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type='submit'>Update Transaction</Button>
                </DialogFooter>
              </form>
            )}
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
                {demoCategories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className='text-right'>Amount</TableHead>
                  <TableHead className='w-[50px]'></TableHead>
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
                      <TableCell
                        className={`text-right font-medium ${
                          transaction.amount < 0
                            ? 'text-red-500'
                            : 'text-green-500'
                        }`}
                      >
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => handleEditTransaction(transaction)}
                        >
                          <Edit className='h-4 w-4' />
                          <span className='sr-only'>Edit</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className='text-center text-sm text-muted-foreground'>
        <p>
          This is a demo page. Data shown here is for demonstration purposes
          only.
        </p>
      </div>
    </div>
  );
}
