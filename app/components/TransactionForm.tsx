import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TransactionFormProps {
  onAddTransaction: (transaction: any) => Promise<void>;
}

interface Category {
  id?: string;
  category_id?: string;
  category_name?: string;
  name?: string;
}

export function TransactionForm({ onAddTransaction }: TransactionFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [transaction, setTransaction] = useState({
    description: '',
    amount: '',
    category: 'uncategorized', // Default value that is not empty
  });

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
    await onAddTransaction({
      description: transaction.description,
      amount: parseFloat(transaction.amount),
      category: transaction.category,
    });

    // Reset form
    setTransaction({
      description: '',
      amount: '',
      category: 'uncategorized', // Reset to default non-empty value
    });
  };

  // Generate a safe value function to ensure no empty strings
  const getSafeValue = (item: any): string => {
    if (item?.category_id) return item.category_id;
    if (item?.id) return item.id;
    if (item?.name) return item.name;
    return `category-${Math.random().toString(36).substring(2, 9)}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Add Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
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
              onValueChange={(value) =>
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
                  const safeValue = getSafeValue(category);
                  const safeLabel =
                    category.category_name || category.name || 'Category';

                  return (
                    <SelectItem
                      key={safeValue}
                      value={safeValue} // Guaranteed to never be empty string
                    >
                      {safeLabel}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <Button type='submit'>Add Transaction</Button>
        </form>
      </CardContent>
    </Card>
  );
}
