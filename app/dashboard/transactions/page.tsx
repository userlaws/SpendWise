'use client'; // Ensure this is at the top to declare the component as a client component

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Edit, Plus, Save, X } from 'lucide-react';
import { TransactionForm } from '@/components/transaction-form';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState<string | null>(
    null
  );
  const [editValue, setEditValue] = useState<string>('');
  const { toast } = useToast();

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        console.error('No active session found');
        window.location.href = '/login';
        return;
      }

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transactions',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleEditClick = (transactionId: string, currentAmount: number) => {
    setEditingTransaction(transactionId);
    // Remove negative sign for UI display if it's an expense
    setEditValue(Math.abs(currentAmount).toString());
  };

  const handleSaveClick = async (transactionId: string, isExpense: boolean) => {
    try {
      const numericValue = parseFloat(editValue);

      if (isNaN(numericValue) || numericValue <= 0) {
        toast({
          title: 'Invalid amount',
          description: 'Please enter a valid amount greater than zero',
          variant: 'destructive',
        });
        return;
      }

      // Apply negative sign if it's an expense
      const finalAmount = isExpense
        ? -Math.abs(numericValue)
        : Math.abs(numericValue);

      // Update the transaction in Supabase
      const { error } = await supabase
        .from('transactions')
        .update({ amount: finalAmount })
        .eq('id', transactionId);

      if (error) throw error;

      // Update the local state
      setTransactions(
        transactions.map((transaction) =>
          transaction.id === transactionId
            ? { ...transaction, amount: finalAmount }
            : transaction
        )
      );

      // Reset editing state
      setEditingTransaction(null);

      toast({
        title: 'Transaction Updated',
        description: 'The transaction amount has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to update transaction',
        variant: 'destructive',
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold'>Transactions</h1>
          <p className='text-muted-foreground'>
            View and manage your transactions
          </p>
        </div>

        <TransactionForm onSuccess={fetchTransactions} />
      </div>

      {isLoading ? (
        <div className='flex justify-center py-8'>
          <p>Loading transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-10'>
            <p className='text-muted-foreground mb-4'>No transactions found</p>
            <TransactionForm
              onSuccess={fetchTransactions}
              trigger={
                <Button>
                  <Plus className='mr-2 h-4 w-4' /> Add Your First Transaction
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
            <CardDescription>
              Showing {transactions.length} transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className='flex justify-between items-center p-3 border-b last:border-0'
                >
                  <div>
                    <p className='font-medium'>{transaction.description}</p>
                    <div className='flex gap-2 text-sm text-muted-foreground'>
                      <span>{formatDate(transaction.date)}</span>
                      <span>•</span>
                      <span>{transaction.category}</span>
                    </div>
                  </div>

                  {editingTransaction === transaction.id ? (
                    <div className='flex items-center gap-2'>
                      <span className='text-sm font-medium mr-1'>
                        {transaction.amount < 0 ? '-$' : '$'}
                      </span>
                      <Input
                        type='number'
                        step='0.01'
                        min='0'
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className='w-24 h-8 text-right'
                        autoFocus
                      />
                      <Button
                        size='icon'
                        variant='ghost'
                        onClick={() =>
                          handleSaveClick(
                            transaction.id,
                            transaction.amount < 0
                          )
                        }
                        className='h-8 w-8'
                      >
                        <Save className='h-4 w-4' />
                      </Button>
                      <Button
                        size='icon'
                        variant='ghost'
                        onClick={handleCancelEdit}
                        className='h-8 w-8'
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                  ) : (
                    <div className='flex items-center gap-2'>
                      <div
                        className={`font-medium ${
                          transaction.amount < 0
                            ? 'text-red-500'
                            : 'text-green-500'
                        }`}
                      >
                        {formatCurrency(transaction.amount)}
                      </div>
                      <Button
                        size='icon'
                        variant='ghost'
                        onClick={() =>
                          handleEditClick(transaction.id, transaction.amount)
                        }
                        className='h-8 w-8'
                      >
                        <Edit className='h-4 w-4' />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
