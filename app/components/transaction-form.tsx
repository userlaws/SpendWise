'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabaseClient';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

interface TransactionFormProps {
  onAddTransaction?: (transaction: any) => Promise<void>;
  onSuccess?: () => Promise<void>;
  trigger?: React.ReactElement;
}

interface Category {
  id?: string;
  category_id?: string;
  category_name?: string;
  name?: string;
}

export function TransactionForm({
  onAddTransaction,
  onSuccess,
  trigger,
}: TransactionFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [transaction, setTransaction] = useState({
    description: '',
    amount: '',
    category: 'uncategorized', // Default non-empty value
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) return;

        const { data } = await supabase
          .from('budget_categories')
          .select('category_id, category_name')
          .eq('user_id', session.user.id);

        if (data) {
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddTransaction) {
      console.error('onAddTransaction function is not provided');
      return;
    }

    try {
      await onAddTransaction({
        description: transaction.description,
        amount: parseFloat(transaction.amount),
        category: transaction.category,
      });

      // Call onSuccess if provided
      if (onSuccess) {
        await onSuccess();
      }

      // Reset form
      setTransaction({
        description: '',
        amount: '',
        category: 'uncategorized', // Reset to default non-empty value
      });
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
    <form onSubmit={handleSubmit} className='space-y-4 p-4 border rounded-lg'>
      <h3 className='text-lg font-medium'>Quick Add Transaction</h3>
      <div className='space-y-2'>
        <Label htmlFor='description'>Description</Label>
        <Input
          id='description'
          value={transaction.description}
          onChange={(e) =>
            setTransaction({ ...transaction, description: e.target.value })
          }
          required
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='amount'>Amount</Label>
        <Input
          id='amount'
          type='number'
          step='0.01'
          value={transaction.amount}
          onChange={(e) =>
            setTransaction({ ...transaction, amount: e.target.value })
          }
          required
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='category'>Category</Label>
        <Select
          value={transaction.category}
          onValueChange={(value: string) =>
            setTransaction({ ...transaction, category: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder='Select a category' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='uncategorized'>Uncategorized</SelectItem>
            <SelectItem value='groceries'>Groceries</SelectItem>
            <SelectItem value='dining'>Dining</SelectItem>
            <SelectItem value='transportation'>Transportation</SelectItem>
            <SelectItem value='entertainment'>Entertainment</SelectItem>
            <SelectItem value='utilities'>Utilities</SelectItem>
            {categories.map((category) => {
              const safeValue =
                category.category_id ||
                category.id ||
                category.name ||
                `category-${Math.random().toString(36).substring(2, 9)}`;
              return (
                <SelectItem key={safeValue} value={safeValue}>
                  {category.category_name || category.name || 'Category'}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      <Button type='submit'>Add Transaction</Button>
      {trigger}
    </form>
  );
}
