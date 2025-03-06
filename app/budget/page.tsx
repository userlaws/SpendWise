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
import { Edit, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { DashboardLayout } from '@/components/dashboard-layout';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface BudgetCategory {
  category_id: string;
  category_name: string;
  budget_amount: number;
  spent_amount: number;
  color: string;
  user_id: string;
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
    color: '#6d28d9', // Default purple color to match theme
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

  const handleEditClick = (categoryId: string, currentBudget: number) => {
    setEditingCategory(categoryId);
    setEditValue(currentBudget);
  };

  const handleSaveClick = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('budget_categories')
        .update({ budget_amount: editValue })
        .eq('category_id', categoryId);

      if (error) throw error;

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
        title: 'Error',
        description: 'Failed to update budget. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast({
          title: 'Authentication Error',
          description: 'You must be logged in to add a category.',
          variant: 'destructive',
        });
        return;
      }

      const newCategoryData = {
        category_name: newCategory.name,
        budget_amount: parseFloat(newCategory.budget),
        spent_amount: 0,
        color: newCategory.color,
        user_id: session.user.id,
      };

      const { data, error } = await supabase
        .from('budget_categories')
        .insert([newCategoryData])
        .select();

      if (error) throw error;

      if (data) {
        setCategories([...categories, data[0]]);
      }

      setNewCategory({
        name: '',
        budget: '',
        color: '#6d28d9',
      });
      setIsAddDialogOpen(false);

      toast({
        title: 'Category Added',
        description: 'Your budget category has been added successfully.',
      });
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: 'Error',
        description: 'Failed to add category. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout>
      <div className='p-6 space-y-6'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
          <div>
            <h1 className='text-2xl font-bold'>Budget</h1>
            <p className='text-muted-foreground'>
              Manage your monthly budget allocations
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className='h-4 w-4 mr-2' />
            Add Category
          </Button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {formatCurrency(totalBudget)}
              </div>
              <p className='text-xs text-muted-foreground'>
                Monthly allocation
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {formatCurrency(totalSpent)}
              </div>
              <p className='text-xs text-muted-foreground'>This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>Remaining</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {formatCurrency(totalBudget - totalSpent)}
              </div>
              <Progress
                value={Math.min(100, totalPercentage)}
                className='h-2 mt-2'
                indicatorClassName={
                  totalSpent > totalBudget ? 'bg-destructive' : undefined
                }
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Budget Categories</CardTitle>
            <CardDescription>
              Manage your budget allocations by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='text-center py-10'>Loading budget data...</div>
            ) : categories.length === 0 ? (
              <div className='text-center py-10'>
                <p className='text-muted-foreground mb-4'>
                  No budget categories found
                </p>
                <Button
                  variant='outline'
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  Create Your First Budget Category
                </Button>
              </div>
            ) : (
              <div className='space-y-4'>
                {categories.map((category) => (
                  <div
                    key={category.category_id}
                    className='border rounded-lg p-4'
                  >
                    <div className='flex justify-between items-center mb-2'>
                      <div className='flex items-center'>
                        <div
                          className='w-4 h-4 rounded-full mr-2'
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <h3 className='font-medium'>
                          {category.category_name}
                        </h3>
                      </div>
                      <div className='flex items-center space-x-2'>
                        {editingCategory === category.category_id ? (
                          <>
                            <Input
                              type='number'
                              value={editValue}
                              onChange={(e) =>
                                setEditValue(parseFloat(e.target.value))
                              }
                              className='w-24 h-8'
                            />
                            <Button
                              size='sm'
                              variant='ghost'
                              onClick={() =>
                                handleSaveClick(category.category_id)
                              }
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                          </>
                        ) : (
                          <>
                            <span className='font-medium'>
                              {formatCurrency(category.budget_amount)}
                            </span>
                            <Button
                              size='sm'
                              variant='ghost'
                              onClick={() =>
                                handleEditClick(
                                  category.category_id,
                                  category.budget_amount
                                )
                              }
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className='space-y-1'>
                      <div className='flex justify-between text-sm'>
                        <span className='text-muted-foreground'>
                          {formatCurrency(category.spent_amount)} spent
                        </span>
                        <span
                          className={
                            category.spent_amount > category.budget_amount
                              ? 'text-destructive'
                              : 'text-muted-foreground'
                          }
                        >
                          {calculatePercentage(
                            category.spent_amount,
                            category.budget_amount
                          ).toFixed(0)}
                          % of budget
                        </span>
                      </div>
                      <Progress
                        value={Math.min(
                          100,
                          calculatePercentage(
                            category.spent_amount,
                            category.budget_amount
                          )
                        )}
                        className='h-2'
                        indicatorClassName={
                          category.spent_amount > category.budget_amount
                            ? 'bg-destructive'
                            : undefined
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Budget Category Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className='sm:max-w-[425px]'>
            <DialogHeader>
              <DialogTitle>Add Budget Category</DialogTitle>
              <DialogDescription>
                Create a new budget category to track your spending.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCategory}>
              <div className='grid gap-4 py-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='name'>Category Name</Label>
                  <Input
                    id='name'
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
                  <Label htmlFor='budget'>Monthly Budget</Label>
                  <Input
                    id='budget'
                    type='number'
                    step='0.01'
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
                  <Label htmlFor='color'>Color</Label>
                  <div className='flex items-center space-x-2'>
                    <div
                      className='w-8 h-8 rounded border'
                      style={{ backgroundColor: newCategory.color }}
                    ></div>
                    <Input
                      id='color'
                      type='color'
                      value={newCategory.color}
                      onChange={(e) =>
                        setNewCategory({
                          ...newCategory,
                          color: e.target.value,
                        })
                      }
                      className='w-full h-10'
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type='submit'
                  className='bg-purple-600 hover:bg-purple-700'
                >
                  Save Category
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
