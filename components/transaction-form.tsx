'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

interface TransactionFormProps {
  onSuccess?: () => void;
  trigger?: React.ReactElement;
}

export function TransactionForm({ onSuccess, trigger }: TransactionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'uncategorized',
  });
  const [categories, setCategories] = useState([]);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCategoryChange = (value: string) => {
    setFormData({ ...formData, category: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description || !formData.amount) {
      toast({
        title: 'Missing information',
        description: 'Please fill out all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Convert amount to number
    const amount = parseFloat(formData.amount);

    if (isNaN(amount)) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast({
          title: 'Authentication error',
          description: 'You must be logged in to add a transaction',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase.from('transactions').insert([
        {
          description: formData.description,
          amount: amount,
          category: formData.category,
          date: new Date().toISOString().split('T')[0],
          user_id: session.user.id,
        },
      ]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Transaction added successfully',
      });

      // Reset form
      setFormData({
        description: '',
        amount: '',
        category: 'uncategorized',
      });

      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error adding transaction:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add transaction',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Transaction</CardTitle>
        <CardDescription>Record a new transaction</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='description'>Description</Label>
            <Input
              id='description'
              name='description'
              value={formData.description}
              onChange={handleInputChange}
              placeholder='Groceries, Rent, etc.'
              required
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='amount'>Amount</Label>
            <Input
              id='amount'
              name='amount'
              type='number'
              step='0.01'
              value={formData.amount}
              onChange={handleInputChange}
              placeholder='100.00'
              required
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='category'>Category</Label>
            <Select
              value={formData.category}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select a category' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='uncategorized'>Uncategorized</SelectItem>
                <SelectItem value='groceries'>Groceries</SelectItem>
                <SelectItem value='dining'>Dining</SelectItem>
                <SelectItem value='utilities'>Utilities</SelectItem>
                <SelectItem value='entertainment'>Entertainment</SelectItem>
                <SelectItem value='transportation'>Transportation</SelectItem>
                {categories.map((category: any) => (
                  <SelectItem
                    key={category.category_id || `cat-${Math.random()}`}
                    value={
                      category.category_id ||
                      category.name ||
                      `category-${Math.random()}`
                    }
                  >
                    {category.category_name || category.name || 'Category'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button type='submit' disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Transaction'}
          </Button>
          {trigger}
        </CardFooter>
      </form>
    </Card>
  );
}
