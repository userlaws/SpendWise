'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

interface BudgetCategoryFormProps {
  isDemo?: boolean;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function BudgetCategoryForm({
  isDemo = false,
  onSuccess,
  trigger,
}: BudgetCategoryFormProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    budget: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.budget) {
      toast({
        title: 'Missing information',
        description: 'Please fill out all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Convert budget to number
    const budgetAmount = parseFloat(formData.budget);

    if (isNaN(budgetAmount) || budgetAmount <= 0) {
      toast({
        title: 'Invalid budget',
        description: 'Please enter a valid budget amount',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Demo mode just simulates success
      if (isDemo) {
        setTimeout(() => {
          setIsLoading(false);
          setOpen(false);
          toast({
            title: 'Category added',
            description:
              'Your budget category has been added successfully (demo)',
          });
          resetForm();
          if (onSuccess) onSuccess();
        }, 800);
        return;
      }

      // Get the current user session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No active session');
      }

      // Add budget category to the database
      const { error } = await supabase.from('budget_categories').insert([
        {
          user_id: session.user.id,
          category_name: formData.name,
          budget_amount: budgetAmount,
          spent_amount: 0, // Initialize with 0 spent
        },
      ]);

      if (error) throw error;

      toast({
        title: 'Category added',
        description: 'Your budget category has been added successfully',
      });

      setOpen(false);
      resetForm();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: 'Error',
        description: 'Failed to add budget category',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      budget: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className='mr-2 h-4 w-4' /> Add Budget Category
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Add Budget Category</DialogTitle>
          <DialogDescription>
            Create a new budget category to track your spending
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Category Name</Label>
            <Input
              id='name'
              name='name'
              value={formData.name}
              onChange={handleInputChange}
              placeholder='e.g. Groceries'
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='budget'>Monthly Budget Amount</Label>
            <div className='flex items-center'>
              <span className='mr-2'>$</span>
              <Input
                id='budget'
                name='budget'
                type='number'
                step='0.01'
                min='0'
                value={formData.budget}
                onChange={handleInputChange}
                placeholder='0.00'
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
