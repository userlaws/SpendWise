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
import { Progress } from '@/components/ui/progress';
import { calculatePercentage, formatCurrency } from '@/lib/utils';
import { Edit, Save, PlusCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
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

interface BudgetCategory {
  id: string;
  user_id: string;
  category_id: string;
  category_name: string;
  budget_amount: number;
  spent_amount: number;
  color?: string;
}

export default function BudgetPage() {
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    budget: '',
    color: '#3b82f6', // Default color
  });

  const { toast } = useToast();

  // Calculate totals
  const totalBudget = categories.reduce(
    (sum, cat) => sum + cat.budget_amount,
    0
  );
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent_amount, 0);
  const totalPercentage = calculatePercentage(totalSpent, totalBudget);

  // Fetch budget categories
  useEffect(() => {
    const fetchBudgetData = async () => {
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

        // Fetch budget categories
        const { data, error } = await supabase
          .from('budget_categories')
          .select('*')
          .eq('user_id', session.user.id);

        if (error) throw error;

        if (data) {
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching budget data:', error);
        toast({
          title: 'Error loading budget',
          description:
            'Failed to load your budget data. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBudgetData();
  }, [toast]);

  // Handle editing a category budget
  const handleEditClick = (categoryId: string, currentBudget: number) => {
    setEditingCategory(categoryId);
    setEditValue(currentBudget);
  };

  // Save edited budget
  const handleSaveClick = async (categoryId: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast({
          title: 'Not authenticated',
          description: 'Please log in to update your budget',
          variant: 'destructive',
        });
        return;
      }

      // Update in Supabase
      const { error } = await supabase
        .from('budget_categories')
        .update({ budget_amount: editValue })
        .eq('category_id', categoryId)
        .eq('user_id', session.user.id);

      if (error) throw error;

      // Update local state
      setCategories(
        categories.map((cat) =>
          cat.category_id === categoryId
            ? { ...cat, budget_amount: editValue }
            : cat
        )
      );

      setEditingCategory(null);

      toast({
        title: 'Budget Updated',
        description: 'Your budget has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating budget:', error);
      toast({
        title: 'Error updating budget',
        description: 'Failed to update your budget. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  // Add new budget category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast({
          title: 'Not authenticated',
          description: 'Please log in to add a budget category',
          variant: 'destructive',
        });
        return;
      }

      const budgetAmount = parseFloat(newCategory.budget);

      if (isNaN(budgetAmount)) {
        toast({
          title: 'Invalid budget',
          description: 'Please enter a valid number for the budget',
          variant: 'destructive',
        });
        return;
      }

      // Generate a unique ID for the new category
      const categoryId = `cat_${Date.now()}`;

      // Add to Supabase
      const { data, error } = await supabase
        .from('budget_categories')
        .insert([
          {
            user_id: session.user.id,
            category_id: categoryId,
            category_name: newCategory.name,
            budget_amount: budgetAmount,
            spent_amount: 0,
            color: newCategory.color,
          },
        ])
        .select();

      if (error) throw error;

      if (data) {
        // Update local state
        setCategories([...categories, data[0]]);

        // Reset form
        setNewCategory({
          name: '',
          budget: '',
          color: '#3b82f6',
        });

        setIsAddDialogOpen(false);

        toast({
          title: 'Category added',
          description: 'Your new budget category has been added successfully.',
        });
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: 'Error adding category',
        description:
          'Failed to add your budget category. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className='flex flex-col p-4 md:p-8 gap-6'>
      <div className='flex flex-col md:flex-row items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl md:text-3xl font-bold'>Budget Settings</h1>
          <p className='text-muted-foreground'>
            Manage your monthly spending limits
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className='mr-2 h-4 w-4' />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Budget Category</DialogTitle>
              <DialogDescription>
                Create a new budget category to track your spending.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCategory}>
              <div className='grid gap-4 py-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='category-name'>Category Name</Label>
                  <Input
                    id='category-name'
                    placeholder='e.g., Groceries, Entertainment'
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory({
                        ...newCategory,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='budget-amount'>Monthly Budget</Label>
                  <Input
                    id='budget-amount'
                    type='number'
                    step='0.01'
                    placeholder='e.g., 500.00'
                    value={newCategory.budget}
                    onChange={(e) =>
                      setNewCategory({
                        ...newCategory,
                        budget: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='category-color'>Color</Label>
                  <div className='flex gap-2'>
                    <Input
                      id='category-color'
                      type='color'
                      value={newCategory.color}
                      onChange={(e) =>
                        setNewCategory({
                          ...newCategory,
                          color: e.target.value,
                        })
                      }
                      className='w-12 h-10 p-1 cursor-pointer'
                    />
                    <div className='flex-1'>
                      <div
                        className='w-full h-10 rounded-md border'
                        style={{ backgroundColor: newCategory.color }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type='submit'>Save Category</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className='text-center py-8'>
          <p>Loading your budget data...</p>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Monthly Budget Overview</CardTitle>
              <CardDescription>
                Your total budget and spending progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>Total Budget</span>
                  <span className='text-sm font-medium'>
                    {formatCurrency(totalSpent)} of{' '}
                    {formatCurrency(totalBudget)}
                  </span>
                </div>
                <Progress
                  value={totalPercentage}
                  className='h-2'
                  indicatorClassName={
                    totalPercentage > 90
                      ? 'bg-destructive'
                      : totalPercentage > 75
                      ? 'bg-secondary'
                      : ''
                  }
                />
                <p className='text-xs text-muted-foreground mt-1'>
                  {totalPercentage >= 100
                    ? "You've exceeded your total budget"
                    : `${(100 - totalPercentage).toFixed(
                        0
                      )}% of your budget remaining`}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category Budgets</CardTitle>
              <CardDescription>
                Set spending limits for each category
              </CardDescription>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <div className='text-center py-6'>
                  <p className='text-muted-foreground'>
                    No budget categories yet
                  </p>
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    variant='outline'
                    className='mt-2'
                  >
                    Add Your First Budget Category
                  </Button>
                </div>
              ) : (
                <div className='space-y-6'>
                  {categories.map((category) => {
                    const percentage = calculatePercentage(
                      category.spent_amount,
                      category.budget_amount
                    );
                    const isOverBudget =
                      category.spent_amount > category.budget_amount;

                    return (
                      <div key={category.category_id} className='space-y-2'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <div
                              className='w-3 h-3 rounded-full'
                              style={{
                                backgroundColor: category.color || '#3b82f6',
                              }}
                            />
                            <span className='font-medium'>
                              {category.category_name}
                            </span>
                          </div>

                          <div className='flex items-center gap-2'>
                            {editingCategory === category.category_id ? (
                              <>
                                <div className='flex items-center gap-2'>
                                  <Input
                                    type='number'
                                    value={editValue}
                                    onChange={(e) =>
                                      setEditValue(Number(e.target.value))
                                    }
                                    className='w-24 h-8'
                                  />
                                  <Button
                                    size='icon'
                                    variant='ghost'
                                    onClick={() =>
                                      handleSaveClick(category.category_id)
                                    }
                                  >
                                    <Save className='h-4 w-4' />
                                    <span className='sr-only'>Save</span>
                                  </Button>
                                </div>
                              </>
                            ) : (
                              <>
                                <span
                                  className={
                                    isOverBudget
                                      ? 'text-destructive font-medium'
                                      : ''
                                  }
                                >
                                  {formatCurrency(category.spent_amount)} /{' '}
                                  {formatCurrency(category.budget_amount)}
                                </span>
                                <Button
                                  size='icon'
                                  variant='ghost'
                                  onClick={() =>
                                    handleEditClick(
                                      category.category_id,
                                      category.budget_amount
                                    )
                                  }
                                >
                                  <Edit className='h-4 w-4' />
                                  <span className='sr-only'>Edit</span>
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        <Progress
                          value={percentage}
                          className='h-2'
                          indicatorClassName={
                            isOverBudget ? 'bg-destructive' : ''
                          }
                        />

                        <div className='flex justify-between text-xs text-muted-foreground'>
                          <span>
                            {isOverBudget
                              ? `Exceeded by ${formatCurrency(
                                  category.spent_amount - category.budget_amount
                                )}`
                              : `${formatCurrency(
                                  category.budget_amount - category.spent_amount
                                )} remaining`}
                          </span>
                          <span>{percentage.toFixed(0)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
